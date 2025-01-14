import './Repo.css';
import { RoleplayProject } from '../components/RoleplayProjectCard';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Box, useTheme } from '@mui/material';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useState } from 'react';
import {
  remapRoleplayProject,
  RoleplayProjectProps,
} from '../model/RoleplayProject';
import { RepoFilters } from './RepoFilters';

const PAGE_SIZE = 50;

interface ProjectQueryResponse {
  hasNextPage: boolean;
  data: RoleplayProjectProps[];
  nextCursor: number;
}

export const Repo = () => {
  const theme = useTheme();
  const [nameFilter, setNameFilter] = useState<string>('');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const {
    data: pageData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['projects', nameFilter, tagFilters],
    queryFn: async ({ pageParam }) => {
      const url = new URL('/projects', 'http://localhost:3001'); // TODO: set base url from env
      url.searchParams.append('start', `${pageParam}`);
      url.searchParams.append('limit', `${PAGE_SIZE}`);
      url.searchParams.append('sortBy', 'last_updated');
      url.searchParams.append('asc', `false`);
      if (nameFilter) {
        url.searchParams.append('name', nameFilter);
      }
      if (tagFilters && tagFilters.length > 0) {
        url.searchParams.append('tags', tagFilters.join('|'));
      }
      return fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((json) => {
          const data = [...json.data];
          json.data = data.map(remapRoleplayProject);
          return json;
        });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });

  const addTag = (tag: string) => {
    if (tagFilters.includes(tag)) {
      return;
    }
    setTagFilters(tagFilters.concat([tag]));
  };

  const removeTag = (tag: string) => {
    const index = tagFilters.indexOf(tag);
    if (index !== -1) {
      setTagFilters(tagFilters.filter((t) => t !== tag));
    }
  };

  const projects = pageData?.pages.map((p) => p.data).flat();

  if (isFetching && (projects?.length ?? 0) === 0) {
    return <div>Loading repo...</div>;
  } else if (error) {
    return <div>Error loading repo, please try again.</div>;
  }

  return (
    <Box className='project-container'>
      <RepoFilters
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        tagFilters={tagFilters}
        removeTagFilter={removeTag}
      />
      <InfiniteScroll
        className='repo-search-results'
        dataLength={projects?.length ?? 0}
        next={() => !isFetching && fetchNextPage()}
        hasMore={hasNextPage}
        loader={
          isFetchingNextPage ? <h4>Loading...</h4> : <h4>End of the line</h4>
        } // TODO: use nicer loader
      >
        {projects?.map((p) => (
          <RoleplayProject key={p.name} project={p} addTag={addTag} />
        ))}
      </InfiniteScroll>
    </Box>
  );
};
