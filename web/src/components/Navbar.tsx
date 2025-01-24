import { Box, useTheme } from '@mui/material';
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
      <Box className='main-menu'>
        <Link id='myriad-title' to='/' className='no-underline'>
          VR Roleplay Myriad
        </Link>
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
                    ? '#be983e'
                    : theme.palette.text.secondary,
                }}
              >
                <h1>{t}</h1>
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
