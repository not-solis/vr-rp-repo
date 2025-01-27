import { Shield } from '@mui/icons-material';
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useTimeAgo } from 'react-time-ago';

import { getLocale } from '../App';
import { Update } from '../model/Update';
import { UserRole } from '../model/User';
import './UpdateComponent.css';

interface UpdateComponentProps {
  update: Update;
  showProject?: boolean;
}

export const UpdateComponent = (props: UpdateComponentProps) => {
  const { update, showProject = false } = props;
  const { project, user, text, created } = update;
  const { formattedDate } = useTimeAgo({
    date: created,
    locale: getLocale(),
  });

  return (
    <Card variant='outlined' className='update-card'>
      <CardContent style={{ padding: 12 }}>
        <Stack gap={1}>
          <Stack
            direction='row'
            alignItems='center'
            gap={0.5}
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
                style={{ marginLeft: 'auto' }}
              >
                {formattedDate}
              </Typography>
            </Tooltip>
          </Stack>
          {showProject && project && (
            <Link to={`/repo/${project.id}`}>{project.name}</Link>
          )}
          <Typography className='update-text'>{text}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};
