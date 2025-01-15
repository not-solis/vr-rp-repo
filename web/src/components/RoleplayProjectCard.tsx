import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Link,
  makeStyles,
  styled,
  Theme,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
  useTheme,
} from '@mui/material';
import { useAuth } from '../context/AuthProvider';
import { RoleplayProjectProps, RoleplayStatus } from '../model/RoleplayProject';
import './RoleplayProjectCard.css';
import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { TextTag } from './TextTag';

export const RoleplayProject = (props: {
  project: RoleplayProjectProps;
  addTag: (tag: string) => void;
}) => {
  const [isTitleOverflowed, setTitleOverflowed] = useState(false);
  const [titleRect, setTitleRect] = useState<DOMRect>();
  const titleRef = useRef<HTMLSpanElement>(null);
  const theme = useTheme();
  const { userData } = useAuth();
  const { project, addTag } = props;
  const {
    id,
    name,
    lastUpdated,
    owners,
    imageUrl,
    status,
    tags,
    shortDescription,
    runtime,
    discordUrl,
  } = project;

  useEffect(() => {
    if (!titleRef.current) {
      setTitleOverflowed(false);
      setTitleRect(undefined);
      return;
    }
    setTitleOverflowed(
      titleRef.current.scrollWidth > titleRef.current.clientWidth
    );
    setTitleRect(titleRef.current.getBoundingClientRect());
  }, []);

  const isOwner = owners?.includes(userData?.username || '') ?? false;

  const statusColors: Record<RoleplayStatus, string> = {
    [RoleplayStatus.Active]: theme.roleplayStatus.active,
    [RoleplayStatus.Inactive]: theme.roleplayStatus.inactive,
    [RoleplayStatus.Upcoming]: theme.roleplayStatus.upcoming,
    [RoleplayStatus.Hiatus]: theme.roleplayStatus.hiatus,
  };

  return (
    <Card variant='outlined' className='project-card'>
      <Link id='card-link' href={`/repo/${id}`} underline='none'>
        <CardContent>
          <Box className='project-card-content'>
            <div>
              <Box className='project-image'>
                {imageUrl && (
                  <CardMedia
                    component='img'
                    image={imageUrl}
                    alt={`${name} icon`}
                  />
                )}
              </Box>
              {discordUrl && (
                <Link
                  style={{ position: 'relative', zIndex: 3 }}
                  href={discordUrl}
                >
                  <FontAwesomeIcon
                    to={discordUrl}
                    style={{
                      width: 20,
                      height: 'auto',
                      padding: '12 6 0',
                    }}
                    icon={['fab', 'discord']}
                  />
                  Discord
                </Link>
              )}
            </div>

            <Box className='project-overview'>
              <Box className='project-header'>
                <Tooltip
                  arrow
                  title={name}
                  placement='top'
                  enterDelay={100}
                  leaveDelay={100}
                  disableHoverListener={!isTitleOverflowed}
                  slotProps={{
                    popper: {
                      modifiers: [
                        { name: 'offset', options: { offset: [0, -8] } },
                      ],
                    },
                  }}
                >
                  <Typography ref={titleRef} variant='h3'>
                    {name}
                    {isOwner && ' (OWNED)'}
                  </Typography>
                </Tooltip>
                <TextTag
                  tag={status}
                  style={{
                    backgroundColor: statusColors[status],
                  }}
                />
              </Box>

              {owners && owners.length > 0 && (
                <Typography variant='subtitle1'>{owners.join(', ')}</Typography>
              )}

              {tags && tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <TextTag
                      tag={tag}
                      interactive
                      onClick={(e: any) => {
                        e.preventDefault();
                        addTag(tag);
                      }}
                    />
                  ))}
                </Box>
              )}

              {shortDescription && (
                <Typography variant='body1' style={{ padding: 0 }}>
                  {shortDescription}
                </Typography>
              )}

              {/* TODO: make compact date time display */}

              {/* TODO: redesign discord link */}
              {process.env.NODE_ENV === 'development' && (
                <p>LAST UPDATED: {lastUpdated?.toISOString()}</p>
              )}
            </Box>
          </Box>
        </CardContent>
      </Link>
    </Card>
  );
};
