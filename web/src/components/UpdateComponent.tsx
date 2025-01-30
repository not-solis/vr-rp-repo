import { Shield } from '@mui/icons-material';
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { RefObject, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTimeAgo } from 'react-time-ago';

import { getLocale } from '../App';
import { Update } from '../model/Update';
import { UserRole } from '../model/User';
import './UpdateComponent.css';

interface UpdateComponentProps {
  update: Update;
  showProject?: boolean;
  fullWidth?: boolean;
}

const useTruncatedElement = (ref: RefObject<HTMLDivElement>) => {
  const [isTruncated, setTruncated] = useState(false);
  const [isReadingMore, setReadingMore] = useState(false);

  useLayoutEffect(() => {
    const { offsetHeight, scrollHeight } = ref.current ?? {};

    setTruncated(
      !!offsetHeight && !!scrollHeight && offsetHeight < scrollHeight,
    );
  }, [ref]);

  return {
    maxHeight: ref.current?.scrollHeight,
    isTruncated,
    isReadingMore,
    setReadingMore,
  };
};

export const UpdateComponent = (props: UpdateComponentProps) => {
  const updateTextRef = useRef<HTMLDivElement>(null);
  const { maxHeight, isTruncated, isReadingMore, setReadingMore } =
    useTruncatedElement(updateTextRef);
  const { update, showProject = false, fullWidth = false } = props;
  const { project, user, text, created } = update;
  const { formattedDate } = useTimeAgo({
    date: created,
    locale: getLocale(),
  });

  return (
    <Card
      variant='outlined'
      className='update-card'
      style={{ width: fullWidth ? '100%' : 'contents' }}
    >
      <CardContent style={{ padding: 12 }}>
        <Stack gap={1}>
          <Stack
            direction='row'
            alignItems='center'
            flexWrap='wrap'
            columnGap={0.5}
            rowGap={1}
            className='update-card-header'
          >
            <Avatar
              alt={user.name}
              src={user.imageUrl}
              style={{ width: 32, height: 32, marginRight: 8 }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Typography>{user.name}</Typography>
            {user.role === UserRole.Admin && (
              <Tooltip
                title='Admin'
                placement='top'
                enterDelay={400}
                leaveDelay={100}
                slotProps={{
                  popper: {
                    modifiers: [
                      { name: 'offset', options: { offset: [0, -12] } },
                    ],
                  },
                }}
              >
                <Shield color='success' />
              </Tooltip>
            )}
            {showProject && project && (
              <Link
                to={`/repo/${project.id}`}
                className='update-project-link colorless no-underline'
                style={{ marginLeft: 16 }}
              >
                <Stack
                  direction='row'
                  alignItems='center'
                  borderRadius={1.2}
                  boxShadow='var(--mui-shadows-3)'
                  height={32}
                >
                  {project.imageUrl && (
                    <img alt={`${project.name} icon`} src={project.imageUrl} />
                  )}

                  <Typography variant='body2' padding='12px'>
                    {project.name}
                  </Typography>
                </Stack>
              </Link>
            )}
            <Tooltip
              title={created.toLocaleString()}
              placement='top'
              enterDelay={700}
              leaveDelay={100}
              slotProps={{
                popper: {
                  modifiers: [
                    { name: 'offset', options: { offset: [0, -12] } },
                  ],
                },
              }}
            >
              <Typography
                variant='subtitle1'
                className='disabled-text-interaction'
                style={{ marginLeft: 'auto', marginRight: 8 }}
              >
                {formattedDate}
              </Typography>
            </Tooltip>
          </Stack>
          <Typography
            ref={updateTextRef}
            maxHeight={isReadingMore ? maxHeight : 288}
            className='update-text'
          >
            {text}
          </Typography>
          {isTruncated && (
            <Typography
              className='read-more-text disabled-text-interaction ${}'
              variant='body2'
              onClick={() => setReadingMore(!isReadingMore)}
            >
              Read {isReadingMore ? 'less' : 'more'}...
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
