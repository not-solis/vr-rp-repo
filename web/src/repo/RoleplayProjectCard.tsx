import './RoleplayProjectCard.css';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DetailedHTMLProps,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { IconText } from '../components/IconText';
import { ScheduleDisplay } from '../components/ScheduleDisplay';
import { TagChip } from '../components/TagChip';
import { RoleplayProject } from '../model/RoleplayProject';

export const RoleplayProjectCard = (
  props: {
    project: RoleplayProject;
    addTag?: (tag: string) => void;
  } & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) => {
  const [isTitleOverflowed, setTitleOverflowed] = useState(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const { project, addTag, ...restProps } = props;
  const {
    name,
    urlName,
    owner,
    imageUrl,
    status,
    tags,
    shortDescription,
    schedule,
    discordUrl,
    otherLinks,
  } = project;

  return (
    <Card variant='outlined' className='project-card' {...restProps} ref={null}>
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
                    key={link.label + link.url}
                    text={link.label}
                    icon={'link'}
                    url={link.url}
                    iconPadding={8}
                  />
                ))}
            </div>
          </div>

          <Link id='card-link' to={`/repo/${urlName}`} className='no-underline'>
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
                {schedule?.region && (
                  <TagChip className='region-tag' label={schedule.region} />
                )}

                <TagChip
                  label={status || 'Unknown'}
                  className={status?.toLowerCase() || 'inactive'}
                />
              </Box>

              {owner && (
                <Typography variant='subtitle1'>{owner.name}</Typography>
              )}

              {schedule && (
                <ScheduleDisplay
                  schedule={schedule}
                  icon='clock'
                  iconPrefix='far'
                  iconPadding={6}
                />
              )}

              {tags && tags.length > 0 && (
                <Box
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                    padding: '2px 0',
                  }}
                >
                  {tags.map((tag) => (
                    <TagChip
                      key={tag}
                      label={tag}
                      onClick={(e: any) => {
                        e.preventDefault();
                        if (addTag) {
                          addTag(tag);
                        }
                      }}
                    />
                  ))}
                </Box>
              )}

              {shortDescription && (
                <Typography
                  className='project-card-description scrollable-y hidden-scrollbar'
                  variant='body1'
                >
                  {shortDescription}
                </Typography>
              )}
            </Box>
          </Link>
        </Box>
      </CardContent>
    </Card>
  );
};
