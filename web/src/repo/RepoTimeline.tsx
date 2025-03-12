import './RepoTimeline.css';
import { Event, Expand, Place } from '@mui/icons-material';
import {
  Grow,
  IconButton,
  LinearProgress,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import { useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import useInfiniteScroll, {
  InfiniteScrollRef,
  ScrollDirection,
} from 'react-easy-infinite-scroll-hook';
import { useNavigate } from 'react-router-dom';

import { TimelineCard } from './TimelineCard';
import { RoleplayEvent } from '../model/RoleplayEvent';
import { mapProject } from '../model/RoleplayProject';
import { PageData, queryServer } from '../model/ServerResponse';
import { useDragScroll } from '../util/DragScroll';
import { lerp } from '../util/Math';
import { isDst, observesDst, offsetDateByDays } from '../util/Time';

/**
 * Queries for timeline events will be done in intervals of this length in days.
 */
const QUERY_INTERVAL_LENGTH = 14;
const DEFAULT_PIXELS_PER_HOUR = 70;
const SCROLL_LOAD_TRESHOLD_PX = 500;

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
  const navigate = useNavigate();
  const [pixelsPerHour, setPixelsPerHour] = useState(DEFAULT_PIXELS_PER_HOUR);
  const [useMilitaryTime, setUseMilitaryTime] = useState(false);
  const [showColumnWidthSlider, setShowColumnWidthSlider] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const startOfInitialDate = new Date(initialDate);
  startOfInitialDate.setHours(0, 0, 0);
  const initialStartDate = offsetDateByDays(
    startOfInitialDate,
    -QUERY_INTERVAL_LENGTH / 2,
  );
  const initialEndDate = offsetDateByDays(
    initialStartDate,
    QUERY_INTERVAL_LENGTH,
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalStartDate, setTotalStartDate] = useState(initialStartDate);
  const [totalEndDate, setTotalEndDate] = useState(initialEndDate);
  const {
    data: pageData,
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
        const adjustDst = (date: Date) => {
          if (observesDst(date) && isDst(date) && isDst(totalStartDate)) {
            date.setHours(date.getHours() - 1);
          }

          return date;
        };

        pageData.data = pageData.data.map((event) => ({
          isConfirmed: event.isConfirmed,
          isDefaultEnd: event.isDefaultEnd,
          startDate: adjustDst(new Date(event.startDate)),
          endDate: adjustDst(new Date(event.endDate)),
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
    pixelsPerHour;

  const { ref: dragRef, node: timelineNode } = useDragScroll({
    onDragEnd: (node) => {
      if (!node) {
        return;
      }

      const newDate = new Date(
        totalStartDate.getTime() +
          ((node.scrollLeft + window.innerWidth / 2) / pixelsPerHour) *
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
    ? timelineNode.scrollLeft - timelineNode.clientWidth
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

  const timelineContainsDate = (date: Date) =>
    date > totalStartDate && date < totalEndDate;

  const scrollToDate = (date: Date) => {
    setTimeQuery(date);
    if (!timelineContainsDate(date)) {
      setTimeout(() => navigate(0), 500);
    } else {
      setTimeout(() => setCurrentDate(new Date()), 1000);
    }
    timelineNode?.scrollTo({
      behavior: 'smooth',
      left: getAbsolutePosition(date) - timelineNode.clientWidth / 2,
    });
  };

  // Uses native MouseEvent
  const handleClickOutsideDatePicker = (event: MouseEvent) => {
    // Close if click is outside the button or calendar.
    if (
      calendarRef.current &&
      buttonRef.current &&
      !calendarRef.current.contains(event.target as Node) &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      closeCalendar();
    }
  };

  const openCalendar = () => {
    document.addEventListener('click', handleClickOutsideDatePicker, {
      capture: true,
    });
    setShowDatePicker(true);
  };

  const closeCalendar = () => {
    document.removeEventListener('click', handleClickOutsideDatePicker, {
      capture: true,
    });
    setShowDatePicker(false);
  };

  return (
    <div id='repo-timeline-component' style={{ position: 'relative' }}>
      <Stack id='timeline-controls'>
        <Tooltip
          title='Jump to current time'
          placement='top'
          slotProps={{
            tooltip: {
              style: { marginBottom: 4 },
            },
          }}
        >
          <IconButton
            className='timeline-control'
            onClick={() => scrollToDate(currentDate)}
          >
            <Place fontSize='large' />
          </IconButton>
        </Tooltip>
        <Stack direction='row' alignItems='flex-end' gap={2} height='48px'>
          <Grow
            in={showDatePicker}
            style={{ transformOrigin: 'bottom right' }}
            unmountOnExit
          >
            <DateCalendar
              ref={calendarRef}
              value={initialDate && dayjs(initialDate)}
              onChange={(value) => {
                if (value) {
                  const date = value.toDate() as Date;
                  date.setHours(12, 0, 0, 0);
                  scrollToDate(date);
                }
                closeCalendar();
              }}
            />
          </Grow>
          <Tooltip
            title='Jump to date'
            placement='top'
            slotProps={{
              tooltip: {
                style: { marginBottom: 4 },
              },
            }}
          >
            <IconButton
              ref={buttonRef}
              className='timeline-control'
              onClick={() => {
                if (showDatePicker) {
                  closeCalendar();
                } else {
                  openCalendar();
                }
              }}
            >
              <Event fontSize='large' />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack direction='row' alignItems='center' gap={2}>
          <Grow
            in={showColumnWidthSlider}
            style={{ transformOrigin: 'right center' }}
            unmountOnExit
          >
            <div id='hour-width-slider-container'>
              <Slider
                id='hour-width-slider'
                min={50}
                max={100}
                value={pixelsPerHour}
                valueLabelDisplay='auto'
                valueLabelFormat={(v) => `${v}px`}
                onChange={(_, val) => {
                  const newPixelsPerHour = val as number;
                  setPixelsPerHour(newPixelsPerHour);
                  // TODO: make this a bit less choppy
                  if (timelineNode) {
                    const { scrollLeft, scrollWidth, clientWidth } =
                      timelineNode;
                    const scrollPercent =
                      (scrollLeft + clientWidth / 2) / scrollWidth;
                    const percentChange = newPixelsPerHour / pixelsPerHour;
                    timelineNode.scrollLeft =
                      scrollWidth * percentChange * scrollPercent -
                      clientWidth / 2;
                  }
                }}
                slotProps={{
                  thumb: { style: { borderRadius: 2, height: 24, width: 8 } },
                }}
              />
            </div>
          </Grow>
          <Tooltip
            title='Column width'
            placement='top'
            slotProps={{
              tooltip: {
                style: { marginBottom: 4 },
              },
            }}
          >
            <IconButton
              className='timeline-control'
              onClick={() => setShowColumnWidthSlider(!showColumnWidthSlider)}
            >
              <Expand fontSize='large' style={{ transform: 'rotate(90deg)' }} />
            </IconButton>
          </Tooltip>
        </Stack>
        <ToggleButtonGroup
          id='military-time-toggle'
          exclusive
          size='small'
          value={useMilitaryTime}
          onChange={(_, newUseMilitaryTime) => {
            if (newUseMilitaryTime !== null) {
              setUseMilitaryTime(newUseMilitaryTime);
            }
          }}
          aria-label='view-toggle'
        >
          <Tooltip
            title='12 hour time'
            placement='top'
            slotProps={{
              tooltip: {
                style: { marginBottom: 4 },
              },
            }}
          >
            <ToggleButton className='timeline-control' value={false}>
              12AM
            </ToggleButton>
          </Tooltip>
          <Tooltip
            title='24 hour time'
            placement='top'
            slotProps={{
              tooltip: {
                style: { marginBottom: 4 },
              },
            }}
          >
            <ToggleButton className='timeline-control' value={true}>
              00:00
            </ToggleButton>
          </Tooltip>
        </ToggleButtonGroup>
      </Stack>

      <div
        ref={(node) => {
          infiniteScrollRef.current = node;
          dragRef(node);
        }}
        className='scrollable-y scrollable-x hidden-scrollbar'
        style={{ position: 'relative', height: '100%' }}
      >
        {timelineContainsDate(currentDate) && (
          <div
            id='timeline-now'
            style={{ left: getAbsolutePosition(currentDate) }}
          />
        )}

        <div id='repo-timeline-grid' style={{ gridAutoColumns: pixelsPerHour }}>
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
                      {useMilitaryTime
                        ? `${`${hour}`.padStart(2, '0')}:00`
                        : `${((hour + 11) % 12) + 1}${hour > 11 ? 'PM' : 'AM'}`}
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
