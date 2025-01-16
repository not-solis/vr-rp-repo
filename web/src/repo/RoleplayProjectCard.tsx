import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Link,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { IconText } from '../components/IconText';
import { TextTag } from '../components/TextTag';
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

  const isOwner = owners?.some((owner) => owner.id === userData?.id) ?? false;

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
                <Typography variant='subtitle1'>
                  {owners.map((owner) => owner.name).join(', ')}
                </Typography>
              )}

              {tags && tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <TextTag
                      key={tag}
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
                <Typography variant='body1'>{shortDescription}</Typography>
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
