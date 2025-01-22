import { PoolClient } from 'pg';
import { makeTransaction, pool } from './db-pool';
import { User, UserRole } from './users-model';
import { RoleplayLink, updateRoleplayLinks } from './roleplay-links-model';

const DEFAULT_QUERY_LIMIT = 1000;

export interface RoleplayProject {
  id: string;
  name: string;
  owners?: User[];
  lastUpdated: Date;
  imageUrl?: string;
  shortDescription?: string;
  description?: string;
  setting?: string;
  tags?: string[];
  runtime?: Date[];
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
  try {
    // TODO: implement proper filters
    return await new Promise((resolve, reject) => {
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
      array_agg(
        json_build_object(
          'id', users.user_id,
          'name', users.name
        )
      ) FILTER (WHERE users.user_id IS NOT NULL) AS owners,
      array_agg(
        json_build_object(
          'label', roleplay_links.label,
          'url', roleplay_links.url
        )
      ) filter (where roleplay_links.url is not null) as other_links
      FROM roleplay_projects
        LEFT JOIN ownership ON roleplay_projects.id = ownership.project_id
        LEFT JOIN users ON ownership.user_id = users.user_id
        left join roleplay_links on roleplay_projects.id = roleplay_links.project_id
      ${where.length > 0 ? `WHERE ${where.join(' AND ')} ` : ''}
      GROUP BY roleplay_projects.id
      ORDER BY ${sortBy} ${asc ? 'ASC' : 'DESC'}
      ${name || sortBy === 'name' ? '' : ', roleplay_projects.name ASC'}
      OFFSET $1 LIMIT $2;
      `;

      pool.query(
        queryString,
        queryParams.concat(addedQueryParams), // using limit + 1 to see if there are any remaining
        (error, results) => {
          if (error) {
            reject(error);
          }

          const { rows, rowCount } = results;
          if (rows && rowCount !== null) {
            if (rowCount > limit) {
              rows.pop();
            }
            resolve({
              hasNext: rowCount > limit,
              data: rows,
              nextCursor: start + limit,
            });
          } else {
            reject(new Error('No results found.'));
          }
        },
      );
    });
  } catch (err) {
    console.error(err);
    throw new Error('Internal server error.');
  }
};

export const getProjectById = async (id: string) => {
  try {
    return await new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM roleplay_projects WHERE id=$1',
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          }

          if (results?.rows) {
            resolve({
              data: results.rows[0],
            });
          } else {
            reject(new Error('No results found.'));
          }
        },
      );
    });
  } catch (err) {
    console.error(err);
    throw new Error('Internal server error.');
  }
};

export const createProject = async (user: User, project: RoleplayProject) => {
  const {
    name,
    shortDescription,
    description,
    setting,
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
            tags,
            status,
            entry_process,
            application_process,
            has_support_cast,
            is_metaverse,
            is_quest_compatible,
            discord_url,
            image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id;
            `,
          [
            name,
            shortDescription,
            description,
            setting,
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
            queries.push(
              client
                .query(
                  `
                    INSERT INTO ownership
                    (user_id, project_id) VALUES ($1, $2)
                    `,
                  [user_id, projectId],
                )
                .then((results) => {
                  if (!results.rowCount) {
                    return Promise.reject(new Error('Error saving ownership.'));
                  }
                })
                .catch(console.error),
            );
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
                  return Promise.reject(new Error('Error saving links'));
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
          tags=$5,
          status=$6,
          entry_process=$7,
          application_process=$8,
          has_support_cast=$9,
          is_metaverse=$10,
          is_quest_compatible=$11,
          discord_url=$12,
          image_url=$13
          WHERE id=$14
          RETURNING id;
          `,
          [
            name,
            shortDescription,
            description,
            setting,
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
            return Promise.reject(new Error('Update project failed.'));
          }

          updateRoleplayLinks(id, otherLinks).then(resolve).catch(reject);
        })
        .catch(reject);
    }, reject);
  });
};
