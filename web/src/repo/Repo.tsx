import './Repo.css';
import { Box, useTheme } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';

import { RepoFilters } from './RepoFilters';
import { RoleplayProjectCard } from './RoleplayProjectCard';
import {
  remapRoleplayProject,
  RoleplayProject,
} from '../model/RoleplayProject';

const PAGE_SIZE = 50;

interface ProjectQueryResponse {
  hasNext: boolean;
  data: RoleplayProject[];
  nextCursor: number;
}

const TITLE = 'The VR Roleplay Repo';

export const Repo = () => {
  const theme = useTheme();
  const [nameFilter, setNameFilter] = useState<string>('');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const {
    data: pageData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['projects', nameFilter, tagFilters, showActiveOnly],
    queryFn: async ({ pageParam }) => {
      const url = new URL('/projects', 'http://localhost:3001'); // TODO: set base url from env
      url.searchParams.append('start', `${pageParam}`);
      url.searchParams.append('limit', `${PAGE_SIZE}`);
      url.searchParams.append('sortBy', 'last_updated');
      url.searchParams.append('asc', 'false');
      if (nameFilter) {
        url.searchParams.append('name', nameFilter);
      }
      if (tagFilters && tagFilters.length > 0) {
        url.searchParams.append('tags', tagFilters.join('|'));
      }
      if (showActiveOnly) {
        url.searchParams.append('active', 'true');
      }
      return fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then<ProjectQueryResponse>((json) => {
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
      <Helmet>
        <title>{TITLE}</title>
        <meta title={TITLE} />
        <meta property='og:title' content={TITLE} />
        <meta
          property='og:description'
          content='The collection of all roleplays run in VR.'
        />
      </Helmet>
      <RepoFilters
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        tagFilters={tagFilters}
        addTagFilter={addTag}
        removeTagFilter={removeTag}
        showActiveOnly={showActiveOnly}
        setShowActiveOnly={setShowActiveOnly}
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
          <RoleplayProjectCard key={p.name} project={p} addTag={addTag} />
        ))}
      </InfiniteScroll>
    </Box>
  );
};
