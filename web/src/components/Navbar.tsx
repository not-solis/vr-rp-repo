import { Stack, Typography, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { UserComponent } from './UserComponent';
import './Navbar.css';

export const Navbar = () => {
  const { pathname } = useLocation();
  const theme = useTheme();

  return (
    <nav className='nav'>
      <Stack
        className='main-menu'
        direction='row'
        alignItems='center'
        flexWrap='wrap'
      >
        <Link id='repo-title' to='/' className='no-underline'>
          <Typography variant='h1' noWrap>
            VR Roleplay Repo
          </Typography>
        </Link>
        <Stack direction='row' alignItems='center' gap={2.4}>
          {['Repo', 'Community', 'About'].map((t) => {
            const hrefPath = `/${t.toLowerCase().replace(' ', '-')}`;
            return (
              <Link
                key={t}
                className={`colorless no-underline${pathname.startsWith(hrefPath) ? ' selected' : ''}`}
                to={hrefPath}
                style={{
                  color: pathname.startsWith(hrefPath)
                    ? '#be983e'
                    : theme.palette.text.secondary,
                }}
              >
                <h2>{t}</h2>
              </Link>
            );
          })}
        </Stack>
      </Stack>
      <UserComponent />
    </nav>
  );
};
