import './Repo.css';
import {
  Add,
  ArrowDownward,
  ArrowUpward,
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
import { APP_KEYWORDS, APP_TITLE } from '../App';
import { BlurrableTextField } from '../components/BlurrableTextField';
import { StringEnumSelector } from '../components/StringEnumSelector';
import { TagTextField } from '../components/TagTextField';
import { useAuth } from '../context/AuthProvider';
import { mapProject, RoleplayProject } from '../model/RoleplayProject';
import { ScheduleRegion } from '../model/RoleplayScheduling';
import { PageData, queryServer } from '../model/ServerResponse';

const PAGE_SIZE = 50;

enum SortBy {
  Name = 'name',
  LastUpdated = 'last_updated',
  CreatedAt = 'created_at',
  DateStarted = 'started',
}

const TITLE = 'Repo';

export const Repo = () => {
  const [name, setName] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [regionFilter, setRegionFilter] = useState<ScheduleRegion>();
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
      regionFilter,
      showActiveOnly,
      sortBy,
      sortAscending,
    ],
    queryFn: async ({ pageParam }) =>
      queryServer<PageData<RoleplayProject>>('/projects', {
        queryParams: {
          start: `${pageParam}`,
          limit: `${PAGE_SIZE}`,
          sortBy,
          asc: `${sortAscending}`,
          ...(regionFilter ? { region: regionFilter } : {}),
          ...(nameFilter ? { name: nameFilter } : {}),
          ...(tagFilters && tagFilters.length > 0
            ? { tags: tagFilters.join('|') }
            : {}),
          ...(showActiveOnly ? { active: 'true' } : {}),
        },
      }).then((pageData) => {
        if (!pageData) {
          throw new Error('Missing page data');
        }
        pageData.data = pageData.data.map(mapProject);
        return pageData;
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    placeholderData: (prev) => prev,
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
    );
  }

  const getSortByText = () => {
    switch (sortBy) {
      case SortBy.Name:
        return sortAscending ? 'A to Z' : 'Z to A';
      case SortBy.LastUpdated:
      case SortBy.CreatedAt:
      case SortBy.DateStarted:
        return `${sortAscending ? 'Least' : 'Most'} recent`;
    }
  };

  return (
    <Box id='repo-page'>
      <Helmet>
        <title>{`${TITLE} | ${APP_TITLE}`}</title>
        <meta title={`${TITLE} | ${APP_TITLE}`} />
        <meta property='og:title' content={TITLE} />
        <meta
          name='keywords'
          content={APP_KEYWORDS.concat(['search', 'filter']).join(', ')}
        />
        <meta
          property='og:description'
          content='The collection of all roleplays that run in VR.'
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
            slotProps={{
              input: {
                endAdornment: (
                  <img
                    id='honse'
                    src='/honse1.png'
                    className={
                      nameFilter.toLowerCase() === 'honse' ? 'show' : ''
                    }
                  />
                ),
              },
            }}
          />
          <TagTextField
            label='Tags'
            variant='outlined'
            addTag={addTag}
            style={{ width: 500, maxWidth: '100%' }}
            size='small'
            tags={tagFilters}
            onTagClick={removeTag}
          />

          <FormControl style={{ minWidth: 100 }}>
            <InputLabel size='small' id='repo-region-filter'>
              Region
            </InputLabel>
            <StringEnumSelector
              includeEmptyValue
              enumType={ScheduleRegion}
              value={regionFilter ?? ''}
              labelId='repo-region-filter'
              label='Region'
              size='small'
              onChange={(e) => {
                const newRegion = e.target.value as ScheduleRegion;
                if (regionFilter !== newRegion) {
                  setRegionFilter(newRegion);
                }
              }}
            />
          </FormControl>

          <FormControl disabled={!!nameFilter} style={{ minWidth: 100 }}>
            <InputLabel size='small' id='repo-sort-by'>
              Sort by
            </InputLabel>
            <Select
              value={sortBy}
              labelId='repo-sort-by'
              label='Sort by'
              size='small'
              onChange={(e) => {
                const newSortBy = e.target.value as SortBy;
                if (sortBy !== newSortBy) {
                  setSortBy(newSortBy);
                  setSortAscending(newSortBy === SortBy.Name);
                }
              }}
            >
              <MenuItem value={SortBy.Name}>Name</MenuItem>
              <MenuItem value={SortBy.LastUpdated}>Last updated</MenuItem>
              <MenuItem value={SortBy.CreatedAt}>Date added</MenuItem>
              <MenuItem value={SortBy.DateStarted}>Date started</MenuItem>
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
      <div id='repo-scroll-box' className='scrollable-y hidden-scrollbar'>
        {isFetching && (
          <LinearProgress
            style={{
              position: 'absolute',
              bottom: 0,
              height: 6,
              left: 0,
              right: 0,
              zIndex: 2,
            }}
          />
        )}
        {results}
      </div>
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
