import { ResponseData } from '../index.js';
import { pool } from './db-pool.js';
import { User } from './users-model.js';

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
      WHERE ownership.project_id=$1 AND ownership.active;
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
  userId: string,
  active: boolean = false,
): Promise<ResponseData<User>> => {
  return await pool
    .query(
      'INSERT INTO ownership (user_id, project_id, active) VALUES ($1, $2, $3) RETURNING *;',
      [userId, projectId, active],
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
