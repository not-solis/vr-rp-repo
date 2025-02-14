import './TimelineCard.css';

import { RadioButtonChecked, WarningAmber } from '@mui/icons-material';
import { Avatar, Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { PIXELS_PER_HOUR } from './RepoTimeline';
import { IconText } from '../components/IconText';
import { RoleplayEvent } from '../model/RoleplayEvent';
import { RoleplayStatus } from '../model/RoleplayProject';

const WarningIcon = (props: { text: string }) => (
  <Tooltip
    title={props.text}
    placement='top'
    slotProps={{
      tooltip: {
        style: { marginBottom: 6 },
      },
    }}
  >
    <WarningAmber color='warning' fontSize='small' />
  </Tooltip>
);

interface TimelineCardProps {
  event: RoleplayEvent;
  gridColumnStart: number;
  gridColumnEnd: number;
}
export const TimelineCard = (props: TimelineCardProps) => {
  const { event, gridColumnStart, gridColumnEnd } = props;
  const { startDate, project } = event;
  const {
    id: projectId,
    urlName,
    name,
    status = RoleplayStatus.Inactive,
    imageUrl,
    isMetaverse,
    isQuestCompatible,
    hasSupportingCast,
    discordUrl,
    otherLinks,
  } = project;

  const marginLeft = PIXELS_PER_HOUR * (event.startDate.getMinutes() / 60);
  const marginRight = PIXELS_PER_HOUR * (1 - event.endDate.getMinutes() / 60);
  return (
    <div
      key={projectId + startDate}
      className='event-wrapper'
      style={{
        gridColumnStart,
        gridColumnEnd,
      }}
    >
      <div
        aria-disabled={!event.isConfirmed}
        className={`event ${event.isConfirmed ? '' : 'not-confirmed'} ${event.isDefaultEnd ? 'no-end' : ''}`}
        style={{
          marginLeft,
          marginRight,
          mask: event.isDefaultEnd
            ? `linear-gradient(to left, #0000 5px, #0001 20px, #000f ${2 * PIXELS_PER_HOUR}px)`
            : 'none',
        }}
      >
        <Link to={`/repo/${urlName}`} className='header no-underline colorless'>
          <div className='content sticky'>
            {imageUrl && (
              <Avatar
                alt={name}
                src={imageUrl}
                style={{ width: 32, height: 32 }}
              />
            )}
            <Typography title={name} noWrap>
              {name}
            </Typography>
            <Tooltip
              title={status}
              placement='top'
              slotProps={{
                tooltip: {
                  style: { marginBottom: 4 },
                },
              }}
            >
              <RadioButtonChecked
                className={status.toLowerCase()}
                fontSize='small'
              />
            </Tooltip>
          </div>
        </Link>
        <div className='footer'>
          <div className='content sticky'>
            {!event.isConfirmed && (
              <WarningIcon text='This event might not run every week' />
            )}
            {event.isDefaultEnd && (
              <WarningIcon text='This event has no end time' />
            )}
            {isMetaverse && (
              <IconText
                forceRender
                tooltip='Metaverse'
                icon='globe'
                iconStyle={{ padding: 0 }}
              />
            )}
            {hasSupportingCast && (
              <IconText
                forceRender
                tooltip='Supporting Cast positions available'
                icon='handshake'
                iconStyle={{ padding: 0 }}
              />
            )}
            {isQuestCompatible && (
              <IconText
                forceRender
                tooltip='Quest compatible'
                icon='meta'
                iconPrefix='fab'
                iconStyle={{ padding: 0 }}
              />
            )}
            {discordUrl && (
              <IconText
                forceRender
                tooltip='Discord'
                url={discordUrl}
                icon='discord'
                iconPrefix='fab'
                iconStyle={{ padding: 0 }}
              />
            )}
            {otherLinks?.map((link) => (
              <IconText
                key={link.label + link.url}
                forceRender
                tooltip={link.label}
                url={link.url}
                icon='link'
                iconStyle={{ padding: 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
