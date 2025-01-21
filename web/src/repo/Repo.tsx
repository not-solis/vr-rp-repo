import './Repo.css';
import { Box, CircularProgress, LinearProgress, useTheme } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import InfiniteScroll from 'react-infinite-scroll-component';

import { RepoFilters } from './RepoFilters';
import { RoleplayProjectCard } from './RoleplayProjectCard';
import { useEnv } from '../context/EnvProvider';
import {
  remapRoleplayProject,
  RoleplayProject,
  RoleplayStatus,
} from '../model/RoleplayProject';

const PAGE_SIZE = 50;

interface ProjectQueryResponse {
  hasNext: boolean;
  data: RoleplayProject[];
  nextCursor: number;
}

const TITLE = 'The VR Roleplay Repo';

export const Repo = () => {
  const { serverBaseUrl } = useEnv();
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
      const url = new URL('/projects', serverBaseUrl);
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

  let results;
  if (error) {
    results = <div>Error loading repo, please try again.</div>;
  } else if (!isFetching && projects && projects.length > 0) {
    results = (
      <div id='repo-scroll-box' className='scrollable-y hidden-scrollbar'>
        <InfiniteScroll
          scrollableTarget='repo-scroll-box'
          className='repo-search-results'
          dataLength={projects?.length ?? 0}
          next={() => !isFetching && fetchNextPage()}
          hasMore={hasNextPage}
          loader={
            isFetchingNextPage ? <CircularProgress /> : <h4>End of the line</h4>
          }
        >
          {projects?.map((p) => (
            <RoleplayProjectCard key={p.name} project={p} addTag={addTag} />
          ))}
        </InfiniteScroll>
      </div>
    );
  }

  return (
    <Box id='repo-page'>
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
      {isFetching && <LinearProgress />}
      {results}
    </Box>
  );
};
