import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthProvider';
import { RoleplayProjectProps, RoleplayStatus } from '../model/RoleplayProject';
import './RoleplayProject.css';

export const RoleplayProject = (props: RoleplayProjectProps) => {
  const { userData } = useAuth();
  const isOwner = props.owners.includes(userData?.username || '');

  return (
    <Card variant='outlined' className='project-card'>
      <CardActionArea>
        <CardContent>
          <Box className='project-header'>
            <Box className='project-image'>
              <CardMedia
                component='img'
                image={props.imageUrl}
                alt={`${props.name} icon`}
              />
            </Box>
            <Box className='project-overview'>
              <Box
                style={{
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant='h3'
                  style={{
                    paddingRight: '12px',
                    display: 'inline-block',
                    fontSize: '1.5em',
                    fontWeight: 'bolder',
                  }}
                >
                  {props.name}
                  {isOwner && ' (OWNED)'}
                </Typography>
                <Box className='tag'>{RoleplayStatus[props.status]}</Box>
              </Box>
              <Typography
                style={{
                  fontStyle: 'italic',
                  paddingTop: 0,
                }}
                color='textSecondary'
                variant='body2'
              >
                {props.owners.join(', ')}
              </Typography>
              <Box>
                {props.tags.map((t) => (
                  <Box key={t} className='tag'>
                    {t}
                  </Box>
                ))}
              </Box>
              <p>{props.description}</p>
              <Box>
                {props.runtime.map((d) => (
                  <p key={d.toISOString()}>
                    {
                      [
                        'Sunday',
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                        'Saturday',
                      ][d.getDay()]
                    }
                    s at {d.toLocaleTimeString()}
                  </p>
                ))}
              </Box>
              <a href={props.discordUrl}>Discord</a>
              {process.env.NODE_ENV === 'development' && (
                <p>LAST UPDATED: {props.lastUpdated.toISOString()}</p>
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
