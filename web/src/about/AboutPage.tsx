import './AboutPage.css';
import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { APP_KEYWORDS, APP_TITLE } from '../App';
import { queryServer } from '../model/ServerResponse';
import { User } from '../model/User';

const TITLE = 'About';

export const AboutPage = () => {
  const { data: admins, isLoading: isLoading } = useQuery({
    queryKey: ['users', 'admin'],
    queryFn: () => queryServer<User[]>('/users/admin'),
  });

  return (
    <div id='about-page' className='scrollable-y hidden-scrollbar'>
      <Helmet>
        <title>{`${TITLE} | ${APP_TITLE}`}</title>
        <meta title={`${TITLE} | ${APP_TITLE}`} />
        <meta property='og:title' content={TITLE} />
        <meta
          name='keywords'
          content={APP_KEYWORDS.concat(['about']).join(', ')}
        />
        <meta
          property='og:description'
          content='Read more about the VR Roleplay Repo.'
        />
      </Helmet>
      <Stack gap={5}>
        <Stack id='about-repo' gap={2}>
          <Typography variant='h2'>The Repo</Typography>
          {/* <Typography>
            In the younger days of VRChat, there were clear hubs for VR roleplay
            that new and veteran roleplayers could use for learning more about
            the space. But as the community continues to expand, word of mouth
            is no longer enough to connect people to the roleplays they might be
            interested in.
          </Typography> */}
          {/* <Typography>
            First, we created a list of every single VR roleplay, put them in a
            spreadsheet, and shared that spreadsheet with everyone. Along the
            way, we realized the scale of the mission - there are far too many
            roleplays for two people to keep track of, and passing around a
            spreadsheet doesn't help people share or discover projects. We
            wanted a platform that helps people discover and learn everything
            they need to get involved at a glance.
          </Typography> */}
          {/* <Typography>
            It all started with the Repo spreadsheet - a list of all the
            roleplays we knew about. Passing a spreadsheet around didn't meet
            our goals for visibility, so we pushed further. We wanted a
            crowdsourced platform, where people can learn everything they need
            to get involved in any project, and showrunners can own the way they
            share their project to the world.
          </Typography> */}
          <Typography>
            The Repo is the unifying platform for newcomers and veterans of the
            VR Roleplay community to share and discover roleplay experiences.
          </Typography>
        </Stack>

        <Stack id='about-myriad' gap={2}>
          <Typography variant='h2'>The Myriad</Typography>
          <Typography>
            The Myriad is a forum for roleplay theory and discussion, and the
            origin space of the Repo. We value healthy and productive critique
            as an essential part of engaging with VR roleplay as an art form.
            Above all, we love VR roleplay, and want to make it easier for
            people to share their love for the hobby with each other.
          </Typography>
          <Typography>
            To learn more, join the{' '}
            <Link to='https://discord.gg/27gpREAa2Q'>Discord</Link>.
          </Typography>
        </Stack>
        <Stack gap={2}>
          <Typography variant='h2'>Admins</Typography>
          <Stack id='admins' direction='row'>
            {admins?.map((admin) => (
              <div key={admin.name} className='admin-tag'>
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
