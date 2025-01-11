import './Repo.css';
import { RoleplayProject } from '../components/RoleplayProject';
import { getProjects, SortType } from '../api/data';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Box } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useState } from 'react';

const PAGE_SIZE = 10;

export const Repo = () => {
  const {
    data: pageData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: ({ pageParam }) => {
      console.log('query starts at', pageParam);
      return getProjects(pageParam, PAGE_SIZE, SortType.UPDATED_TIME);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _2, lastPageParam) =>
      lastPage.hasNextPage ? lastPageParam + PAGE_SIZE : undefined,
  });

  if (isFetching) {
    return <div>Loading repo...</div>;
  } else if (error) {
    return <div>Error loading repo, please try again.</div>;
  }

  const projects = pageData?.pages.map((p) => p.data).flat();

  return (
    <Box className='project-container'>
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
