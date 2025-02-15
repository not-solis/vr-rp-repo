import './RepoTimeline.css';
import { LinearProgress, Typography } from '@mui/material';
import { useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import useInfiniteScroll, {
  InfiniteScrollRef,
  ScrollDirection,
} from 'react-easy-infinite-scroll-hook';

import { TimelineCard } from './TimelineCard';
import { RoleplayEvent } from '../model/RoleplayEvent';
import { mapProject } from '../model/RoleplayProject';
import { PageData, queryServer } from '../model/ServerResponse';
import { useDragScroll } from '../util/DragScroll';
import { lerp } from '../util/Math';
import { offsetDateByDays } from '../util/Time';

/**
 * Queries for timeline events will be done in intervals of this length in days.
 */
const QUERY_INTERVAL_LENGTH = 14;
export const PIXELS_PER_HOUR = 70;
const SCROLL_LOAD_TRESHOLD_PX = PIXELS_PER_HOUR * 6;

interface RepoTimelineProps {
  tags?: string[];
  activeOnly?: boolean;
  initialDate?: Date;
  setTimeQuery?: (date: Date) => void;
}
export const RepoTimeline = (props: RepoTimelineProps) => {
  const {
    tags = [],
    activeOnly,
    initialDate = new Date(),
    setTimeQuery = () => {},
  } = props;
  const initialStartDate = offsetDateByDays(
    initialDate,
    -QUERY_INTERVAL_LENGTH / 2,
  );
  initialStartDate.setHours(0, 0, 0, 0);
  const initialEndDate = offsetDateByDays(
    initialStartDate,
    QUERY_INTERVAL_LENGTH,
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalStartDate, setTotalStartDate] = useState(initialStartDate);
  const [totalEndDate, setTotalEndDate] = useState(initialEndDate);
  const {
    data: pageData,
    error,
    fetchPreviousPage,
    fetchNextPage,
    isFetching,
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
          isDefaultEnd: event.isDefaultEnd,
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
  const getAbsolutePosition = (date: Date) =>
    ((date.getTime() - totalStartDate.getTime()) / (1000 * 60 * 60)) *
    PIXELS_PER_HOUR;

  const { ref: dragRef, node: timelineNode } = useDragScroll({
    onDragEnd: (node) => {
      if (!node) {
        return;
      }

      const newDate = new Date(
        totalStartDate.getTime() +
          ((node.scrollLeft + window.innerWidth / 2) / PIXELS_PER_HOUR) *
            60 *
            60 *
            1000,
      );
      setTimeQuery(newDate);
    },
    onOffsetNode: () => setCurrentDate(new Date()),
  });
  const infiniteScrollRef: InfiniteScrollRef<HTMLDivElement> =
    useInfiniteScroll({
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
        left: getAbsolutePosition(initialDate) - window.innerWidth / 2,
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

  const left = timelineNode
    ? timelineNode.scrollLeft + timelineNode.clientWidth
    : 0;
  const right = timelineNode ? left + 3 * timelineNode.clientWidth : 0;
  const leftDate = timelineNode
    ? new Date(
        lerp(
          totalStartDate.getTime(),
          totalEndDate.getTime(),
          left / timelineNode.scrollWidth,
        ),
      )
    : totalStartDate;
  const rightDate = timelineNode
    ? new Date(
        lerp(
          totalStartDate.getTime(),
          totalEndDate.getTime(),
          right / timelineNode.scrollWidth,
        ),
      )
    : totalStartDate;
  const canRender = (columnStart: number, columnEnd: number) => {
    const startDate = new Date(totalStartDate);
    startDate.setHours(startDate.getHours() + columnStart - 1);
    const endDate = new Date(totalStartDate);
    endDate.setDate(endDate.getDate() + columnEnd - 1);
    return startDate < rightDate && endDate > leftDate;
  };

  return (
    <div
      id='repo-timeline-component'
      ref={(node) => {
        infiniteScrollRef.current = node;
        dragRef(node);
      }}
      className='scrollable-y scrollable-x hidden-scrollbar'
    >
      <div style={{ position: 'relative', height: '100%' }}>
        <div
          id='timeline-now'
          style={{ left: getAbsolutePosition(currentDate) }}
        />

        <div
          id='repo-timeline-grid'
          style={{ gridAutoColumns: PIXELS_PER_HOUR }}
        >
          <div
            id='repo-timeline-header'
            style={{ gridColumnEnd: timelineHours + 1 }}
          >
            {dayColumns
              .filter((column) =>
                canRender(column.gridColumnStart, column.gridColumnEnd),
              )
              .map(({ day, gridColumnStart, gridColumnEnd }) => (
                <div
                  key={day}
                  className='day'
                  style={{ gridColumnStart, gridColumnEnd }}
                >
                  {(() => {
                    const date = new Date(totalStartDate);
                    return (
                      <Typography position='sticky' left={12}>
                        {dayjs(
                          date.setDate(totalStartDate.getDate() + day),
                        ).format('dddd, MMMM Do')}
                      </Typography>
                    );
                  })()}
                </div>
              ))}
            {hourColumns
              .filter((column) =>
                canRender(column.gridColumnStart, column.gridColumnEnd),
              )
              .map(({ hour, gridColumnStart, gridColumnEnd }) => (
                <div
                  key={gridColumnStart}
                  className='hour'
                  style={{ gridColumnStart, gridColumnEnd }}
                >
                  {
                    <Typography variant='body2'>
                      {`${((hour + 11) % 12) + 1}${hour > 11 ? 'PM' : 'AM'}`}
                    </Typography>
                  }
                </div>
              ))}
          </div>
          <div
            id='repo-timeline-body'
            style={{ gridColumnEnd: timelineHours + 1 }}
          >
            {hourColumns
              .filter((column) =>
                canRender(column.gridColumnStart, column.gridColumnEnd),
              )
              .map(({ gridColumnStart, gridColumnEnd }) => (
                <div
                  key={gridColumnStart}
                  className='day'
                  style={{ gridColumnStart, gridColumnEnd }}
                />
              ))}
          </div>
          <div id='repo-timeline' style={{ gridColumnEnd: timelineHours + 1 }}>
            {events
              ?.filter((event) => {
                const { gridColumnStart, gridColumnEnd } =
                  getColumnsFromEvent(event);
                return canRender(gridColumnStart, gridColumnEnd);
              })
              .map((event) => (
                <TimelineCard
                  key={event.project.id + event.startDate}
                  event={event}
                  {...getColumnsFromEvent(event)}
                />
              ))}
          </div>
        </div>
      </div>
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
    </div>
  );
};
