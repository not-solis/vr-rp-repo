import { pool } from './db-pool.js';
import { remapUser, User } from './users-model.js';

export const getOwnerByProjectId = async (
  id: string,
): Promise<User | undefined> => {
  return await pool
    .query(
      `
      SELECT
        users.*
      FROM ownership
        INNER JOIN users on ownership.user_id = users.user_id
      WHERE ownership.project_id=$1 AND ownership.active;
      `,
      [id],
    )
    .then((results) => (results?.rows ? remapUser(results.rows[0]) : undefined))
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const getPendingOwnersByProjectId = async (
  id: string,
): Promise<User[]> => {
  return await pool
    .query(
      `
      SELECT
        users.*
      FROM ownership
        INNER JOIN users on ownership.user_id = users.user_id
      WHERE ownership.project_id=$1 AND NOT ownership.active;
      `,
      [id],
    )
    .then((results) => results?.rows?.map(remapUser) ?? [])
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const createOwnership = async (
  projectId: string,
  userId: string,
  active: boolean = false,
): Promise<unknown> => {
  return await pool
    .query(
      'INSERT INTO ownership (user_id, project_id, active) VALUES ($1, $2, $3) RETURNING *;',
      [userId, projectId, active],
    )
    .then((results) => {
      if (!results.rowCount) {
        throw new Error('Error creating ownership record.');
      }
      return undefined;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const grantOwnership = async (
  projectId: string,
  userId: string,
): Promise<unknown> => {
  return await pool
    .query(
      'UPDATE ownership SET active=true WHERE project_id=$1 AND user_id=$2;',
      [projectId, userId],
    )
    .then((results) => {
      if (!results.rowCount) {
        throw new Error('Error granting ownership.');
      }
      return undefined;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const rejectOwnership = async (
  projectId: string,
  userId: string,
): Promise<unknown> => {
  return await pool
    .query('DELETE FROM ownership WHERE project_id=$1 AND user_id=$2;', [
      projectId,
      userId,
    ])
    .then((results) => {
      if (!results.rowCount) {
        throw new Error('Error deleting from ownership.');
      }
      return undefined;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};
