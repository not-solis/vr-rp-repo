import { PageData } from '../data/PageData.js';
import { pool } from './db-pool.js';
import { RoleplayProject } from './project-model.js';
import { remapUser, User } from './users-model.js';

const DEFAULT_QUERY_LIMIT = 1000;

interface Update {
  id: string;
  user: User;
  project?: RoleplayProject;
  text: string;
  created: Date;
}

export const getUpdates = async (
  projectId?: string,
  userId?: string,
  start: number = 0,
  limit: number = DEFAULT_QUERY_LIMIT,
) => {
  return await pool
    .query(
      `SELECT
        users.*,
        updates.*,
        roleplay_projects.name as project_name,
        roleplay_projects.url_name as project_url_name,
        roleplay_projects.image_url as project_image_url
      FROM updates
        INNER JOIN users ON updates.user_id = users.user_id
        LEFT JOIN roleplay_projects ON updates.project_id = roleplay_projects.id
      WHERE
        ($1::uuid IS NULL OR updates.project_id=$1)
        AND ($2::uuid IS NULL OR updates.user_id=$2)
        AND users.role != 'Banned'
        AND (roleplay_projects.status IS NULL OR roleplay_projects.status != 'Deleted')
      ORDER BY created DESC
      OFFSET $3 LIMIT $4`,
      [projectId, userId, start, limit + 1],
    )
    .then((results) => {
      if (results?.rows) {
        const { rows, rowCount } = results;
        if (rowCount! > limit) {
          rows.pop();
        }
        return {
          hasNext: rowCount! > limit,
          data: rows.map((row) => ({
            id: row.id,
            project: row.project_id
              ? {
                  id: row.project_id,
                  name: row.project_name,
                  urlName: row.project_url_name,
                  imageUrl: row.project_image_url,
                }
              : undefined,
            user: remapUser(row),
            text: row.update_text,
            created: row.created,
          })),
          nextCursor: start + limit,
        } as PageData<Update, number>;
      } else {
        throw new Error('Get updates failed.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};

export const postUpdate = async (
  text: string,
  userId: string,
  projectId?: string,
): Promise<Update[]> => {
  return await pool
    .query(
      `INSERT INTO updates (user_id, project_id, update_text)
      VALUES ($1, $2, $3)
      RETURNING id`,
      [userId, projectId, text],
    )
    .then((results) => {
      if (results?.rows) {
        return results.rows[0].id;
      } else {
        throw new Error('Post update failed.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
