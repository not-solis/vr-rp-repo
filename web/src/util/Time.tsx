import dayjs from 'dayjs';

import { ScheduleRegion } from '../model/RoleplayScheduling';

export const getLocale = () => {
  return navigator.languages ? navigator.languages[0] : navigator.language;
};

export const getTimezoneName = () =>
  new Intl.DateTimeFormat(getLocale(), {
    timeZoneName: 'short',
  })
    .formatToParts(new Date())
    .find((part) => part.type === 'timeZoneName');

export const getTimeRangeString = (start: Date, end?: Date) => {
  const parts = [];
  parts.push(end ? 'from' : 'at');
  parts.push(dayjs(start).format('h:mmA'));
  if (end) {
    parts.push('to');
    parts.push(dayjs(end).format('h:mmA'));
  }
  return parts.join(' ');
};

export const getRegionString = (region: ScheduleRegion) => {
  return `[${region}]`;
};
