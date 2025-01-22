import { Box, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { UserComponent } from './UserComponent';
import './Navbar.css';

export const Navbar = () => {
  const { pathname } = useLocation();
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
    <nav className='nav'>
      <Link
        to='/'
        className='no-underline'
        style={{ color: theme.palette.text.primary }}
      >
        <header>VR Roleplay Myriad</header>
      </Link>
      <Box className='main-menu'>
        {windowDimensions.width > 1100 ? (
          ['Repo', 'Community', 'Resources', 'About Us'].map((t) => {
            const hrefPath = `/${t.toLowerCase().replace(' ', '-')}`;
            return (
              <Link
                key={t}
                className={`colorless no-underline${pathname.startsWith(hrefPath) ? ' selected' : ''}`}
                to={hrefPath}
                style={{
                  color: pathname.startsWith(hrefPath)
                    ? '#babc6f'
                    : theme.palette.text.secondary,
                }}
              >
                <Typography variant='h5' fontWeight='bold'>
                  {t}
                </Typography>
              </Link>
            );
          })
        ) : (
          <div>---</div> // Replace with burger menu
        )}
      </Box>
      <UserComponent />
    </nav>
  );
};
