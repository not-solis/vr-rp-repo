import './RepoTimeline.css';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

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

const SCROLL_LOAD_TRESHOLD_PX = 1; // TODO: change this

export const RepoTimeline = (props: RepoTimelineProps) => {
  const [totalStartDate, setTotalStartDate] = useState(initialStartDate);
  const [totalEndDate, setTotalEndDate] = useState(initialEndDate);
  const { tags = [], activeOnly } = props;
  const { ref: dragRef } = useDragScroll();
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
      console.log(pageParam);
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
    getPreviousPageParam: () =>
      offsetDateByDays(totalStartDate, -QUERY_INTERVAL_LENGTH),
    getNextPageParam: () => totalEndDate,
    placeholderData: (prev) => prev,
    retry: false,
  });

  const events = pageData?.pages.map((p) => p.data).flat();
  const handleInfiniteScroll = (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    const { scrollWidth, scrollLeft, clientWidth } = e.currentTarget;
    if (
      !isFetchingNextPage &&
      scrollWidth - SCROLL_LOAD_TRESHOLD_PX < scrollLeft + clientWidth
    ) {
      fetchNextPage();
    } else if (
      !isFetchingPreviousPage &&
      scrollLeft < SCROLL_LOAD_TRESHOLD_PX
    ) {
      fetchPreviousPage();
    }
  };

  return (
    <div
      id='repo-timeline-component'
      ref={dragRef}
      className='scrollable-y scrollable-x hidden-scrollbar'
      style={{ height: '100%', width: '100%' }}
      onScroll={handleInfiniteScroll}
    >
      <div id='repo-timeline-container'>
        {/* HEADER */}
        <div
          id='repo-timeline'
          style={{
            gridColumnEnd: Math.ceil(
              (totalEndDate.getTime() - totalStartDate.getTime()) /
                (60 * 60 * 1000),
            ),
          }}
        >
          {events?.map((event) => (
            <div
              key={event.project.id + event.startDate}
              style={{
                width: 100,
                height: 40,
                backgroundColor: 'white',
                borderRadius: 6,
                gridColumnStart: Math.ceil(
                  (event.startDate.getTime() - totalStartDate.getTime()) /
                    (60 * 60 * 1000),
                ),
                gridColumnEnd: Math.ceil(
                  (event.endDate.getTime() - totalStartDate.getTime()) /
                    (60 * 60 * 1000),
                ),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
