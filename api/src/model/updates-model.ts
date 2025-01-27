import { pool } from './db-pool.js';
import { RoleplayProject } from './project-model.js';
import { remapUser, User } from './users-model.js';

interface Update {
  id: string;
  user: User;
  project?: RoleplayProject;
  text: string;
  created: Date;
}

export const getUpdatesByProjectId = async (id: string): Promise<Update[]> => {
  return await pool
    .query(
      `SELECT
        users.*,
        updates.*,
        roleplay_projects.name as project_name
      FROM updates
        INNER JOIN users ON (updates.user_id = users.user_id AND users.role != 'Banned')
        LEFT JOIN roleplay_projects ON updates.project_id = roleplay_projects.id
      WHERE project_id=$1
      ORDER BY created DESC`,
      [id],
    )
    .then((results) => {
      if (results?.rows) {
        return results.rows.map<Update>((row) => ({
          id: row.id,
          project: row.project_id
            ? {
                id: row.project_id,
                name: row.project_name,
              }
            : undefined,
          user: remapUser(row),
          text: row.update_text,
          created: row.created,
        }));
      } else {
        throw new Error('Username update failed.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
