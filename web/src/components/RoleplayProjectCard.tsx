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
import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const RoleplayProject = (props: RoleplayProjectProps) => {
  const [isTitleOverflowed, setTitleOverflowed] = useState(false);
  const [titleRect, setTitleRect] = useState<DOMRect>();
  const titleRef = useRef<HTMLSpanElement>(null);
  const theme = useTheme();
  const { userData } = useAuth();
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
  } = props;

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
      <Link href={`/repo/${id}`} underline='none'>
        <CardActionArea
          style={{
            position: 'relative',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        ></CardActionArea>
        {titleRect && isTitleOverflowed && (
          <Tooltip
            arrow
            title={name}
            placement='top'
            enterDelay={100}
            leaveDelay={100}
            disableHoverListener={!isTitleOverflowed}
            slotProps={{
              popper: {
                modifiers: [{ name: 'offset', options: { offset: [0, -8] } }],
              },
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: titleRect.top,
                left: titleRect.left,
                width: titleRect.right - titleRect.left,
                height: titleRect.bottom - titleRect.top,
                zIndex: 2,
              }}
            />
          </Tooltip>
        )}
      </Link>
      <CardContent
        style={{
          position: 'relative',
          top: '-100%',
        }}
      >
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
              <Typography ref={titleRef} variant='h3'>
                {name}
                {isOwner && ' (OWNED)'}
              </Typography>
              <Box
                className='tag disabled-text-interaction'
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
                  <Box
                    key={t}
                    className='tag disabled-text-interaction interactable'
                  >
                    {t}
                  </Box>
                ))}
              </Box>
            )}

            {shortDescription && (
              <Typography variant='body2' style={{ padding: 0 }}>
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
    </Card>
  );
};
