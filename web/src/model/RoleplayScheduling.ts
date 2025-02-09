export enum ScheduleRegion {
  NA = 'NA',
  EU = 'EU',
  OCE = 'OCE',
  Other = 'Other',
}

export enum ScheduleType {
  Periodic = 'Periodic',
  OneShot = 'One shot',
  ScheduleLink = 'Schedule link',
  Other = 'Other',
}

export interface Interval {
  days: number;
}

export interface Runtime {
  region?: ScheduleRegion;
  start: Date;
  end?: Date;
  between?: Interval;
}

export interface RoleplaySchedule {
  type: ScheduleType;
  region?: ScheduleRegion;
  scheduleLink?: string;
  otherText?: string;
  runtimes: Runtime[];
}
