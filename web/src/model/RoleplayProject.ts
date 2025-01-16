export enum RoleplayStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Upcoming = 'Upcoming',
  Hiatus = 'Hiatus',
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

export interface User {
  id: string;
  name: string;
  discordId: string;
}

export interface RoleplayProject {
  id: string;
  name: string;
  owners: User[];
  lastUpdated: Date;
  imageUrl?: string;
  shortDescription: string;
  description?: string;
  setting?: string;
  tags: string[];
  runtime: Date[];
  status: RoleplayStatus;
  entryProcess: RoleplayEntryProcess;
  applicationProcess: RoleplayApplicationProcess;
  hasSupportingCast: boolean;
  isMetaverse: boolean;
  isQuestCompatible: boolean;
  discordUrl?: string;
  otherLinks: RoleplayLink[];
}

export const remapRoleplayProject = (project: any) => {
  return {
    id: project.id,
    name: project.name,
    owners: project.owners,
    lastUpdated: new Date(project.last_updated),
    imageUrl: project.image_url,
    shortDescription: project.short_description,
    description: project.description,
    setting: project.setting,
    tags: project.tags,
    runtime: [],
    status: project.status,
    entryProcess: project.entry_process,
    applicationProcess: project.application_process,
    hasSupportingCast: project.has_support_cast,
    isMetaverse: project.is_metaverse,
    isQuestCompatible: project.is_quest_compatible,
    discordUrl: project.discord_url,
    otherLinks: project.other_links,
  } as RoleplayProject;
};
