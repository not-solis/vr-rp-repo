import './Repo.css';
import { RoleplayProject } from '../components/RoleplayProject';
import { getProjects, SortType } from '../api/data';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, useTheme } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useState } from 'react';
import { RoleplayProjectProps } from '../model/RoleplayProject';
import { RepoFilters } from './RepoFilters';

const PAGE_SIZE = 10;

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
    queryKey: ['projects', filters],
    queryFn: ({ pageParam }) =>
      getProjects(pageParam, PAGE_SIZE, SortType.UPDATED_TIME, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextCursor : undefined,
  });

  if (isFetching) {
    return <div>Loading repo...</div>;
  } else if (error) {
    return <div>Error loading repo, please try again.</div>;
  }

  const projects = pageData?.pages.map((p) => p.data).flat();

  return (
    <Box className='project-container'>
      <RepoFilters filters={filters} applyFilters={setFilters} />
      <InfiniteScroll
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
