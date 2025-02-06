import './HomePage.css';
import { Send } from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Slider from 'react-slick';

import { UpdateComponent } from '../components/UpdateComponent';
import { useAuth } from '../context/AuthProvider';
import { useSnackbar } from '../context/SnackbarProvider';
import { getProjectDates, RoleplayProject } from '../model/RoleplayProject';
import { PageData, queryServer } from '../model/ServerResponse';
import { postUpdate, Update } from '../model/Update';
import { UserRole } from '../model/User';
import { RoleplayProjectCard } from '../repo/RoleplayProjectCard';

const UPDATE_PAGE_SIZE = 50;
const PROJECT_CAROUSEL_TOTAL = 10;

export const HomePage = () => {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [updateText, setUpdateText] = useState('');
  const { createErrorSnackbar } = useSnackbar();
  const {
    data: updatePageData,
    fetchNextPage,
    hasNextPage,
    isFetching: isFetchingUpdates,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['updates', 'home'],
    queryFn: async ({ pageParam }) =>
      queryServer<PageData<Update>>('/updates', {
        queryParams: {
          start: `${pageParam}`,
          limit: `${UPDATE_PAGE_SIZE}`,
        },
      }).then((pageData) => {
        if (!pageData) {
          throw new Error('Missing page data');
        }
        pageData.data.forEach((update) => {
          const { created } = update;
          update.created = new Date(created);
        });
        return pageData;
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects', 'home'],
    queryFn: () =>
      queryServer<PageData<RoleplayProject>>('/projects', {
        queryParams: {
          start: '0',
          limit: `${PROJECT_CAROUSEL_TOTAL}`,
          sortBy: 'created_at',
          asc: 'false',
        },
      }).then((pageData) => {
        if (!pageData) {
          throw new Error('Missing page data');
        }
        return pageData;
      }),
    select: (pageData: PageData<RoleplayProject>) =>
      pageData.data.map(getProjectDates),
  });

  const updates = updatePageData?.pages.map((p) => p.data).flat();

  const refetchUpdates = () => {
    queryClient.refetchQueries({
      queryKey: ['updates'],
    });
  };

  return (
    <Stack id='home-page' direction='column'>
      <div id='home-page-header'>
        <Typography variant='h2' fontSize={32} lineHeight={2.4} paddingLeft={2}>
          The front page of VR Roleplay
        </Typography>
      </div>
      <div id='home-page-contents' className='scrollable-y hidden-scrollbar'>
        <Stack id='home-page-project-bar'>
          <Typography variant='h3'>Newly Added</Typography>
          {projects && (
            <Slider
              className='project-slider'
              dots
              infinite
              speed={500}
              slidesToShow={4}
              slidesToScroll={1}
              swipe
              responsive={[
                {
                  breakpoint: 2400,
                  settings: {
                    slidesToShow: 3,
                  },
                },
                {
                  breakpoint: 1200,
                  settings: {
                    slidesToShow: 2,
                  },
                },
                {
                  breakpoint: 800,
                  settings: {
                    slidesToShow: 1,
                  },
                },
              ]}
            >
              {projects
                .map((project) => ({ ...project, otherLinks: [] }))
                .map((project) => (
                  <div key={project.id}>
                    <RoleplayProjectCard project={project} />
                  </div>
                ))}
            </Slider>
          )}
        </Stack>
        <Stack id='home-page-updates-bar' gap={2}>
          <Typography variant='h3'>Updates</Typography>
          {hasPermission(UserRole.Admin) && (
            <Stack>
              <TextField
                value={updateText}
                onChange={(e) =>
                  setUpdateText(e.target.value.substring(0, 2048))
                }
                fullWidth
                multiline
                minRows={4}
                maxRows={8}
                helperText='Admin announcements only!'
                slotProps={{
                  input: { style: { borderRadius: 8 } },
                  formHelperText: { style: { maxWidth: 'calc(100% - 24px)' } },
                }}
              />
              <Stack direction='row' justifyContent='flex-end' marginTop={-2}>
                <IconButton
                  style={{
                    borderRadius: 8,
                  }}
                  onClick={() =>
                    postUpdate({
                      text: updateText,
                      onSuccess: () => {
                        refetchUpdates();
                        setUpdateText('');
                      },
                      onFailure: createErrorSnackbar,
                    })
                  }
                >
                  <Typography>Post</Typography>
                  <Send style={{ paddingLeft: 8 }} />
                </IconButton>
              </Stack>
            </Stack>
          )}
          <Stack
            id='all-updates'
            className='scrollable-y hidden-scrollbar'
            gap='16px'
            minHeight={0}
            flexGrow={1}
            paddingBottom={2}
          >
            <InfiniteScroll
              scrollableTarget='all-updates'
              dataLength={updates?.length ?? 0}
              next={() => !isFetchingUpdates && fetchNextPage()}
              hasMore={hasNextPage}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
              loader={
                isFetchingNextPage ? (
                  <CircularProgress />
                ) : (
                  <h4>End of the line</h4>
                )
              }
            >
              {updates?.map((update) => (
                <UpdateComponent
                  key={update.id}
                  update={update}
                  fullWidth
                  showProject
                />
              ))}
            </InfiniteScroll>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};
