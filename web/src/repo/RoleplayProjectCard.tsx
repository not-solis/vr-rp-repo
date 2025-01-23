import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { IconText } from '../components/IconText';
import { TagChip } from '../components/TagChip';
import { useAuth } from '../context/AuthProvider';
import { RoleplayProject, RoleplayStatus } from '../model/RoleplayProject';
import './RoleplayProjectCard.css';

export const RoleplayProjectCard = (props: {
  project: RoleplayProject;
  addTag: (tag: string) => void;
}) => {
  const [isTitleOverflowed, setTitleOverflowed] = useState(false);
  const [titleRect, setTitleRect] = useState<DOMRect>();
  const titleRef = useRef<HTMLSpanElement>(null);
  const theme = useTheme();
  const { user } = useAuth();
  const { project, addTag } = props;
  const {
    id,
    name,
    lastUpdated,
    owner,
    imageUrl,
    status,
    tags,
    shortDescription,
    runtime,
    discordUrl,
    otherLinks,
  } = project;

  useEffect(() => {
    if (!titleRef.current) {
      setTitleOverflowed(false);
      setTitleRect(undefined);
      return;
    }
    setTitleOverflowed(
      titleRef.current.scrollWidth > titleRef.current.clientWidth,
    );
    setTitleRect(titleRef.current.getBoundingClientRect());
  }, []);

  const statusColors: Record<string, string> = {
    [RoleplayStatus.Active]: theme.roleplayStatus.active,
    [RoleplayStatus.Inactive]: theme.roleplayStatus.inactive,
    [RoleplayStatus.Upcoming]: theme.roleplayStatus.upcoming,
    [RoleplayStatus.Hiatus]: theme.roleplayStatus.hiatus,
  };

  return (
    <Card variant='outlined' className='project-card'>
      <CardContent className='full-height'>
        <Box className='project-card-content full-height'>
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
            <div className='project-image-footer'>
              {discordUrl && (
                <IconText
                  text='Discord'
                  url={discordUrl}
                  iconPrefix='fab'
                  icon='discord'
                  iconPadding={8}
                />
              )}
              {otherLinks &&
                otherLinks.map((link) => (
                  <IconText
                    key={link.url}
                    text={link.label}
                    icon={'link'}
                    url={link.url}
                    iconPadding={8}
                  />
                ))}
            </div>
          </div>

          <Link id='card-link' to={`/repo/${id}`} className='no-underline'>
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
                  <Typography ref={titleRef} variant='h4'>
                    {name}
                  </Typography>
                </Tooltip>
                <TagChip
                  label={status}
                  style={{
                    backgroundColor:
                      statusColors[status ?? RoleplayStatus.Inactive],
                  }}
                />
              </Box>

              {owner && (
                <Typography variant='subtitle1'>{owner.name}</Typography>
              )}

              {runtime && (
                <IconText
                  text={runtime}
                  icon='clock'
                  iconPrefix='far'
                  iconPadding={6}
                  containerStyle={{
                    color: '#d0d0aa',
                  }}
                />
              )}

              {tags && tags.length > 0 && (
                <Box
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                    paddingTop: 2,
                  }}
                >
                  {tags.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      onClick={(e: any) => {
                        e.preventDefault();
                        addTag(tag);
                      }}
                    />
                  ))}
                </Box>
              )}

              {shortDescription && (
                <Typography variant='body1'>{shortDescription}</Typography>
              )}

              {/* TODO: make compact date time display */}

              {/* TODO: redesign discord link */}
              {process.env.NODE_ENV === 'development' && (
                <p>LAST UPDATED: {lastUpdated?.toISOString()}</p>
              )}
            </Box>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};
