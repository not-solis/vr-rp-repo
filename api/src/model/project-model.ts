import { pool } from './db-pool';

const DEFAULT_QUERY_LIMIT = 1000;

export const getProjects = async (
  start = 0,
  limit = DEFAULT_QUERY_LIMIT,
  sortBy = 'name',
  name = '',
  tags: string[] = [],
  asc = true,
  activeOnly = false,
) => {
  try {
    // TODO: implement proper filters
    return await new Promise((resolve, reject) => {
      const queryParams: (string | number)[] = [start, limit + 1];
      const addedQueryParams: (string | number)[] = [];
      const where = [];
      if (name) {
        sortBy = `levenshtein_less_equal(LOWER('${name}'), LOWER(roleplay_projects.name), 1, 20, 9, 50)`;
        asc = true;
      }

      const hasTags = tags && tags.length > 0;
      if (hasTags) {
        addedQueryParams.push(`{${tags.map((t) => `"${t}"`).join(',')}}`);
        where.push(`tags @> $${addedQueryParams.length + queryParams.length}`);
      }

      if (activeOnly) {
        where.push("status = 'Active'");
      }

      const queryString = `
      SELECT roleplay_projects.*,
      array_agg(
        json_build_object(
          'id', users.user_id,
          'name', users.name
        )
      ) FILTER (WHERE users.user_id IS NOT NULL) AS owners,
      array_agg(
        json_build_object(
          'label', roleplay_links.label,
          'url', roleplay_links.url
        )
      ) filter (where roleplay_links.url is not null) as other_links
      FROM roleplay_projects
        LEFT JOIN ownership ON roleplay_projects.id = ownership.project_id
        LEFT JOIN users ON ownership.user_id = users.user_id
        left join roleplay_links on roleplay_projects.id = roleplay_links.project_id
      ${where.length > 0 ? `WHERE ${where.join(' AND ')} ` : ''}
      GROUP BY roleplay_projects.id
      ORDER BY ${sortBy} ${asc ? 'ASC' : 'DESC'}
      ${name || sortBy === 'name' ? '' : ', roleplay_projects.name ASC'}
      OFFSET $1 LIMIT $2;
      `;

      pool.query(
        queryString,
        queryParams.concat(addedQueryParams), // using limit + 1 to see if there are any remaining
        (error, results) => {
          if (error) {
            reject(error);
          }

          const { rows, rowCount } = results;
          if (rows && rowCount !== null) {
            if (rowCount > limit) {
              rows.pop();
            }
            resolve({
              hasNext: rowCount > limit,
              data: rows,
              nextCursor: start + limit,
            });
          } else {
            reject(new Error('No results found.'));
          }
        },
      );
    });
  } catch (err) {
    console.error(err);
    throw new Error('Internal server error.');
  }
};

export const getProjectById = async (id: string) => {
  try {
    return await new Promise((resolve, reject) => {
      pool.query(
        'SELECT * FROM roleplay_projects WHERE id=$1',
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
        },
      );
    });
  } catch (err) {
    console.error(err);
    throw new Error('Internal server error.');
  }
};
