import { User } from './User';

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
  runtime?: string;
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

export const getProjectDates = (project: RoleplayProject) => {
  return {
    ...project,
    lastUpdated: new Date(project.lastUpdated),
    started: project.started && new Date(project.started),
  };
};
