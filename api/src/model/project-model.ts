import { PoolClient } from 'pg';
import { makeTransaction, pool } from './db-pool.js';
import { User, UserRole } from './users-model.js';
import { RoleplayLink, updateRoleplayLinks } from './roleplay-links-model.js';
import { createOwnership } from './owners-model.js';
import { PageData } from '../data/PageData.js';

const DEFAULT_QUERY_LIMIT = 1000;

export interface RoleplayProject {
  id: string;
  name: string;
  urlName: string;
  owner?: User;
  lastUpdated?: Date;
  imageUrl?: string;
  shortDescription?: string;
  description?: string;
  setting?: string;
  tags?: string[];
  runtime?: string;
  started?: Date;
  status?: string;
  entryProcess?: string;
  applicationProcess?: string;
  hasSupportingCast?: boolean;
  isMetaverse?: boolean;
  isQuestCompatible?: boolean;
  discordUrl?: string;
  otherLinks?: RoleplayLink[];
}

const remapRoleplayProject = (project: any): RoleplayProject => {
  return {
    id: project.id,
    name: project.name,
    urlName: project.url_name,
    owner: project.owner_id
      ? {
          id: project.owner_id,
          name: project.owner_name,
          role: project.owner_role,
          email: project.owner_email,
          oauthEmail: project.owner_oauth_email,
        }
      : undefined,
    lastUpdated: new Date(project.last_updated),
    imageUrl: project.image_url,
    shortDescription: project.short_description,
    description: project.description,
    setting: project.setting,
    tags: project.tags,
    runtime: project.runtime,
    started: project.started && new Date(project.started),
    status: project.status,
    entryProcess: project.entry_process,
    applicationProcess: project.application_process,
    hasSupportingCast: project.has_support_cast,
    isMetaverse: project.is_metaverse,
    isQuestCompatible: project.is_quest_compatible,
    discordUrl: project.discord_url,
    otherLinks: project.other_links,
  };
};

const validSortByKeys = new Set([
  'name',
  'last_updated',
  'created_at',
  'started',
]);

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
  const where = ["roleplay_projects.status != 'Deleted'"];
  if (name) {
    addedQueryParams.push(name);
    sortBy = `levenshtein_less_equal(LOWER($3), LOWER(roleplay_projects.name), 0, 20, 9, 50)`;
    asc = true;
  } else {
    if (!validSortByKeys.has(sortBy)) {
      throw new Error('Invalid sort key.');
    }
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
      users.email as owner_email,
      array_agg(
        json_build_object(
          'label', roleplay_links.label,
          'url', roleplay_links.url
        )
      ) filter (where roleplay_links.url is not null) as other_links
      FROM roleplay_projects
        LEFT JOIN ownership ON (ownership.project_id = roleplay_projects.id AND ownership.active)
        LEFT JOIN users on (users.user_id = ownership.user_id and users.role != 'Banned')
        LEFT JOIN roleplay_links ON roleplay_projects.id = roleplay_links.project_id
      ${where.length > 0 ? `WHERE ${where.join(' AND ')} ` : ''}
      GROUP BY roleplay_projects.id, users.user_id
      ORDER BY ${sortBy} ${asc ? 'ASC' : 'DESC'} NULLS LAST
      ${!name && sortBy === 'name' ? '' : ', roleplay_projects.name ASC'}
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
          data: rows.map(remapRoleplayProject),
          nextCursor: start + limit,
        } as PageData<RoleplayProject>;
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
  return internalGetProject('id', id);
};

export const getProjectByUrlName = async (urlName: string) => {
  return internalGetProject('url_name', urlName);
};

const internalGetProject = async (field: string, value: string) => {
  return await pool
    .query(
      `
      SELECT
        roleplay_projects.*,
        users.user_id as owner_id,
        users.name as owner_name,
        users.role as owner_role,
        users.email as owner_email
      FROM roleplay_projects
        LEFT JOIN ownership ON (ownership.project_id = roleplay_projects.id AND ownership.active)
        LEFT JOIN users on (users.user_id = ownership.user_id and users.role != 'Banned')
      WHERE roleplay_projects.${field}=$1 AND roleplay_projects.status != 'Deleted'
      ;
      `,
      [value],
    )
    .then((results) => {
      if (results?.rows) {
        return remapRoleplayProject(results.rows[0]);
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
    started,
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
  const { id: userId, role } = user;
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
          started,
          tags,
          status,
          entry_process,
          application_process,
          has_support_cast,
          is_metaverse,
          is_quest_compatible,
          discord_url,
          image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          RETURNING id, url_name;
          `,
          [
            name,
            shortDescription,
            description,
            setting,
            runtime,
            started,
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
          const { id: projectId, url_name: urlName } = newProject;

          const queries = [];
          if (role === UserRole.User) {
            queries.push(createOwnership(projectId, userId, true));
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
            .then(() => resolve(urlName))
            .catch(reject);
        })
        .catch(reject);
    }, reject);
  });
};

export const updateProject = async (id: string, project: RoleplayProject) => {
  const {
    name,
    shortDescription,
    description,
    setting,
    runtime,
    started,
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
          runtime=$5,
          started=$6,
          tags=$7,
          status=$8,
          entry_process=$9,
          application_process=$10,
          has_support_cast=$11,
          is_metaverse=$12,
          is_quest_compatible=$13,
          discord_url=$14,
          image_url=$15
          WHERE id=$16
          RETURNING url_name;
          `,
          [
            name,
            shortDescription,
            description,
            setting,
            runtime,
            started,
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

          updateRoleplayLinks(id, otherLinks)
            .then(() => resolve(results.rows[0].url_name))
            .catch(reject);
        })
        .catch(reject);
    }, reject);
  });
};

export const getImageUrlByProjectId = async (id: string) => {
  return await pool
    .query(
      "SELECT image_url FROM roleplay_projects WHERE id=$1 AND status != 'Deleted'",
      [id],
    )
    .then((results) => {
      if (!results?.rowCount) {
        throw new Error('Failed to retrieve image URL');
      }

      return results.rows[0].image_url;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const deleteProject = async (id: string) => {
  return await pool
    .query(
      "UPDATE roleplay_projects SET status='Deleted' WHERE id=$1 RETURNING id",
      [id],
    )
    .then((results) => {
      if (!results?.rowCount) {
        throw new Error('Failed to delete project');
      }

      return results.rows[0].id;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};
