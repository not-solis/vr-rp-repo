import { ResponseData } from '..';
import { pool } from './db-pool';
import { User } from './users-model';

export const getOwnerByProjectId = async (
  id: string,
): Promise<ResponseData<User>> => {
  return await pool
    .query(
      `
      SELECT
        users.user_id as user_id,
        users.name as name,
        users.discord_id as discord_id
      FROM ownership
        INNER JOIN users on ownership.user_id = users.user_id
      WHERE ownership.project_id=$1 AND NOT ownership.pending;
      `,
      [id],
    )
    .then((results) => {
      return {
        success: true,
        data: results?.rows ? results.rows[0] : undefined,
      };
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const createOwnership = async (
  projectId: string,
  user: User,
  pending: boolean = true,
): Promise<ResponseData<User>> => {
  return await pool
    .query(
      'INSERT INTO ownership (user_id, project_id, pending) VALUES ($1, $2, $3) RETURNING *;',
      [user.user_id, projectId, pending],
    )
    .then((results) => {
      if (!results.rowCount) {
        throw new Error('Error creating ownership record.');
      }
      return {
        success: true,
      };
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};
