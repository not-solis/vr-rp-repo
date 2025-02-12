import './RepoTimeline.css';
import { Avatar, Typography } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import useInfiniteScroll, {
  ScrollDirection,
} from 'react-easy-infinite-scroll-hook';
import { Link } from 'react-router-dom';

import { RoleplayEvent } from '../model/RoleplayEvent';
import { mapProject } from '../model/RoleplayProject';
import { PageData, queryServer } from '../model/ServerResponse';
import { useDragScroll } from '../util/DragScroll';
import { offsetDateByDays } from '../util/Time';

interface RepoTimelineProps {
  tags?: string[];
  activeOnly?: boolean;
}

/**
 * Queries for timeline events will be done in intervals of this length in days.
 */
const QUERY_INTERVAL_LENGTH = 14;
const initialStartDate = offsetDateByDays(
  new Date(),
  -QUERY_INTERVAL_LENGTH / 2,
);
initialStartDate.setHours(0, 0, 0, 0);
const initialEndDate = offsetDateByDays(
  initialStartDate,
  QUERY_INTERVAL_LENGTH,
);
const PIXELS_PER_HOUR = 40;
const SCROLL_LOAD_TRESHOLD_PX = 100;

const getEventMargins = (event: RoleplayEvent) => {
  return {
    marginLeft: PIXELS_PER_HOUR * (event.startDate.getMinutes() / 60),
    marginRight: PIXELS_PER_HOUR * (1 - event.endDate.getMinutes() / 60),
  };
};

export const RepoTimeline = (props: RepoTimelineProps) => {
  const { tags = [], activeOnly } = props;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalStartDate, setTotalStartDate] = useState(initialStartDate);
  const [totalEndDate, setTotalEndDate] = useState(initialEndDate);
  const {
    data: pageData,
    error,
    fetchPreviousPage,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingPreviousPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['events', tags, activeOnly],
    queryFn: async ({ pageParam }) => {
      return queryServer<
        PageData<RoleplayEvent, { startDate: Date; endDate: Date }>
      >('/events', {
        queryParams: {
          start_date: pageParam.toISOString(),
          end_date: offsetDateByDays(
            pageParam,
            QUERY_INTERVAL_LENGTH,
          ).toISOString(),
          ...(tags.length > 0 ? { tags: tags.join('|') } : {}),
          ...(activeOnly ? { active: 'true' } : {}),
        },
      }).then((pageData) => {
        if (!pageData) {
          throw new Error('Missing page data');
        }
        pageData.data = pageData.data.map((event) => ({
          isConfirmed: event.isConfirmed,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          project: mapProject(event.project),
        }));

        const nextCursorStart = new Date(pageData.nextCursor.startDate);
        const nextCursorEnd = new Date(pageData.nextCursor.endDate);
        if (nextCursorStart < totalStartDate) {
          setTotalStartDate(nextCursorStart);
        } else if (nextCursorEnd > totalEndDate) {
          setTotalEndDate(nextCursorEnd);
        }

        return pageData;
      });
    },
    initialPageParam: initialStartDate,
    getPreviousPageParam: () => {
      return offsetDateByDays(totalStartDate, -QUERY_INTERVAL_LENGTH);
    },
    getNextPageParam: () => totalEndDate,
    placeholderData: (prev) => prev,
    retry: false,
  });
  const events = pageData?.pages.map((p) => p.data).flat();
  const timelineHours = Math.ceil(
    (totalEndDate.getTime() - totalStartDate.getTime()) / (60 * 60 * 1000),
  );

  const { ref: dragRef } = useDragScroll();
  const infiniteScrollRef = useInfiniteScroll({
    hasMore: {
      left: true,
      right: true,
    },
    next: (direction: ScrollDirection) => {
      if (direction === ScrollDirection.LEFT) {
        fetchPreviousPage();
      } else if (direction === ScrollDirection.RIGHT) {
        fetchNextPage();
      }
      return Promise.resolve();
    },
    initialScroll: {
      left:
        QUERY_INTERVAL_LENGTH * 12 * PIXELS_PER_HOUR - window.innerWidth / 2,
    },
    scrollThreshold: SCROLL_LOAD_TRESHOLD_PX,
    columnCount: events?.length ?? 0,
  });

  useEffect(() => {
    const interval = setInterval(() => setCurrentDate(new Date()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getColumnsFromEvent = (event: RoleplayEvent) => {
    const gridColumnStart = Math.floor(
      1 +
        (event.startDate.getTime() - totalStartDate.getTime()) /
          (60 * 60 * 1000),
    );
    const gridColumnEnd = Math.floor(
      2 +
        (event.endDate.getTime() - totalStartDate.getTime()) / (60 * 60 * 1000),
    );

    return { gridColumnStart, gridColumnEnd };
  };

  const hourColumns = Array.from(Array(timelineHours).keys()).map((i) => ({
    hour: i % 24,
    gridColumnStart: i + 1,
    gridColumnEnd: i + 2,
  }));
  const dayColumns = Array.from(Array(timelineHours / 24).keys()).map((i) => ({
    day: i,
    gridColumnStart: 24 * i + 1,
    gridColumnEnd: 24 * i + 25,
  }));

  return (
    <div
      id='repo-timeline-component'
      ref={(node) => {
        infiniteScrollRef.current = node;
        dragRef(node);
      }}
      className='scrollable-y scrollable-x hidden-scrollbar'
      style={{ height: '100%', width: '100%' }}
    >
      <div
        id='repo-timeline-container'
        style={{ gridAutoColumns: PIXELS_PER_HOUR }}
      >
        <div
          id='repo-timeline-header'
          style={{ gridColumnEnd: timelineHours + 1 }}
        >
          {dayColumns.map(({ day, gridColumnStart, gridColumnEnd }) => (
            <div
              key={day}
              className='day'
              style={{ gridColumnStart, gridColumnEnd }}
            >
              {(() => {
                const date = new Date(totalStartDate);
                return (
                  <Typography>
                    {dayjs(date.setDate(totalStartDate.getDate() + day)).format(
                      'dddd, MMMM Do',
                    )}
                  </Typography>
                );
              })()}
            </div>
          ))}
        </div>
        <div
          id='repo-timeline-body'
          style={{ gridColumnEnd: timelineHours + 1 }}
        >
          {hourColumns.map(({ gridColumnStart, gridColumnEnd }) => (
            <div
              key={gridColumnStart}
              className='day'
              style={{ gridColumnStart, gridColumnEnd }}
            />
          ))}
        </div>
        {/* <div
          style={{
            position: 'absolute',
            width: 2,
            top: 0,
            bottom: 0,
            left: (currentDate.getTime() - totalStartDate.getTime()) / 100,
          }}
        ></div> */}
        <div id='repo-timeline' style={{ gridColumnEnd: timelineHours + 1 }}>
          {events?.map((event) => {
            const { startDate, endDate, project } = event;
            const { id: projectId, urlName, name, imageUrl } = project;
            const { gridColumnStart, gridColumnEnd } =
              getColumnsFromEvent(event);
            const { marginLeft, marginRight } = getEventMargins(event);
            return (
              <Link
                to={`/repo/${urlName}`}
                key={projectId + startDate}
                className='no-underline colorless'
                style={{
                  boxSizing: 'border-box',
                  padding: 1,
                  gridColumnStart,
                  gridColumnEnd,
                }}
              >
                <div
                  style={{
                    boxSizing: 'border-box',
                    height: 90,
                    marginLeft,
                    marginRight,
                    backgroundColor: 'var(--mui-palette-background-default)',
                    boxShadow: 'var(--mui-shadows-4)',
                    borderRadius: 16,
                  }}
                >
                  <div
                    style={{
                      boxSizing: 'border-box',
                      backgroundColor: 'var(--mui-palette-background-light)',
                      width: '100%',
                      height: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 16,
                      padding: '0 8px',
                    }}
                  >
                    <div
                      style={{
                        position: 'sticky',
                        left: 12,
                        display: 'flex',
                        alignItems: 'center',
                        minWidth: 0,
                      }}
                    >
                      {imageUrl && (
                        <Avatar
                          alt={name}
                          src={imageUrl}
                          style={{ width: 32, height: 32, marginRight: 8 }}
                        />
                      )}
                      <Typography noWrap>{name}</Typography>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
