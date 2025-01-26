import { ResponseData } from '../index.js';
import { pool } from './db-pool.js';

export enum UserRole {
  User = 'User',
  Admin = 'Admin',
  Banned = 'Banned',
}

export interface User {
  user_id: string;
  name: string;
  image_url?: string;
  role: UserRole;
  discord_id?: string;
}

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
        return results.rows[0] as User;
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
): Promise<ResponseData<User>> => {
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
      return {
        success,
        data: success ? results.rows[0] : undefined,
      };
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
): Promise<ResponseData<User>> => {
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
        return {
          success: true,
          data: results.rows[0],
        };
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
