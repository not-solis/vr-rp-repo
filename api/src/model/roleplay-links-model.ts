import { PoolClient } from 'pg';
import { makeTransaction, pool } from './db-pool';

export interface RoleplayLink {
  label: string;
  url: string;
}

export const getRoleplayLinksByProjectId = async (
  id: string,
): Promise<RoleplayLink[]> => {
  try {
    return await new Promise((resolve, reject) => {
      pool.query(
        `
        SELECT
          label,
          url
        FROM roleplay_links
        WHERE project_id=$1;
        `,
        [id],
        (error, results) => {
          if (error) {
            reject(error);
          }

          if (results?.rows) {
            resolve(results.rows);
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

export const updateRoleplayLinks = async (
  id: string,
  newLinks: RoleplayLink[],
) => {
  try {
    return await new Promise((resolve, reject) => {
      getRoleplayLinksByProjectId(id)
        .then((existingLinks: RoleplayLink[]) => {
          // bit hacky, but gets the job done for now
          const mapLink = (link: RoleplayLink) => `${link.label}|${link.url}`;
          const newSet = new Set(newLinks.map(mapLink));
          const existingSet = new Set(existingLinks.map(mapLink));
          const addedLinks = newLinks.filter(
            (link) => !existingSet.has(mapLink(link)),
          );
          const removedLinks = existingLinks.filter(
            (link) => !newSet.has(mapLink(link)),
          );

          const queries: ((client: PoolClient) => Promise<unknown>)[] = [];
          if (addedLinks.length > 0) {
            queries.push(
              (client) =>
                new Promise((resolve, reject) => {
                  client.query(
                    `
                INSERT INTO roleplay_links (label, url, project_id)
                SELECT
                  (rp_link->>'label')::varchar AS label,
                  (rp_link->>'url')::varchar AS url,
                  $2::uuid AS project_id
                FROM UNNEST($1::json[]) AS rp_link
                ;
                `,
                    [addedLinks, id],
                    (error, results) => {
                      if (error) {
                        reject(error);
                      } else if (!results) {
                        reject(new Error('Failed links update'));
                      } else if (results.rowCount !== addedLinks.length) {
                        reject(
                          new Error('Unexpected number of records affected'),
                        );
                      } else {
                        resolve({});
                      }
                    },
                  );
                }),
            );
          }

          if (removedLinks.length > 0) {
            queries.push(
              (client) =>
                new Promise((resolve, reject) => {
                  client.query(
                    `
                DELETE FROM roleplay_links
                WHERE project_id=$2
                AND (label, url) IN (
                  SELECT
                    (rp_link->>'label')::varchar as label,
                    (rp_link->>'url')::varchar as url
                  FROM UNNEST($1::json[]) as rp_link
                )
                ;
                `,
                    [removedLinks, id],
                    (error, results) => {
                      if (error) {
                        reject(error);
                      } else if (!results) {
                        reject(new Error('Failed links update'));
                      } else if (results.rowCount !== removedLinks.length) {
                        reject(
                          new Error('Unexpected number of records affected'),
                        );
                      } else {
                        resolve({});
                      }
                    },
                  );
                }),
            );
          }

          makeTransaction(async (client) => {
            await Promise.all(queries.map((q) => q(client)))
              .then(resolve)
              .catch(reject);
          });
        })
        .catch(reject);
    });
  } catch (err) {
    console.error(err);
    throw new Error('Internal server error.');
  }
};
