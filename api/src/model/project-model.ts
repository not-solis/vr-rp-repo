import { PoolClient } from 'pg';
import { makeTransaction, pool } from './db-pool';
import { User, UserRole } from './users-model';
import { RoleplayLink, updateRoleplayLinks } from './roleplay-links-model';
import { createOwnership } from './owners-model';

const DEFAULT_QUERY_LIMIT = 1000;

export interface RoleplayProject {
  id: string;
  name: string;
  owner?: User;
  lastUpdated: Date;
  imageUrl?: string;
  shortDescription?: string;
  description?: string;
  setting?: string;
  tags?: string[];
  runtime?: string;
  status?: string;
  entryProcess?: string;
  applicationProcess?: string;
  hasSupportingCast?: boolean;
  isMetaverse?: boolean;
  isQuestCompatible?: boolean;
  discordUrl?: string;
  otherLinks?: RoleplayLink[];
}

export const getProjects = async (
  start = 0,
  limit = DEFAULT_QUERY_LIMIT,
  sortBy = 'name',
  name = '',
  tags: string[] = [],
  asc = true,
  activeOnly = false,
) => {
  // using limit + 1 to see if there are any remaining
  const queryParams: (string | number)[] = [start, limit + 1];
  const addedQueryParams: (string | number)[] = [];
  const where = [];
  if (name) {
    sortBy = `levenshtein_less_equal(LOWER('${name}'), LOWER(roleplay_projects.name), 1, 20, 9, 50)`;
    asc = true;
  }

  const hasTags = tags && tags.length > 0;
  if (hasTags) {
    addedQueryParams.push(`{${tags.map((t) => `"${t}"`).join(',')}}`);
    where.push(`tags @> $${addedQueryParams.length + queryParams.length}`);
  }

  if (activeOnly) {
    where.push("status = 'Active'");
  }

  const queryString = `
      SELECT roleplay_projects.*,
      users.user_id as owner_id,
      users.name as owner_name,
      users.role as owner_role,
      array_agg(
        json_build_object(
          'label', roleplay_links.label,
          'url', roleplay_links.url
        )
      ) filter (where roleplay_links.url is not null) as other_links
      FROM roleplay_projects
        LEFT JOIN ownership ON (ownership.project_id = roleplay_projects.id AND ownership.active)
        LEFT JOIN users on users.user_id = ownership.user_id
        LEFT JOIN roleplay_links ON roleplay_projects.id = roleplay_links.project_id
      ${where.length > 0 ? `WHERE ${where.join(' AND ')} ` : ''}
      GROUP BY roleplay_projects.id, users.user_id
      ORDER BY ${sortBy} ${asc ? 'ASC' : 'DESC'}
      ${name || sortBy === 'name' ? '' : ', roleplay_projects.name ASC'}
      OFFSET $1 LIMIT $2;
      `;

  return await pool
    .query(queryString, queryParams.concat(addedQueryParams))
    .then((results) => {
      const { rows, rowCount } = results;
      if (rows && rowCount !== null) {
        if (rowCount > limit) {
          rows.pop();
        }
        return {
          hasNext: rowCount > limit,
          data: rows,
          nextCursor: start + limit,
        };
      } else {
        throw new Error('No results found.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const getProjectById = async (id: string) => {
  return await pool
    .query(
      `
      SELECT
        roleplay_projects.*,
        users.user_id as owner_id,
        users.name as owner_name,
        users.role as owner_role
      FROM roleplay_projects
        LEFT JOIN ownership ON (ownership.project_id = roleplay_projects.id AND ownership.active)
        LEFT JOIN users on users.user_id = ownership.user_id
      WHERE roleplay_projects.id=$1
      ;
      `,
      [id],
    )
    .then((results) => {
      if (results?.rows) {
        return {
          data: results.rows[0],
        };
      } else {
        throw new Error('No results found.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const createProject = async (user: User, project: RoleplayProject) => {
  const {
    name,
    shortDescription,
    description,
    setting,
    runtime,
    tags,
    status,
    entryProcess,
    applicationProcess,
    hasSupportingCast,
    isMetaverse,
    isQuestCompatible,
    discordUrl,
    imageUrl,
    otherLinks = [],
  } = project;
  const { user_id, role } = user;
  return await new Promise((resolve, reject) => {
    makeTransaction((client: PoolClient) => {
      client
        .query(
          `
          INSERT INTO roleplay_projects
          (name,
          short_description,
          description,
          setting,
          runtime,
          tags,
          status,
          entry_process,
          application_process,
          has_support_cast,
          is_metaverse,
          is_quest_compatible,
          discord_url,
          image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING id;
          `,
          [
            name,
            shortDescription,
            description,
            setting,
            runtime,
            tags,
            status,
            entryProcess,
            applicationProcess,
            hasSupportingCast,
            isMetaverse,
            isQuestCompatible,
            discordUrl,
            imageUrl,
          ],
        )
        .then((results) => {
          if (!results?.rowCount) {
            reject(new Error('Create project failed.'));
          }

          const newProject = results.rows[0];
          const projectId = newProject.id;

          const queries = [];
          if (role === UserRole.User) {
            queries.push(createOwnership(projectId, user_id, true));
          }

          if (otherLinks.length > 0) {
            client
              .query(
                `
                  INSERT INTO roleplay_links (label, url, project_id)
                  SELECT
                    (rp_link->>'label')::varchar as label,
                    (rp_link->>'url')::varchar as url,
                    $2 as project_id
                  FROM UNNEST($1::json[]) as rp_link;
                  `,
                [otherLinks, projectId],
              )
              .then((results) => {
                if (!results.rowCount) {
                  throw new Error('Error saving links');
                }
              })
              .catch(console.error);
          }

          return Promise.all(queries)
            .then(() => resolve({ id: projectId }))
            .catch(reject);
        })
        .catch(reject);
    }, reject);
  });
  // TODO: update runtimes
};

export const updateProject = async (id: string, project: RoleplayProject) => {
  const {
    name,
    shortDescription,
    description,
    setting,
    runtime,
    tags,
    status,
    entryProcess,
    applicationProcess,
    hasSupportingCast,
    isMetaverse,
    isQuestCompatible,
    discordUrl,
    imageUrl,
    otherLinks = [],
  } = project;
  return await new Promise((resolve, reject) => {
    makeTransaction((client: PoolClient) => {
      client
        .query(
          `
          UPDATE roleplay_projects
          SET
          name=$1,
          short_description=$2,
          description=$3,
          setting=$4,
          runtime=$5
          tags=$6,
          status=$7,
          entry_process=$8,
          application_process=$9,
          has_support_cast=$10,
          is_metaverse=$11,
          is_quest_compatible=$12,
          discord_url=$13,
          image_url=$14
          WHERE id=$15
          RETURNING id;
          `,
          [
            name,
            shortDescription,
            description,
            setting,
            runtime,
            tags,
            status,
            entryProcess,
            applicationProcess,
            hasSupportingCast,
            isMetaverse,
            isQuestCompatible,
            discordUrl,
            imageUrl,
            id,
          ],
        )
        .then((results) => {
          if (!results?.rowCount) {
            throw new Error('Update project failed.');
          }

          updateRoleplayLinks(id, otherLinks).then(resolve).catch(reject);
        })
        .catch(reject);
    }, reject);
  });
};
