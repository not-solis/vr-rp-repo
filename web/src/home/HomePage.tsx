import { CircularProgress, Stack, Typography } from '@mui/material';
import './HomePage.css';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';

import { UpdateComponent } from '../components/UpdateComponent';
import { PageData, queryServer } from '../model/ServerResponse';
import { Update } from '../model/Update';

const UPDATE_PAGE_SIZE = 50;

export const HomePage = () => {
  const {
    data: pageData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['updates'],
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

  const updates = pageData?.pages.map((p) => p.data).flat();

  return (
    <Stack id='home-page' direction='column'>
      <div id='home-page-header'>
        <Typography variant='h2' fontSize={32} lineHeight={2.4} paddingLeft={2}>
          The front page of VR Roleplay
        </Typography>
      </div>
      <Stack
        id='home-page-contents'
        flexGrow={1}
        minHeight={0}
        direction='row'
        boxSizing='border-box'
      >
        <Stack style={{ width: 720, padding: '24px 32px 0' }}>
          <Typography variant='h3'>Updates</Typography>
          <div
            id='all-updates'
            className='scrollable-y hidden-scrollbar'
            style={{ flexGrow: 1, minHeight: 0, padding: '16px 0' }}
          >
            <InfiniteScroll
              scrollableTarget='all-updates'
              dataLength={updates?.length ?? 0}
              next={() => !isFetching && fetchNextPage()}
              hasMore={hasNextPage}
              style={{
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: 12,
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
                <UpdateComponent key={update.id} update={update} fullWidth />
              ))}
            </InfiniteScroll>
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
};
