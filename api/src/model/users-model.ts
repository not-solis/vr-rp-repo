import { pool } from './db-pool';

enum Role {
  User = 'User',
  Admin = 'Admin',
}

export interface User {
  user_id: string;
  name: string;
  image_url?: string;
  role: Role;
}

export const getUserByDiscordId = async (
  id: string,
): Promise<{ data?: User }> => {
  try {
    return await new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          user_id,
          name,
          image_url,
          role
        FROM users
        WHERE discord_id=$1;
        `,
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          }

          const { rows, rowCount } = results;
          if (rows && rowCount) {
            resolve({
              data: results.rows[0],
            });
          } else {
            // Resolve empty to properly handle a miss
            resolve({ data: undefined });
          }
        },
      );
    });
  } catch (err) {
    console.error(err);
    throw new Error('Internal server error.');
  }
};

export const createUser = async (
  id: string,
  name: string,
  imageUrl: string,
): Promise<{ data: User }> => {
  try {
    return await new Promise((resolve, reject) => {
      pool.query(
        `
        INSERT INTO users (discord_id, name, image_url)
        VALUES ($1, $2, $3)
        RETURNING user_id, name, image_url, role
        `,
        [id, name, imageUrl],
        (error, results) => {
          if (error) {
            reject(error);
          }

          const { rows, rowCount } = results;
          if (rows && rowCount) {
            resolve({
              data: results.rows[0],
            });
          } else {
            reject(new Error('No records inserted.'));
          }
        },
      );
    });
  } catch (err) {
    console.error(err);
    throw new Error('Internal server error.');
  }
};
