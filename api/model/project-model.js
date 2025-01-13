import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionDetails = {
  user: process.env.POSTGRES_DB_USER,
  host: process.env.POSTGRES_DB_HOST,
  database: process.env.POSTGRES_DB_DATABASE,
  password: process.env.POSTGRES_DB_PASSWORD,
  port: process.env.POSTGRES_DB_PORT,
};
const pool = new pg.Pool(connectionDetails);

export const getProjects = async (
  start,
  limit,
  sortBy,
  filters = [],
  asc = true
) => {
  try {
    // TODO: implement proper filters
    return await new Promise((resolve, reject) => {
      pool.query(
        `SELECT * FROM RoleplayProjects ORDER BY $1 ${
          asc ? 'ASC' : 'DESC'
        }, name ASC OFFSET $2 LIMIT $3`,
        [sortBy, start, limit + 1], // using limit + 1 to see if there are any remaining
        (error, results) => {
          if (error) {
            reject(error);
          }

          if (results?.rows) {
            const { rows, rowCount } = results;
            rows.pop();
            resolve({
              hasNext: rowCount > limit,
              data: rows,
              nextCursor: start + limit,
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

export const getProjectById = async (id) => {
  try {
    return await new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM RoleplayProjects WHERE id=$1',
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          }

          if (results?.rows) {
            resolve({
              data: results.rows[0],
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
