import './ScheduleDisplay.css';

import { Add, Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DatePicker, MobileTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { ReactNode, useState } from 'react';

import { IconText, IconTextProps } from './IconText';
import { StringEnumSelector } from './StringEnumSelector';
import { TagChip } from './TagChip';
import {
  RoleplaySchedule,
  ScheduleRegion,
  ScheduleType,
} from '../model/RoleplayScheduling';
import { getTimezoneName } from '../util/Time';

const empty = <></>;

interface RegionComponentProps {
  isEditing: boolean;
  region?: ScheduleRegion;
  onChange: (region?: ScheduleRegion) => void;
  extraComponent?: ReactNode;
}
const RegionComponent = (props: RegionComponentProps) => {
  const { isEditing, region, onChange, extraComponent } = props;
  const selector = (
    <StringEnumSelector
      includeEmptyValue
      value={region || ''}
      enumType={ScheduleRegion}
      onChange={(e) =>
        onChange((e.target.value as ScheduleRegion) || undefined)
      }
      slotProps={{ root: { style: { minWidth: 46 } } }}
    />
  );
  return isEditing ? (
    extraComponent ? (
      <span style={{ position: 'relative' }}>
        {selector}
        {extraComponent}
      </span>
    ) : (
      selector
    )
  ) : (
    // <>{region && getRegionString(region)}</>
    <>{region && <TagChip className='region-tag' label={region} />}</>
  );
};

interface WeeksComponentProps {
  isEditing: boolean;
  weeks?: number;
  onChange: (value: number) => void;
}
const WeeksComponent = (props: WeeksComponentProps) => {
  const { isEditing, weeks, onChange } = props;
  if (!isEditing && (!weeks || weeks < 2)) {
    return null;
  }

  const weeksElement = isEditing ? (
    <TextField
      className='runtime-weeks-input'
      type='number'
      variant='outlined'
      value={weeks}
      style={{ width: 40 }}
      onChange={(e) => onChange(parseInt(e.currentTarget.value))}
      // slotProps={{ input: { style: { minWidth: 46 } } }}
      // mapDisplayValue={(v) => getRegionString(v as ScheduleRegion)}
    />
  ) : (
    <>{weeks}</>
  );

  return <>Every {weeksElement} weeks on</>;
};

interface DateComponentProps {
  isEditing: boolean;
  date?: Date;
  scheduleType: ScheduleType;
  label: string;
  plural?: boolean;
  onChange: (dateDateJs: dayjs.Dayjs | null) => void;
}
const DateComponent = (props: DateComponentProps) => {
  const {
    isEditing,
    date,
    scheduleType,
    label,
    plural = false,
    onChange,
  } = props;
  const dateDayJs = date && dayjs(date);
  const isPeriodic = scheduleType === ScheduleType.Periodic;
  const format = isPeriodic ? 'dddd' : 'MMMM Do, YYYY';
  return isEditing ? (
    <DatePicker
      className='runtime-date-picker'
      label={label}
      defaultValue={dateDayJs}
      value={dateDayJs}
      format={format}
      onChange={onChange}
      slotProps={{
        textField: {
          size: 'small',
          variant: 'outlined',
          style: { width: isPeriodic ? 136 : 226 },
        },
      }}
    />
  ) : (
    <>{dateDayJs?.format(format + (isPeriodic && plural ? '[s]' : ''))}</>
  );
};

interface TimeComponentProps {
  isEditing: boolean;
  time?: Date;
  label: string;
  onChange: (dateDateJs: dayjs.Dayjs | null) => void;
}
const TimeComponent = (props: TimeComponentProps) => {
  const { isEditing, time, label, onChange } = props;
  const timeDayJs = time && dayjs(time);
  const format = 'h:mmA';
  return isEditing ? (
    <MobileTimePicker
      className='runtime-time-picker'
      label={label}
      defaultValue={timeDayJs}
      value={timeDayJs}
      format={format}
      onChange={onChange}
      slotProps={{
        textField: {
          size: 'small',
          variant: 'outlined',
        },
      }}
    />
  ) : (
    <>{timeDayJs?.format(format)}</>
  );
};

interface OtherTextComponentProps {
  isEditing: boolean;
  text?: string;
  label: string;
  onChange: (text: string) => void;
}
const OtherTextComponent = (props: OtherTextComponentProps) => {
  const { isEditing, text, label, onChange } = props;
  return isEditing ? (
    <TextField
      variant='standard'
      label={label}
      value={text ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <>{text}</>
  );
};

interface ScheduleDisplayProps {
  enablePreview?: boolean;
  schedule?: RoleplaySchedule;
  setSchedule?: (schedule: RoleplaySchedule) => void;
}
export const ScheduleDisplay = (
  props: ScheduleDisplayProps & IconTextProps,
) => {
  const [isPreviewSchedule, setPreviewSchedule] = useState(false);
  const {
    enablePreview = false,
    schedule = { type: ScheduleType.Periodic, runtimes: [] },
    setSchedule = () => {},
    containerStyle = {},
    isEditing = false,
    ...restIconTextProps
  } = props;

  if (!isEditing && !schedule) {
    return null;
  }

  const internalSetSchedule = () => setSchedule({ ...schedule });
  const { type, region, scheduleLink, otherText, runtimes } = schedule;
  const usesRuntime = [ScheduleType.Periodic, ScheduleType.OneShot].includes(
    type,
  );
  const hasRuntimes = usesRuntime && runtimes.length > 0;

  if (!isEditing && usesRuntime && runtimes.length === 0 && !otherText) {
    return null;
  }

  if (!isEditing && type === ScheduleType.ScheduleLink && !scheduleLink) {
    return null;
  }

  if (!isEditing && type === ScheduleType.Other && !otherText) {
    return null;
  }

  const showEdit = isEditing && !isPreviewSchedule;
  const setOtherText = (text: string) =>
    setSchedule({ ...schedule, otherText: text });

  return (
    <>
      <IconText
        className='schedule-display'
        icon='clock'
        iconPrefix='far'
        containerStyle={{
          ...containerStyle,
        }}
        url={
          !showEdit && schedule.type === ScheduleType.ScheduleLink
            ? schedule.scheduleLink
            : undefined
        }
        component={
          <>
            <div style={{ flexGrow: 1 }}>
              {showEdit && (
                <Stack
                  direction='row'
                  width='100%'
                  height='min-content'
                  alignItems='flex-start'
                  gap={1}
                  marginBottom={hasRuntimes ? 1 : 0}
                >
                  <StringEnumSelector
                    value={type}
                    enumType={ScheduleType}
                    onChange={(e) =>
                      setSchedule({
                        ...schedule,
                        type: e.target.value as ScheduleType,
                      })
                    }
                    slotProps={{ root: { style: { minWidth: 46 } } }}
                    style={{ position: 'relative' }}
                  />
                  <RegionComponent
                    isEditing={showEdit}
                    region={region}
                    onChange={(newRegion) => {
                      setSchedule({ ...schedule, region: newRegion });
                    }}
                  />
                </Stack>
              )}

              {type === ScheduleType.Periodic && (
                <Typography
                  className='periodic-schedule-display'
                  component='span'
                  width='100%'
                  lineHeight={showEdit ? 2 : undefined}
                >
                  {runtimes
                    .map((runtime) => {
                      const { start, end, between, region } = runtime;
                      const parts: (JSX.Element | string)[] = [];
                      parts.push(
                        <RegionComponent
                          isEditing={showEdit}
                          region={region}
                          onChange={(newRegion) => {
                            runtime.region = newRegion;
                            internalSetSchedule();
                          }}
                          extraComponent={
                            <IconButton
                              className='runtime-remove-button'
                              size='small'
                              color='error'
                              onClick={() =>
                                setSchedule({
                                  ...schedule,
                                  runtimes: runtimes.filter(
                                    (r) => r !== runtime,
                                  ),
                                })
                              }
                            >
                              <Delete
                                className='runtime-delete'
                                fontSize='small'
                              />
                            </IconButton>
                          }
                        />,
                      );

                      const weeks = between?.days && between.days / 7;
                      parts.push(
                        <WeeksComponent
                          isEditing={showEdit}
                          weeks={weeks}
                          onChange={(val) => {
                            runtime.between = val
                              ? { days: 7 * val }
                              : undefined;
                            internalSetSchedule();
                          }}
                        />,
                      );
                      parts.push(
                        <DateComponent
                          isEditing={showEdit}
                          date={start}
                          label='Day'
                          scheduleType={type}
                          plural={weeks === 1}
                          onChange={(val) => {
                            const newDate = val?.toDate();
                            if (!newDate) {
                              return;
                            }

                            runtime.start.setFullYear(
                              newDate.getFullYear(),
                              newDate.getMonth(),
                              newDate.getDate(),
                            );
                            internalSetSchedule();
                          }}
                        />,
                      );

                      const showEnd = end || showEdit;
                      parts.push(showEnd ? 'from' : 'at');
                      parts.push(
                        <TimeComponent
                          isEditing={showEdit}
                          time={start}
                          label='Start'
                          onChange={(val) => {
                            const newDate = val?.toDate();
                            if (!newDate) {
                              return;
                            }

                            runtime.start.setHours(
                              newDate.getHours(),
                              newDate.getMinutes(),
                              newDate.getSeconds(),
                              newDate.getMilliseconds(),
                            );
                            internalSetSchedule();
                          }}
                        />,
                      );
                      if (showEnd) {
                        parts.push('to');
                        parts.push(
                          <TimeComponent
                            isEditing={showEdit}
                            time={end}
                            label='End'
                            onChange={(val) => {
                              const newDate = val?.toDate();
                              if (!newDate || !runtime.end) {
                                runtime.end = newDate;
                              } else {
                                runtime.end.setHours(
                                  newDate.getHours(),
                                  newDate.getMinutes(),
                                  newDate.getSeconds(),
                                  newDate.getMilliseconds(),
                                );
                              }

                              internalSetSchedule();
                            }}
                          />,
                        );
                      }
                      const timeZonePart = getTimezoneName();
                      if (timeZonePart) {
                        parts.push(timeZonePart.value);
                      }

                      return parts.reduce(
                        (acc, x) =>
                          acc !== empty ? (
                            <>
                              {acc} {x}
                            </>
                          ) : (
                            x
                          ),
                        empty,
                      );
                    })
                    .concat(
                      showEdit || otherText
                        ? [
                            <OtherTextComponent
                              isEditing={showEdit}
                              text={otherText}
                              label='Additional info'
                              onChange={setOtherText}
                            />,
                          ]
                        : [],
                    )
                    .reduce(
                      (acc, x) =>
                        acc !== empty ? (
                          <>
                            {acc}
                            {showEdit ? <Divider variant='middle' /> : ', '}
                            {x}
                          </>
                        ) : (
                          x
                        ),
                      empty,
                    )}
                </Typography>
              )}
              {type === ScheduleType.OneShot && (
                <Typography
                  className='one-shot-schedule-display'
                  component='span'
                  width='100%'
                  lineHeight={showEdit ? 2 : undefined}
                >
                  {runtimes
                    .map((runtime) => {
                      const { start, end, region } = runtime;
                      const parts: (JSX.Element | string)[] = [];
                      parts.push(
                        <RegionComponent
                          isEditing={showEdit}
                          region={region}
                          onChange={(newRegion) => {
                            runtime.region = newRegion;
                            internalSetSchedule();
                          }}
                          extraComponent={
                            <IconButton
                              className='runtime-remove-button'
                              size='small'
                              color='error'
                              onClick={() =>
                                setSchedule({
                                  ...schedule,
                                  runtimes: runtimes.filter(
                                    (r) => r !== runtime,
                                  ),
                                })
                              }
                            >
                              <Delete
                                className='runtime-delete'
                                fontSize='small'
                              />
                            </IconButton>
                          }
                        />,
                      );

                      const showEnd = end || showEdit;
                      parts.push(
                        <DateComponent
                          isEditing={showEdit}
                          date={start}
                          label='Day'
                          scheduleType={type}
                          onChange={(val) => {
                            const newDate = val?.toDate();
                            if (!newDate) {
                              return;
                            }

                            runtime.start.setFullYear(
                              newDate.getFullYear(),
                              newDate.getMonth(),
                              newDate.getDate(),
                            );
                            internalSetSchedule();
                          }}
                        />,
                      );

                      parts.push(
                        <TimeComponent
                          isEditing={showEdit}
                          time={start}
                          label='Start'
                          onChange={(val) => {
                            const newDate = val?.toDate();
                            if (!newDate) {
                              return;
                            }

                            runtime.start.setHours(
                              newDate.getHours(),
                              newDate.getMinutes(),
                              newDate.getSeconds(),
                              newDate.getMilliseconds(),
                            );
                            internalSetSchedule();
                          }}
                        />,
                      );
                      if (showEnd) {
                        parts.push('to');
                        parts.push(
                          <DateComponent
                            isEditing={showEdit}
                            date={end}
                            label='Day'
                            scheduleType={type}
                            onChange={(val) => {
                              const newDate = val?.toDate();
                              if (!newDate || !runtime.end) {
                                runtime.end = newDate;
                              } else {
                                runtime.end.setFullYear(
                                  newDate.getFullYear(),
                                  newDate.getMonth(),
                                  newDate.getDate(),
                                );
                              }

                              internalSetSchedule();
                            }}
                          />,
                        );
                        parts.push(
                          <TimeComponent
                            isEditing={showEdit}
                            time={end}
                            label='End'
                            onChange={(val) => {
                              const newDate = val?.toDate();
                              if (!newDate || !runtime.end) {
                                runtime.end = newDate;
                              } else {
                                runtime.end.setHours(
                                  newDate.getHours(),
                                  newDate.getMinutes(),
                                  newDate.getSeconds(),
                                  newDate.getMilliseconds(),
                                );
                              }
                              internalSetSchedule();
                            }}
                          />,
                        );
                      }
                      const timeZonePart = getTimezoneName();
                      if (timeZonePart) {
                        parts.push(timeZonePart.value);
                      }

                      return parts.reduce(
                        (acc, x) =>
                          acc !== empty ? (
                            <>
                              {acc} {x}
                            </>
                          ) : (
                            x
                          ),
                        empty,
                      );
                    })
                    .concat(
                      showEdit || otherText
                        ? [
                            <OtherTextComponent
                              isEditing={showEdit}
                              text={otherText}
                              label='Additional info'
                              onChange={setOtherText}
                            />,
                          ]
                        : [],
                    )
                    .reduce(
                      (acc, x) =>
                        acc !== empty ? (
                          <>
                            {acc}
                            {showEdit ? <Divider variant='middle' /> : ', '}
                            {x}
                          </>
                        ) : (
                          x
                        ),
                      empty,
                    )}
                </Typography>
              )}
              {type === ScheduleType.ScheduleLink &&
                (showEdit ? (
                  <TextField
                    variant='standard'
                    label='Schedule link'
                    value={scheduleLink ?? ''}
                    onChange={(e) =>
                      setSchedule({ ...schedule, scheduleLink: e.target.value })
                    }
                  />
                ) : (
                  <Typography>Schedule</Typography>
                ))}
              {type === ScheduleType.Other && (
                <OtherTextComponent
                  isEditing={showEdit}
                  text={otherText}
                  label='Schedule description'
                  onChange={setOtherText}
                />
              )}
            </div>
            {enablePreview && (
              <Tooltip
                title='Preview'
                placement='top'
                slotProps={{
                  tooltip: {
                    style: { marginBottom: 2 },
                  },
                }}
              >
                <IconButton
                  style={{ padding: 8, margin: -8 }}
                  onClick={() => setPreviewSchedule(!isPreviewSchedule)}
                >
                  {isPreviewSchedule ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </Tooltip>
            )}
          </>
        }
        {...restIconTextProps}
      />
      {showEdit && usesRuntime && (
        <IconButton
          id='add-runtime-button'
          onClick={() => {
            // Start the new runtime at midnight today
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            runtimes.push({ start, between: { days: 7 } });
            internalSetSchedule();
          }}
          style={{ borderRadius: 10, padding: 4 }}
        >
          <Add style={{ fontSize: 24 }} />{' '}
          <Typography style={{ paddingLeft: 8, paddingRight: 4 }}>
            Add runtime
          </Typography>
        </IconButton>
      )}
    </>
  );
};
