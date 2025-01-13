export enum RoleplayStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Upcoming = 'Upcoming',
  Hiatus = 'Hiatus',
}

export enum RoleplayEntryProcess {
  Open,
  Vouch,
  Vetting,
  InviteOnly,
  Application,
}

export enum RoleplayApplicationProcess {
  NoApplication,
  PlayerApplication,
  CharacterSheet,
  EventSignup,
}

export interface RoleplayProjectProps {
  id: string;
  name: string;
  owners: string[];
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
  otherLinks: string[];
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
    discordUrl: project.discord_link,
    otherLinks: project.other_links,
  };
};
