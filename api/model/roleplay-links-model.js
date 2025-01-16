import { pool } from './db-pool.js';

export const getRoleplayLinksByProjectId = async (id) => {
  try {
    return await new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          roleplay_links.label as label,
          roleplay_links.url as url
        FROM roleplay_links
          INNER JOIN roleplay_projects on roleplay_links.project_id = roleplay_projects.id
        WHERE roleplay_links.project_id=$1;
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
