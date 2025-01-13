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
