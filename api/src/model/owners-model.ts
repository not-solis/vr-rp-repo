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
      FROM roleplay_projects
        INNER JOIN users on roleplay_projects.owner = users.user_id
      WHERE roleplay_projects.id=$1;
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
