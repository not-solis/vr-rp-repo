import {
  RoleplayApplicationProcess,
  RoleplayEntryProcess,
  RoleplayProjectProps,
  RoleplayStatus,
} from '../model/RoleplayProject';

export enum SortType {
  NAME,
  CREATED_TIME,
  UPDATED_TIME,
}

const TEST_PROJECTS = Array.from({ length: 100 }, (v, k) => {
  return {
    name: `The Best Roleplay ${k}`,
    owners: Math.random() > 0.5 ? ['solis'] : ['not solis!'],
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

export async function getProjects(
  start: number,
  limit: number,
  sortType: SortType,
  ascending: boolean = true
): Promise<{ data: RoleplayProjectProps[]; hasNextPage: boolean }> {
  // TODO: return based on project env
  const projects = [...TEST_PROJECTS];
  const order = ascending ? 1 : -1;
  switch (sortType) {
    case SortType.UPDATED_TIME:
      projects.sort(
        (a, b) => order * (a.lastUpdated.getTime() - b.lastUpdated.getTime())
      );
      break;
    case SortType.NAME:
      projects.sort((a, b) => order * (a.name > b.name ? 1 : -1));
      break;
  }

  const end = start + limit;
  const hasNextPage = end < projects.length;
  return {
    data: projects.slice(start, end),
    hasNextPage,
  };
}
