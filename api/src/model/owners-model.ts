import { ResponseData } from '..';
import { pool } from './db-pool';

export const getOwnersByProjectId = async (
  id: string,
): Promise<ResponseData<any[]>> => {
  return await pool
    .query(
      `
      SELECT
        users.user_id as id,
        users.name as name,
        users.discord_id as discord_id
      FROM ownership
        INNER JOIN users on ownership.user_id = users.user_id
      WHERE ownership.project_id=$1;
      `,
      [id],
    )
    .then((results) => {
      if (results?.rows) {
        return {
          success: true,
          data: results.rows,
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
