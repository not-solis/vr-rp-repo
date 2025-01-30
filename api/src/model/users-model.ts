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
  email: string;
  discordId?: string;
  googleId?: string;
}

export const remapUser = (user: any): User => {
  return {
    userId: user.user_id,
    name: user.name,
    imageUrl: user.image_url,
    role: user.role,
    email: user.email,
    discordId: user.discord_id,
    googleId: user.google_id,
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

export const getUserByEmail = async (
  email: string,
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
      WHERE email=$1;
      `,
      [email],
    )
    .then((results) => {
      const success = results?.rows[0];
      return success ? remapUser(results.rows[0]) : undefined;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
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
      const success = results?.rows[0];
      return success ? remapUser(results.rows[0]) : undefined;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const getUserByGoogleId = async (
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
      WHERE google_id=$1;
      `,
      [id],
    )
    .then((results) => {
      const success = results?.rows[0];
      return success ? remapUser(results.rows[0]) : undefined;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const createUser = async (
  name: string,
  imageUrl: string,
  idType: string,
  id: string,
  email: string,
): Promise<User> => {
  return await pool
    .query(
      `
      INSERT INTO users (${idType}, name, image_url, email)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, discord_id, google_id
      `,
      [id, name, imageUrl, email],
    )
    .then((results) => {
      const { rows, rowCount } = results;
      if (rows && rowCount) {
        return remapUser(results.rows[0]);
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

export const updateDiscordId = async (id: string, discordId: string) => {
  return await pool
    .query(
      'UPDATE users SET discord_id=$1 WHERE user_id=$2 RETURNING discord_id',
      [discordId, id],
    )
    .then((results) => {
      if (results?.rowCount) {
        return results.rows[0].discordId;
      } else {
        throw new Error('Discord ID update failed.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};

export const updateGoogleId = async (id: string, googleId: string) => {
  return await pool
    .query(
      'UPDATE users SET google_id=$1 WHERE user_id=$2 RETURNING google_id',
      [googleId, id],
    )
    .then((results) => {
      if (results?.rowCount) {
        return results.rows[0].googleId;
      } else {
        throw new Error('Google ID update failed.');
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
