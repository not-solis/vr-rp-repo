import './Repo.css';
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  Check,
  CheckBoxOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useNavigate } from 'react-router-dom';

import { RoleplayProjectCard } from './RoleplayProjectCard';
import { BlurrableTextField } from '../components/BlurrableTextField';
import { TagTextField } from '../components/TagTextField';
import { useAuth } from '../context/AuthProvider';
import { useEnv } from '../context/EnvProvider';
import {
  remapRoleplayProject,
  RoleplayProject,
} from '../model/RoleplayProject';

const PAGE_SIZE = 50;

enum SortBy {
  Name = 'name',
  LastUpdated = 'last_updated',
  CreatedAt = 'created_at',
}

interface ProjectQueryResponse {
  hasNext: boolean;
  data: RoleplayProject[];
  nextCursor: number;
}

const TITLE = 'The VR Roleplay Repo';

export const Repo = () => {
  const { serverBaseUrl } = useEnv();
  const [name, setName] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(SortBy.Name);
  const [sortAscending, setSortAscending] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const {
    data: pageData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      'projects',
      nameFilter,
      tagFilters,
      showActiveOnly,
      sortBy,
      sortAscending,
    ],
    queryFn: async ({ pageParam }) => {
      const url = new URL('/projects', serverBaseUrl);
      url.searchParams.append('start', `${pageParam}`);
      url.searchParams.append('limit', `${PAGE_SIZE}`);
      url.searchParams.append('sortBy', sortBy);
      url.searchParams.append('asc', `${sortAscending}`);
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
  } else if (projects && projects.length > 0) {
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

  const getSortByText = () => {
    if (sortBy === SortBy.Name) {
      return sortAscending ? 'A → Z' : 'Z ← A';
    } else if (sortBy === SortBy.LastUpdated || sortBy === SortBy.CreatedAt) {
      return `${sortAscending ? 'Least' : 'Most'} recent`;
    }
  };

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
      <Box id='filter-bar'>
        <FormGroup id='repo-filters'>
          <BlurrableTextField
            label='Name'
            variant='outlined'
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setNameFilter(name);
            }}
            value={name}
            size='small'
          />
          <TagTextField
            label='Tags'
            variant='outlined'
            addTag={addTag}
            style={{ width: 500 }}
            size='small'
            tags={tagFilters}
            onTagClick={removeTag}
          />

          <FormControl disabled={!!nameFilter} style={{ minWidth: 100 }}>
            <InputLabel size='small' id='repo-sort-by'>
              Sort by
            </InputLabel>
            <Select
              value={sortBy}
              labelId='repo-sort-by'
              label='Sort by'
              size='small'
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <MenuItem value={SortBy.Name}>Name</MenuItem>
              <MenuItem value={SortBy.LastUpdated}>Last updated</MenuItem>
              <MenuItem value={SortBy.CreatedAt}>Date added</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            disabled={!!nameFilter}
            control={
              <Checkbox
                color='default'
                checked={sortAscending}
                icon={<ArrowDownward color='secondary' />}
                checkedIcon={<ArrowUpward color='primary' />}
                onChange={(e) => setSortAscending(e.target.checked)}
              />
            }
            label={getSortByText()}
            labelPlacement='end'
          />

          <FormControlLabel
            control={
              <Checkbox
                color='default'
                checked={showActiveOnly}
                checkedIcon={<CheckBoxOutlined color='success' />}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
              />
            }
            label='Show Active Only'
            labelPlacement='end'
            slotProps={{
              typography: {
                variant: 'body1',
              },
            }}
          />

          {hasPermission() && (
            <div style={{ marginLeft: 'auto', textDecoration: 'none' }}>
              <IconButton
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderRadius: 8,
                }}
                onClick={() => setShowNewDialog(true)}
              >
                <Add />
                <Typography variant='body1'>Add New</Typography>
              </IconButton>
            </div>
          )}
        </FormGroup>
      </Box>
      {/* <RepoFilters
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        tagFilters={tagFilters}
        addTagFilter={addTag}
        removeTagFilter={removeTag}
        showActiveOnly={showActiveOnly}
        setShowActiveOnly={setShowActiveOnly}
        openNewRepoDialog={() => setShowNewDialog(true)}
      /> */}
      {isFetching && <LinearProgress />}
      {results}
      <Dialog
        id='new-roleplay-dialog'
        open={showNewDialog}
        onClose={() => setShowNewDialog(false)}
        aria-labelledby='new-roleplay-dialog-title'
        aria-describedby='new-roleplay-dialog-description'
      >
        <DialogTitle id='new-roleplay-dialog-title'>
          Create a roleplay in the Repo?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='new-roleplay-dialog-description'>
            You will be listed as the owner of this roleplay. Make sure you are
            authorized to represent it before continuing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='plain' onClick={() => setShowNewDialog(false)}>
            Back
          </Button>
          <Button color='plain' onClick={() => navigate('/repo/new')} autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
