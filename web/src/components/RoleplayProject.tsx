import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
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
import './RoleplayProject.css';
import { useEffect, useRef, useState } from 'react';

export const RoleplayProject = (props: RoleplayProjectProps) => {
  const [isTitleOverflowed, setTitleOverflowed] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const theme = useTheme();
  const { userData } = useAuth();
  const {
    name,
    lastUpdated,
    owners,
    imageUrl,
    status,
    tags,
    description,
    runtime,
    discordUrl,
  } = props;

  useEffect(() => {
    setTitleOverflowed(
      titleRef.current
        ? titleRef.current.scrollWidth > titleRef.current.clientWidth
        : false
    );
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
      <CardActionArea style={{ height: '100%' }}>
        <CardContent style={{ height: '100%' }}>
          <Box className='project-card-content'>
            <Box className='project-image'>
              {imageUrl && (
                <CardMedia
                  component='img'
                  image={imageUrl}
                  alt={`${name} icon`}
                />
              )}
            </Box>
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
                <Box
                  className='tag'
                  style={{
                    backgroundColor: statusColors[status],
                  }}
                >
                  {status}
                </Box>
              </Box>

              {owners && owners.length > 0 && (
                <Typography
                  style={{
                    fontStyle: 'italic',
                    paddingTop: 0,
                  }}
                  color='textSecondary'
                  variant='body2'
                >
                  {owners.join(', ')}
                </Typography>
              )}

              {tags && tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tags.map((t) => (
                    <Box key={t} className='tag'>
                      {t}
                    </Box>
                  ))}
                </Box>
              )}

              {description && (
                <Typography variant='body2' style={{ padding: 0 }}>
                  {description}
                </Typography>
              )}

              {/* TODO: make compact date time display */}

              {/* TODO: redesign discord link */}
              {discordUrl && <a href={discordUrl}>Discord</a>}
              {process.env.NODE_ENV === 'development' && (
                <p>LAST UPDATED: {lastUpdated?.toISOString()}</p>
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
