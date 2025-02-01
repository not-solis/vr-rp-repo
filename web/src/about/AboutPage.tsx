import './AboutPage.css';
import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import { queryServer } from '../model/ServerResponse';
import { User } from '../model/User';

export const AboutPage = () => {
  const { data: admins, isLoading: isLoading } = useQuery({
    queryKey: ['users', 'admin'],
    queryFn: () => queryServer<User[]>('/users/admin'),
  });

  return (
    <div id='about-page' className='scrollable-y hidden-scrollbar'>
      <Stack gap={4}>
        <Stack id='about-repo' gap={2}>
          <Typography variant='h2'>The Repo</Typography>
          <Typography>
            One day, someone new to VR roleplay asked us where to start. In the
            younger days of VRChat, this was a solved problem - we had clear
            entries to the hobby, and everyone knew where to go for what they
            want. But as the community continues to expand, that's no longer the
            case, and Discord is no longer enough to connect all these moving
            pieces together in a way that connect people to projects they might
            be interested in.
          </Typography>
          <Typography>
            That is where the Repo comes in. The Repo is a unifying platform for
            people to learn enough about roleplays to get involved, whether from
            within or outside of the hobby. We made it to support all the
            roleplays that exist in VR and give their showrunners the platform
            to share their work without the maintenance overhead of something
            like the VRChat Legends wiki.
          </Typography>
        </Stack>

        <Stack id='about-myriad' gap={2}>
          <Typography variant='h2' marginLeft='auto'>
            The Myriad
          </Typography>
          <Typography>
            The Myriad is the origin space of the Repo. We are a forum for
            roleplay theory and discussion, where healthy and productive
            critique is valued as an essential value of engaging with VR
            roleplay as an art form. Above all, we love VR roleplay, and want to
            make it easier for people to share that love for the hobby with each
            other.
          </Typography>
          <Typography>
            That is where the Repo comes in. The Repo is a unifying platform for
            people to learn enough about roleplays to get involved, whether from
            within or outside of the hobby. We made it to support all the
            roleplays that exist in VR and give their showrunners the platform
            to share their work without the maintenance overhead of something
            like the VRChat Legends wiki.
          </Typography>
        </Stack>
        <Stack gap={2}>
          <Typography variant='h2'>Admins</Typography>
          <Stack id='admins' direction='row'>
            {admins?.map((admin) => (
              <div className='admin-tag'>
                <img src={admin.imageUrl} />
                <div className='admin-info'>
                  <Typography variant='h4'>{admin.name}</Typography>
                  <Typography variant='subtitle1'>{admin.email}</Typography>
                </div>
              </div>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};
