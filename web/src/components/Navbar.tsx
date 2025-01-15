import { Box, Link, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';

import { LoginComponent } from './LoginComponent';
import './Navbar.css';

export const Navbar = () => {
  const theme = useTheme();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box className='nav'>
      <a
        href='/'
        style={{ color: theme.palette.text.primary, textDecoration: 'none' }}
      >
        <header>VR Roleplay Myriad</header>
      </a>
      <Box className='main-menu'>
        {windowDimensions.width > 1100 ? (
          ['Repo', 'Blog', 'Resources', 'About Us'].map((t) => (
            <Link
              key={t}
              href={`/${t.toLowerCase().replace(' ', '-')}`}
              component='a'
              variant='h6'
              color='textSecondary'
              underline='none'
            >
              {t}
            </Link>
          ))
        ) : (
          <div>---</div> // Replace with burger menu
        )}
      </Box>
      <LoginComponent />
    </Box>
  );
};
