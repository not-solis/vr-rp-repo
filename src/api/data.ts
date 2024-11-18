import {
  RoleplayApplicationProcess,
  RoleplayEntryProcess,
  RoleplayProjectProps,
  RoleplayStatus,
} from '../model/RoleplayProject';

const testProjects = Array.from({ length: 10 }, (v, k) => {
  return {
    name: `The Best Roleplay ${k}`,
    owners: ['solis'],
    lastUpdated: new Date(Math.random() * Date.now()),
    imageUrl:
      'https://i.kym-cdn.com/photos/images/original/001/240/860/528.png',
    description:
      'This roleplay is incredible. It takes place in the most fantasy place with the most weapony weapons and more dice than you can humanly accept in a given setting.',
    tags: ['cool', 'nice'],
    runtime: [new Date(1111111111111)],
    status: RoleplayStatus.Active,
    entryProcess: RoleplayEntryProcess.Open,
    applicationProcess: RoleplayApplicationProcess.NoApplication,
    hasSupportingCast: true,
    isMetaverse: false,
    isQuestCompatible: true,
    discordUrl: 'http://www.google.com',
    otherLinks: [],
  };
});

export const getProjects: () => Promise<RoleplayProjectProps[]> = async () => {
  // TODO: return based on project env
  return testProjects;
};
