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

export const remapRoleplayProject = (project: any): RoleplayProject => {
  return {
    id: project.id,
    name: project.name,
    owner: project.owner_id
      ? {
          id: project.owner_id,
          name: project.owner_name,
          role: project.owner_role,
          email: project.owner_email,
        }
      : undefined,
    lastUpdated: new Date(project.last_updated),
    imageUrl: project.image_url,
    shortDescription: project.short_description,
    description: project.description,
    setting: project.setting,
    tags: project.tags,
    runtime: project.runtime,
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
