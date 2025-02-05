import { pool } from './db-pool.js';

export enum UserRole {
  User = 'User',
  Admin = 'Admin',
  Banned = 'Banned',
}

export interface User {
  id: string;
  name: string;
  imageUrl?: string;
  role: UserRole;
  email: string;
  oauthEmail: string;
  discordId?: string;
  googleId?: string;
  twitchId?: string;
}

export const remapUser = (user: any): User => {
  return {
    id: user.user_id,
    name: user.name,
    imageUrl: user.image_url,
    role: user.role,
    email: user.email,
    oauthEmail: user.oauth_email,
    discordId: user.discord_id,
    googleId: user.google_id,
    twitchId: user.twitch_id,
  };
};

export const getAdmins = async () => {
  return await pool
    .query(
      `
      SELECT
        user_id,
        name,
        image_url,
        role,
        email,
        oauth_email,
        discord_id,
        google_id,
        twitch_id
      FROM users
      WHERE role='Admin'
      ORDER BY created_at ASC`,
    )
    .then((results) => {
      if (results?.rows) {
        return results.rows.map(remapUser);
      } else {
        throw new Error('No user found by id.');
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const getUserById = async (id: string) => {
  return await pool
    .query(
      `
      SELECT
        user_id,
        name,
        image_url,
        role,
        email,
        oauth_email,
        discord_id,
        google_id,
        twitch_id
      FROM users
      WHERE user_id=$1`,
      [id],
    )
    .then((results) => {
      if (results?.rowCount) {
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

export const upsertUser = async (
  name: string,
  imageUrl: string,
  idType: string,
  id: string,
  email: string,
): Promise<{ user: User; isNew: boolean }> => {
  return await pool
    .query(
      `
      INSERT INTO users (${idType}, name, image_url, email, oauth_email)
      VALUES ($1, $2, $3, $4, $4)
      ON CONFLICT (oauth_email) DO UPDATE
        SET ${idType}=$1, updated=CURRENT_TIMESTAMP
      RETURNING user_id, name, image_url, email, oauth_email, updated IS NULL as new
      `,
      [id, name, imageUrl, email],
    )
    .then((results) => {
      const { rows, rowCount } = results;
      if (rows && rowCount) {
        const { new: isNew, ...user } = results.rows[0];
        return { user: remapUser(user), isNew };
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

export const updateUserEmail = async (id: string, email: string) => {
  return await pool
    .query('UPDATE users SET email=$1 WHERE user_id=$2 RETURNING email', [
      email,
      id,
    ])
    .then((results) => {
      if (results?.rowCount) {
        return results.rows[0].email;
      } else {
        throw new Error('User email update failed.');
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
