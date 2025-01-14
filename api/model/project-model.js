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
  name = '',
  tags = [],
  asc = true
) => {
  try {
    // TODO: implement proper filters
    return await new Promise((resolve, reject) => {
      const queryParams = [start, limit + 1];
      const addedQueryParams = [];
      const where = [];
      if (name) {
        sortBy = `levenshtein_less_equal(LOWER('${name}'), LOWER(name), 1, 20, 9, 50)`;
        asc = true;
      }

      const hasTags = tags && tags.length > 0;
      if (hasTags) {
        addedQueryParams.push(`{${tags.map((t) => `"${t}"`).join(',')}}`);
        where.push(`tags @> $${addedQueryParams.length + queryParams.length}`);
      }

      const queryString = `SELECT * FROM RoleplayProjects ${
        where.length > 0 ? `WHERE ${where.join(' AND ')} ` : ''
      }ORDER BY ${sortBy} ${asc ? 'ASC' : 'DESC'}, name ASC OFFSET $1 LIMIT $2`;
      console.log(queryString);
      console.log(sortBy);
      console.log(addedQueryParams);
      pool.query(
        queryString,
        queryParams.concat(addedQueryParams), // using limit + 1 to see if there are any remaining
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
