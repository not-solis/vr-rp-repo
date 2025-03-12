import { RoleplaySchedule, Runtime, ScheduleType } from './RoleplayScheduling';
import { User } from './User';
import { isDst, observesDst } from '../util/Time';

export enum RoleplayStatus {
  Active = 'Active',
  Upcoming = 'Upcoming',
  Hiatus = 'Hiatus',
  Inactive = 'Inactive',
}

export enum RoleplayEntryProcess {
  Open = 'Open',
  Vouch = 'Vouch',
  Vetting = 'Vetting',
  InviteOnly = 'Invite Only',
  Application = 'Application',
}

export enum RoleplayApplicationProcess {
  NoApplication = 'None',
  PlayerApplication = 'Player App',
  CharacterSheet = 'Character Sheet',
  EventSignup = 'Event Sign-up',
}

export interface RoleplayLink {
  label: string;
  url: string;
}

export interface RoleplayProject {
  id: string;
  name: string;
  urlName: string;
  owner?: User;
  lastUpdated: Date;
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

// TODO: Accessibility
// quest
// mute
// desktop

const adjustDst = (date: Date) => {
  if (observesDst(date) && isDst(date)) {
    date.setHours(date.getHours() - 1);
  }
};

export const mapProject = (project: RoleplayProject): RoleplayProject => {
  const scheduleType = project.schedule?.type;
  const runtimes =
    project.schedule?.runtimes?.map<Runtime>((runtime) => {
      const start = new Date(runtime.start);
      if (scheduleType === ScheduleType.Periodic) {
        adjustDst(start);
      }
      const end = runtime.end && new Date(runtime.end);
      if (end && scheduleType === ScheduleType.Periodic) {
        adjustDst(end);
      }
      return {
        ...runtime,
        start,
        end,
      };
    }) ?? [];
  runtimes.sort((a, b) => {
    const { start: startA } = a;
    const { start: startB } = b;
    if (scheduleType === ScheduleType.Periodic) {
      const weekStartA = new Date(startA);
      weekStartA.setHours(0, 0, 0, 0);
      weekStartA.setDate(
        weekStartA.getDate() - ((weekStartA.getDay() + 6) % 7),
      );

      const weekStartB = new Date(startB);
      weekStartB.setHours(0, 0, 0, 0);
      weekStartB.setDate(
        weekStartB.getDate() - ((weekStartB.getDay() + 6) % 7),
      );

      const diffA = startA.getDate() - weekStartA.getDate();
      const diffB = startB.getDate() - weekStartB.getDate();

      return diffA - diffB;
    } else if (scheduleType === ScheduleType.OneShot) {
      return startA.getDate() - startB.getDate();
    } else {
      return 0;
    }
  });
  return {
    ...project,
    lastUpdated: new Date(project.lastUpdated),
    started: project.started && new Date(project.started),
    schedule: project.schedule && {
      ...project.schedule,
      runtimes,
    },
  };
};
