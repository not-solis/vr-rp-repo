import { IPostgresInterval } from 'postgres-interval';
import { makeTransaction, pool } from './db-pool.js';

export enum ScheduleRegion {
  NA = 'NA',
  EU = 'EU',
  OCE = 'OCE',
  Other = 'Other',
}

enum ScheduleType {
  Periodic = 'Periodic',
  OneShot = 'One shot',
  ScheduleLink = 'Schedule link',
  Other = 'Other',
}

export interface Runtime {
  region?: ScheduleRegion;
  start: Date;
  end?: Date;
  between?: IPostgresInterval;
}

export interface RoleplaySchedule {
  type: ScheduleType;
  region?: ScheduleRegion;
  scheduleLink?: string;
  otherText?: string;
  runtimes: Runtime[];
}

export const remapSchedule = (schedule: any): RoleplaySchedule => {
  if (!schedule) {
    return schedule;
  }
  return {
    type: schedule.schedule_type,
    region: schedule.region,
    scheduleLink: schedule.schedule_link,
    otherText: schedule.other_text,
    runtimes: schedule.runtimes || [],
  };
};

export const saveSchedule = async (
  projectId: string,
  schedule: RoleplaySchedule,
) =>
  await new Promise((resolve, reject) =>
    makeTransaction(async (client) => {
      const { type, region, scheduleLink, otherText, runtimes } = schedule;
      await client.query(
        `
        INSERT INTO schedules
          (project_id, schedule_type, "region", schedule_link, other_text)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (project_id)
        DO UPDATE SET
          schedule_type=$2,
          "region"=$3,
          schedule_link=$4,
          other_text=$5
        ;`,
        [projectId, type, region, scheduleLink, otherText],
      );

      await client.query('DELETE FROM runtimes WHERE project_id=$1', [
        projectId,
      ]);

      if (
        [ScheduleType.Periodic, ScheduleType.OneShot].includes(schedule.type)
      ) {
        const mappedRuntimes = runtimes.map((runtime) => {
          if (!runtime.between) {
            return runtime;
          }
          return { ...runtime, between: `${runtime.between.days} days` };
        });
        await client.query(
          `
          INSERT INTO runtimes (project_id, "start", "end", "region", between)
          SELECT
            $2::uuid AS project_id,
            (runtime->>'start')::timestamptz AS "start",
            (runtime->>'end')::timestamptz AS "end",
            (runtime->>'region')::scheduleregion AS "region",
            (runtime->>'between')::interval AS between
          FROM UNNEST($1::json[]) AS runtime
          ;`,
          [mappedRuntimes, projectId],
        );
      }

      resolve(undefined);
    }, reject),
  );

export const getScheduleByProjectId = async (id: string) => {
  const schedule = await pool
    .query('SELECT * FROM schedules WHERE project_id=$1;', [id])
    .then((results) => remapSchedule(results?.rows[0]));
  if (!schedule) {
    return schedule;
  }

  schedule.runtimes = await pool
    .query(
      `SELECT
        region, "start", "end", "between"
      FROM runtimes
      WHERE project_id=$1`,
      [id],
    )
    .then((results) => (results?.rows || []) as Runtime[]);
  return schedule;
};
