import { Box, Link, Typography } from '@mui/material';
import { LoginComponent } from './LoginComponent';

import './Navbar.css';

export const Navbar = () => {
  return (
    <Box className='nav'>
      <header onClick={() => (window.location.href = '/')}>
        VR Roleplay Repo
      </header>
      <Box className='main-menu'>
        {['Repo', 'Blog', 'Resources', 'About Us'].map((t) => (
          <Link
            href={t.toLowerCase().replace(' ', '-')}
            component='a'
            variant='h6'
            color='textSecondary'
            underline='none'
          >
            {t}
          </Link>
        ))}
      </Box>
      <LoginComponent />
    </Box>
  );
};
