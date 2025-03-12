import dayjs from 'dayjs';

import { ScheduleRegion } from '../model/RoleplayScheduling';

const stdTimezoneOffset = (date: Date) => {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
};

export const observesDst = (date: Date) => {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  return jan.getTimezoneOffset() != jul.getTimezoneOffset();
};

export const isDst = (date: Date) => {
  return date.getTimezoneOffset() < stdTimezoneOffset(date);
};

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

export const offsetDateByDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
