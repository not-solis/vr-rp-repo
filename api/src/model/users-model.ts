import { pool } from './db-pool.js';

export enum UserRole {
  User = 'User',
  Admin = 'Admin',
  Banned = 'Banned',
}

export interface User {
  userId: string;
  name: string;
  imageUrl?: string;
  role: UserRole;
  discordId?: string;
}

export const remapUser = (user: any): User => {
  return {
    userId: user.user_id,
    name: user.name,
    imageUrl: user.image_url,
    role: user.role,
    discordId: user.discord_id,
  };
};

export const getUserById = async (id: string) => {
  return await pool
    .query(
      `
      SELECT
        user_id,
        name,
        image_url,
        role
      FROM users
      WHERE user_id=$1`,
      [id],
    )
    .then((results) => {
      if (results?.rows) {
        return remapUser(results.rows[0]);
      } else {
        throw new Error('No user found by id.');
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const getUserByDiscordId = async (
  id: string,
): Promise<User | undefined> => {
  return await pool
    .query(
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
    )
    .then((results) => {
      const success = !!results?.rows;
      return success ? remapUser(results.rows[0]) : undefined;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const createUser = async (
  id: string,
  name: string,
  imageUrl: string,
): Promise<User> => {
  return await pool
    .query(
      `
      INSERT INTO users (discord_id, name, image_url)
      VALUES ($1, $2, $3)
      RETURNING user_id, name, image_url, role
      `,
      [id, name, imageUrl],
    )
    .then((results) => {
      const { rows, rowCount } = results;
      if (rows && rowCount) {
        return results.rows[0];
      } else {
        throw new Error('No records inserted.');
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const updateUserName = async (id: string, name: string) => {
  return await pool
    .query('UPDATE users SET name=$1 WHERE user_id=$2 RETURNING name', [
      name,
      id,
    ])
    .then((results) => {
      if (results?.rowCount) {
        return results.rows[0].name;
      } else {
        throw new Error('Username update failed.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};

export const updateUserImageUrl = async (id: string, imageUrl: string) => {
  return await pool
    .query(
      'UPDATE users SET image_url=$1 WHERE user_id=$2 RETURNING image_url',
      [imageUrl, id],
    )
    .then((results) => {
      if (results?.rowCount) {
        return results.rows[0].image_url;
      } else {
        throw new Error('Username update failed.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
