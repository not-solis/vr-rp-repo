import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from '@mui/material';
import { useAuth } from '../context/AuthProvider';
import { RoleplayProjectProps, RoleplayStatus } from '../model/RoleplayProject';
import './RoleplayProject.css';

export const RoleplayProject = (props: RoleplayProjectProps) => {
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
          <Box className='project-header'>
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
              <Box
                style={{
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  maxWidth: '100%',
                }}
              >
                <Typography
                  variant='h3'
                  style={{
                    paddingRight: '12px',
                    fontSize: '1.5em',
                    fontWeight: 'bolder',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: '1 0',
                  }}
                >
                  {name}
                  {isOwner && ' (OWNED)'}
                </Typography>
                <Box
                  className='tag'
                  style={{
                    backgroundColor: statusColors[status],
                  }}
                >
                  {status}
                </Box>
              </Box>
              <Typography
                style={{
                  fontStyle: 'italic',
                  paddingTop: 0,
                }}
                color='textSecondary'
                variant='body2'
              >
                {owners?.join(', ') || ''}
              </Typography>
              <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tags?.map((t) => (
                  <Box key={t} className='tag'>
                    {t}
                  </Box>
                ))}
              </Box>
              <p>{description}</p>
              <Box>
                {runtime?.map((d) => (
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
              <a href={discordUrl}>Discord</a>
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
