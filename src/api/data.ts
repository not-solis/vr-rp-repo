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
    status:
      Math.random() > 0.8 ? RoleplayStatus.Active : RoleplayStatus.Inactive,
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
  filters: Partial<RoleplayProjectProps> = {},
  ascending: boolean = true
): Promise<{
  data: RoleplayProjectProps[];
  nextCursor: number;
  hasNextPage: boolean;
}> {
  // TODO: return based on project env
  // TODO: replace this logic with proper db query/filter
  let projects = [...TEST_PROJECTS];
  const queryFilters: ((props: RoleplayProjectProps) => boolean)[] = [];

  if (filters.name) {
    projects = projects.filter((props) =>
      props.name.toLowerCase().includes(filters.name!.toLowerCase())
    );
  }

  if (filters.status) {
    projects = projects.filter((props) => props.status === filters.status);
  }

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

  const data = projects.slice(start, start + limit);
  const end = start + data.length;
  const hasNextPage = end < projects.length;
  return {
    data,
    nextCursor: end,
    hasNextPage,
  };
}
