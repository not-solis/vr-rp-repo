import { useState } from 'react';
import { Repo } from './repo/Repo';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { AuthContext, UserData } from './context/AuthProvider';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDiscord, faMeta } from '@fortawesome/free-brands-svg-icons';
import './App.css';
import { Box, createTheme, ThemeProvider } from '@mui/material';
import { Navbar } from './components/Navbar';
import { RoleplayProjectPage } from './repo/RoleplayProjectPage';
import {
  faDoorOpen,
  faEarthAmericas,
  faGlobe,
  faHandshake,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';

export const USER_DATA_COOKIE = 'user';
const queryClient = new QueryClient();

library.add(faDiscord);
library.add(faEarthAmericas);
library.add(faDoorOpen);
library.add(faClipboard);
library.add(faGlobe);
library.add(faUser);
library.add(faMeta);
library.add(faHandshake);

declare module '@mui/material/styles' {
  interface Theme {
    roleplayStatus: {
      active: string;
      hiatus: string;
      upcoming: string;
      inactive: string;
    };
  }
  // allow configuration using `createTheme()`
  interface ThemeOptions {
    roleplayStatus?: {
      active?: string;
      hiatus?: string;
      upcoming?: string;
      inactive?: string;
    };
  }

  interface TypographyVariants {
    title: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    title?: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    title: true;
  }
}

export function App() {
  const [userData, setUserData] = useState<UserData>({});
  const theme = createTheme({
    cssVariables: true,
    palette: {
      mode: 'dark',
      background: {
        default: '#1f2023',
        paper: '#2e3034',
      },
      text: {
        primary: '#efefef',
        secondary: '#adadad',
      },
      divider: '#44454a',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            transition: '0.2s',
            '&:hover': {
              transform: 'scale(0.996)',
              borderColor: '#707176',
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: 'var(--mui-palette-background-default)',
            border: `1.4px solid var(--mui-palette-divider)`,
            fontSize: '1em',
          },
          arrow: {
            color: 'var(--mui-palette-background-default)',
            borderTop: 'none',
          },
        },
      },
    },
    typography: {
      title: {
        fontSize: 72,
        fontWeight: 'bold',
      },
      subtitle1: {
        fontSize: '1rem',
        fontStyle: 'italic',
        color: 'var(--mui-palette-text-secondary)',
      },
      h1: {
        fontSize: 56,
        fontWeight: 'bold',
      },
      h2: {
        fontSize: 42,
        fontWeight: 'bold',
      },
      body1: {
        fontSize: '1.1rem',
      },
      body2: {
        fontSize: '0.9rem',
      },
    },
    roleplayStatus: {
      active: '#009200',
      inactive: '#424647',
      upcoming: '#067f8c',
      hiatus: '#9e561b',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ userData, setUserData }}>
          <CookiesProvider>
            <Box
              style={{
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.default,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Navbar />
              <div style={{ flexGrow: 1 }}>
                <BrowserRouter>
                  <Routes>
                    <Route path='/' element={<div>HOME</div>} />
                    <Route path='/repo' element={<Repo />} />
                    <Route path='/repo/:id' element={<RoleplayProjectPage />} />
                    <Route
                      path='/blog'
                      element={<div>Where the blog go</div>}
                    />
                    <Route
                      path='/resources'
                      element={<div>Avatars, worlds, and docs, oh my!</div>}
                    />
                    <Route path='/about-us' element={<div>Memememememe</div>} />
                    <Route path='/auth/*' element={<div>you did it!</div>} />
                    <Route
                      path='*'
                      element={<Navigate to='/' replace={true} />}
                    />
                  </Routes>
                </BrowserRouter>
              </div>
            </Box>
          </CookiesProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
