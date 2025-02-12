import { PoolClient } from 'pg';
import { makeTransaction, pool } from './db-pool.js';
import { User, UserRole } from './users-model.js';
import { RoleplayLink, updateRoleplayLinks } from './roleplay-links-model.js';
import { createOwnership } from './owners-model.js';
import { PageData } from '../data/PageData.js';
import {
  getScheduleByProjectId,
  RoleplaySchedule,
  saveSchedule,
  ScheduleRegion,
} from './schedule-model.js';

const DEFAULT_QUERY_LIMIT = 1000;

export interface RoleplayProject {
  id: string;
  name: string;
  urlName: string;
  owner?: User;
  lastUpdated?: Date;
  imageUrl?: string;
  shortDescription?: string;
  description?: string;
  setting?: string;
  tags?: string[];
  schedule?: RoleplaySchedule;
  started?: Date;
  status?: string;
  entryProcess?: string;
  applicationProcess?: string;
  hasSupportingCast?: boolean;
  isMetaverse?: boolean;
  isQuestCompatible?: boolean;
  discordUrl?: string;
  otherLinks?: RoleplayLink[];
}

export interface RoleplayEvent {
  isConfirmed: boolean;
  startDate: Date;
  endDate: Date;
  project: RoleplayProject;
}

const remapRoleplayProject = (project: any): RoleplayProject => {
  return {
    id: project.id,
    name: project.name,
    urlName: project.url_name,
    owner: project.owner_id
      ? {
          id: project.owner_id,
          name: project.owner_name,
          role: project.owner_role,
          email: project.owner_email,
          oauthEmail: project.owner_oauth_email,
        }
      : undefined,
    lastUpdated: new Date(project.last_updated),
    imageUrl: project.image_url,
    shortDescription: project.short_description,
    description: project.description,
    setting: project.setting,
    tags: project.tags,
    schedule: project.schedule_type && {
      type: project.schedule_type,
      region: project.schedule_region,
      scheduleLink: project.schedule_link,
      otherText: project.schedule_other_text,
      runtimes: project.runtimes,
    },
    started: project.started && new Date(project.started),
    status: project.status,
    entryProcess: project.entry_process,
    applicationProcess: project.application_process,
    hasSupportingCast: project.has_support_cast,
    isMetaverse: project.is_metaverse,
    isQuestCompatible: project.is_quest_compatible,
    discordUrl: project.discord_url,
    otherLinks: project.other_links,
  };
};

const validSortByKeys = new Set([
  'name',
  'last_updated',
  'created_at',
  'started',
]);

export interface ProjectSearchParams {
  start?: number;
  limit?: number;
  region?: ScheduleRegion;
  sortBy?: string;
  name?: string;
  tags?: string[];
  asc?: boolean;
  activeOnly?: boolean;
}

export interface EventSearchParams {
  startDate: Date;
  endDate: Date;
  region?: ScheduleRegion;
  tags?: string[];
  activeOnly?: boolean;
}

const projectQueryFields = `
        roleplay_projects.*,
        users.user_id as owner_id,
        users.name as owner_name,
        users.role as owner_role,
        users.email as owner_email,
        array_agg(
          json_build_object(
            'label', roleplay_links.label,
            'url', roleplay_links.url
          )
        ) filter (where roleplay_links.url is not null) as other_links,
        min(schedules.schedule_type) as schedule_type,
        min(schedules.region) as schedule_region,
        min(schedules.schedule_link) as schedule_link,
        min(schedules.other_text) as schedule_other_text,
        array_agg(
          json_build_object(
            'region', runtimes.region,
            'start', runtimes.start,
            'end', runtimes.end,
            'between', runtimes.between
          )
        ) filter (where runtimes.start is not null) as runtimes`;
const projectQueryTable = `
      roleplay_projects
        LEFT JOIN ownership ON (ownership.project_id = roleplay_projects.id AND ownership.active)
        LEFT JOIN users on (users.user_id = ownership.user_id and users.role != 'Banned')
        LEFT JOIN roleplay_links ON roleplay_projects.id = roleplay_links.project_id
        LEFT JOIN schedules ON roleplay_projects.id = schedules.project_id
        LEFT JOIN runtimes ON roleplay_projects.id = runtimes.project_id`;

const DEFAULT_EVENT_LENGTH = '4 hours';

export const getProjects = async (params: ProjectSearchParams) => {
  // TODO: use SQL nullness checks and feed all params into query
  const {
    start = 0,
    limit = DEFAULT_QUERY_LIMIT,
    region,
    tags = [],
    name = '',
    activeOnly = false,
  } = params;
  let { sortBy = 'name', asc = true } = params;
  // using limit + 1 to see if there are any remaining
  const queryParams: (string | number)[] = [start, limit + 1];
  const addedQueryParams: (string | number)[] = [];
  const where = ["roleplay_projects.status != 'Deleted'"];
  if (name) {
    addedQueryParams.push(name);
    sortBy = `levenshtein_less_equal(LOWER($3), LOWER(roleplay_projects.name), 0, 20, 9, 50)`;
    asc = true;
  } else {
    if (!validSortByKeys.has(sortBy)) {
      throw new Error('Invalid sort key.');
    }
  }

  if (region) {
    addedQueryParams.push(region);
    const param = `$${addedQueryParams.length + queryParams.length}`;
    where.push(`(schedules.region = ${param}
      OR EXISTS (
        SELECT region FROM runtimes
        WHERE project_id=roleplay_projects.id
          AND region = ${param}))`);
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
      SELECT
        ${projectQueryFields}
      FROM ${projectQueryTable}
      ${where.length > 0 ? `WHERE ${where.join(' AND ')} ` : ''}
      GROUP BY
        roleplay_projects.id,
        users.user_id
      ORDER BY ${sortBy} ${asc ? 'ASC' : 'DESC'} NULLS LAST
      ${!name && sortBy === 'name' ? '' : ', roleplay_projects.name ASC'}
      OFFSET $1 LIMIT $2;
      `;

  return await pool
    .query(queryString, queryParams.concat(addedQueryParams))
    .then((results) => {
      const { rows, rowCount } = results;
      if (rows && rowCount !== null) {
        if (rowCount > limit) {
          rows.pop();
        }
        return {
          hasNext: rowCount > limit,
          data: rows.map(remapRoleplayProject),
          nextCursor: start + limit,
        } as PageData<RoleplayProject, number>;
      } else {
        throw new Error('No results found.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const getEvents = async (
  params: EventSearchParams,
): Promise<PageData<RoleplayEvent, { startDate: Date; endDate: Date }>> => {
  const { startDate, endDate, tags = [], activeOnly = false } = params;

  //   select
  // 	*,
  // 	event_start + coalesce(runtimes.end - runtimes.start, '4 hours'::interval) as event_end
  // from schedules
  // 	inner join runtimes on schedules.project_id = runtimes.project_id,
  // 	constants,
  // 	generate_series(runtimes.start, end_date, coalesce(runtimes.between, '7 days'::interval)) as event_start
  // where
  // 	event_start > start_date;

  return await pool
    .query(
      `
      SELECT
        runtimes.between IS NOT NULL as is_confirmed,
        event_start,
        event_start + COALESCE(runtimes.end - runtimes.start, $1::interval) AS event_end,
        ${projectQueryFields}
      FROM ${projectQueryTable},
        generate_series(
          $2::timestamptz + make_interval(secs => 
            mod(
              extract(EPOCH FROM runtimes.start) - extract(EPOCH FROM $2::timestamptz),
              extract(EPOCH from coalesce(runtimes.between, '7 days'::interval))
            )
          ),
          $3,
          coalesce(runtimes.between, '7 days'::interval)) as event_start
      WHERE event_start BETWEEN $2 AND $3 - '1 millisecond'::interval
        AND (coalesce(array_length($4::varchar[], 1), 0) = 0 OR tags @> $4::varchar[])
        AND (NOT $5 OR roleplay_projects.status = 'Active')
      GROUP BY
        roleplay_projects.id,
        users.user_id,
        event_start,
        runtimes.between,
        runtimes.start,
        runtimes.end
      ORDER BY event_start
      ;`,
      [DEFAULT_EVENT_LENGTH, startDate, endDate, tags, activeOnly],
    )
    .then((results) => {
      const { rows, rowCount } = results;
      if (rows && rowCount !== null) {
        return {
          hasNext: true,
          data: rows.map((row) => ({
            isConfirmed: row.is_confirmed,
            startDate: row.event_start,
            endDate: row.event_end,
            project: remapRoleplayProject(row),
          })),
          nextCursor: {
            startDate,
            endDate,
          },
        };
      } else {
        throw new Error('No results found.');
      }
    })
    .catch((err) => {
      throw err;
    });
};

export const getProjectById = async (id: string) => {
  return internalGetProject('id', id);
};

export const getProjectByUrlName = async (urlName: string) => {
  return internalGetProject('url_name', urlName);
};

const internalGetProject = async (field: string, value: string) => {
  return await pool
    .query(
      `
      SELECT
        roleplay_projects.*,
        users.user_id as owner_id,
        users.name as owner_name,
        users.role as owner_role,
        users.email as owner_email
      FROM roleplay_projects
        LEFT JOIN ownership ON (ownership.project_id = roleplay_projects.id AND ownership.active)
        LEFT JOIN users on (users.user_id = ownership.user_id and users.role != 'Banned')
      WHERE roleplay_projects.${field}=$1 AND roleplay_projects.status != 'Deleted'
      ;
      `,
      [value],
    )
    .then(async (results) => {
      if (results?.rows) {
        const project = remapRoleplayProject(results.rows[0]);
        project.schedule = await getScheduleByProjectId(project.id);
        return project;
      } else {
        throw new Error('No results found.');
      }
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const createProject = async (user: User, project: RoleplayProject) => {
  const {
    name,
    shortDescription,
    description,
    setting,
    schedule,
    started,
    tags,
    status,
    entryProcess,
    applicationProcess,
    hasSupportingCast,
    isMetaverse,
    isQuestCompatible,
    discordUrl,
    imageUrl,
    otherLinks = [],
  } = project;
  const { id: userId, role } = user;
  return await new Promise((resolve, reject) => {
    makeTransaction((client: PoolClient) => {
      client
        .query(
          `
          INSERT INTO roleplay_projects
          (name,
          short_description,
          description,
          setting,
          started,
          tags,
          status,
          entry_process,
          application_process,
          has_support_cast,
          is_metaverse,
          is_quest_compatible,
          discord_url,
          image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          RETURNING id, url_name;
          `,
          [
            name,
            shortDescription,
            description,
            setting,
            started,
            tags,
            status,
            entryProcess,
            applicationProcess,
            hasSupportingCast,
            isMetaverse,
            isQuestCompatible,
            discordUrl,
            imageUrl,
          ],
        )
        .then((results) => {
          if (!results?.rowCount) {
            reject(new Error('Create project failed.'));
          }

          const newProject = results.rows[0];
          const { id: projectId, url_name: urlName } = newProject;

          const queries = [];
          if (role === UserRole.User) {
            queries.push(createOwnership(projectId, userId, true));
          }

          if (schedule) {
            queries.push(saveSchedule(projectId, schedule));
          }

          if (otherLinks.length > 0) {
            client
              .query(
                `
                  INSERT INTO roleplay_links (label, url, project_id)
                  SELECT
                    (rp_link->>'label')::varchar as label,
                    (rp_link->>'url')::varchar as url,
                    $2 as project_id
                  FROM UNNEST($1::json[]) as rp_link;
                  `,
                [otherLinks, projectId],
              )
              .then((results) => {
                if (!results.rowCount) {
                  throw new Error('Error saving links');
                }
              })
              .catch(console.error);
          }

          return Promise.all(queries)
            .then(() => resolve(urlName))
            .catch(reject);
        })
        .catch(reject);
    }, reject);
  });
};

export const updateProject = async (id: string, project: RoleplayProject) => {
  const {
    name,
    shortDescription,
    description,
    setting,
    schedule,
    started,
    tags,
    status,
    entryProcess,
    applicationProcess,
    hasSupportingCast,
    isMetaverse,
    isQuestCompatible,
    discordUrl,
    imageUrl,
    otherLinks = [],
  } = project;
  return await new Promise((resolve, reject) => {
    makeTransaction((client: PoolClient) => {
      client
        .query(
          `
          UPDATE roleplay_projects
          SET
          name=$1,
          short_description=$2,
          description=$3,
          setting=$4,
          started=$5,
          tags=$6,
          status=$7,
          entry_process=$8,
          application_process=$9,
          has_support_cast=$10,
          is_metaverse=$11,
          is_quest_compatible=$12,
          discord_url=$13,
          image_url=$14
          WHERE id=$15
          RETURNING url_name;
          `,
          [
            name,
            shortDescription,
            description,
            setting,
            started,
            tags,
            status,
            entryProcess,
            applicationProcess,
            hasSupportingCast,
            isMetaverse,
            isQuestCompatible,
            discordUrl,
            imageUrl,
            id,
          ],
        )
        .then(async (results) => {
          if (!results?.rowCount) {
            throw new Error('Update project failed.');
          }

          await updateRoleplayLinks(id, otherLinks);

          if (schedule) {
            await saveSchedule(id, schedule);
          }

          resolve(results.rows[0].url_name);
        })
        .catch(reject);
    }, reject);
  });
};

export const getImageUrlByProjectId = async (id: string) => {
  return await pool
    .query(
      "SELECT image_url FROM roleplay_projects WHERE id=$1 AND status != 'Deleted'",
      [id],
    )
    .then((results) => {
      if (!results?.rowCount) {
        throw new Error('Failed to retrieve image URL');
      }

      return results.rows[0].image_url;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};

export const deleteProject = async (id: string) => {
  return await pool
    .query(
      "UPDATE roleplay_projects SET status='Deleted' WHERE id=$1 RETURNING id",
      [id],
    )
    .then((results) => {
      if (!results?.rowCount) {
        throw new Error('Failed to delete project');
      }

      return results.rows[0].id;
    })
    .catch((err) => {
      console.error(err);
      throw new Error('Internal server error.');
    });
};
