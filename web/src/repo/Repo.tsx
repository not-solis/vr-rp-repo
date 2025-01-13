import './Repo.css';
import { RoleplayProject } from '../components/RoleplayProject';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, useTheme } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useState } from 'react';
import { RoleplayProjectProps } from '../model/RoleplayProject';
import { RepoFilters } from './RepoFilters';

const PAGE_SIZE = 50;

interface ProjectQueryResponse {
  hasNextPage: boolean;
  data: RoleplayProjectProps[];
  nextCursor: number;
}

export const Repo = () => {
  const theme = useTheme();
  const [filters, setFilters] = useState<Partial<RoleplayProjectProps>>({});
  const {
    data: pageData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: ({ pageParam }) =>
      fetch(
        `http://localhost:3001/projects?start=${pageParam}&limit=${PAGE_SIZE}&sortBy=last_updated&asc=false`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((res) => res.json())
        .then((json) => {
          const data = [...json.data];
          json.data = data.map((project) => ({
            name: project.name,
            owners: project.owners,
            lastUpdated: new Date(project.last_updated),
            imageUrl: project.image_url,
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
          }));
          return json;
        }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });

  const projects = pageData?.pages.map((p) => p.data).flat();

  if (isFetching && (projects?.length ?? 0) === 0) {
    return <div>Loading repo...</div>;
  } else if (error) {
    return <div>Error loading repo, please try again.</div>;
  }

  return (
    <Box className='project-container'>
      <RepoFilters filters={filters} applyFilters={setFilters} />
      <InfiniteScroll
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.4%',
          width: '100%',
        }}
        dataLength={projects?.length ?? 0}
        next={() => !isFetching && fetchNextPage()}
        hasMore={hasNextPage}
        loader={
          isFetchingNextPage ? <h4>Loading...</h4> : <h4>End of the line</h4>
        } // TODO: use nicer loader
      >
        {projects?.map((p) => (
          <RoleplayProject key={p.name} {...p} />
        ))}
      </InfiniteScroll>
    </Box>
  );
};
