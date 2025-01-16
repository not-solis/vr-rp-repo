import { pool } from "./db-pool.js";

export const getOwnersByProjectId = async (id) => {
  try {
    return await new Promise((resolve, reject) => {
      pool.query(
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
        (error, results) => {
          if (error) {
            reject(error);
          }

          if (results?.rows) {
            resolve({
              data: results.rows,
            });
          } else {
            reject(new Error('No results found.'));
          }
        }
      );
    });
  } catch (err) {
    console.error(err);
    throw new Error('Internal server error.');
  }
};