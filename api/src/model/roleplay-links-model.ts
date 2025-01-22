import { makeTransaction, pool } from './db-pool';

export interface RoleplayLink {
  label: string;
  url: string;
}

export const getRoleplayLinksByProjectId = async (
  id: string,
): Promise<RoleplayLink[]> => {
  return await pool
    .query(
      `
      SELECT
        label,
        url
      FROM roleplay_links
      WHERE project_id=$1
      ORDER BY timestamp_added ASC
      ;
      `,
      [id],
    )
    .then((results) => {
      if (results?.rows) {
        return results.rows;
      } else {
        throw new Error('No results found.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const updateRoleplayLinks = async (
  id: string,
  newLinks: RoleplayLink[],
) => {
  return await new Promise((resolve, reject) => {
    makeTransaction((client) => {
      getRoleplayLinksByProjectId(id).then((existingLinks: RoleplayLink[]) => {
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

        const queries = [];
        if (addedLinks.length > 0) {
          queries.push(
            client
              .query(
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
              )
              .then((results) => {
                if (!results) {
                  return Promise.reject(new Error('Failed links update'));
                } else if (results.rowCount !== addedLinks.length) {
                  return Promise.reject(
                    new Error('Unexpected number of records affected'),
                  );
                } else {
                  return {};
                }
              })
              .catch(console.error),
          );
        }

        if (removedLinks.length > 0) {
          queries.push(
            client
              .query(
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
              )
              .then((results) => {
                if (!results) {
                  return Promise.reject(new Error('Failed links update'));
                } else if (results.rowCount !== removedLinks.length) {
                  return Promise.reject(
                    new Error('Unexpected number of records affected'),
                  );
                } else {
                  return {};
                }
              })
              .catch(console.error),
          );
        }

        Promise.all(queries)
          .then(() => resolve({}))
          .catch(reject);
      });
    }, reject);
  }).catch((err) => {
    console.error(err);
    throw new Error('Internal server error.');
  });
};
