import { library } from '@fortawesome/fontawesome-svg-core';
import { faDiscord, faMeta } from '@fortawesome/free-brands-svg-icons';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import {
  faAnglesLeft,
  faAnglesRight,
  faDoorOpen,
  faEarthAmericas,
  faGlobe,
  faHandshake,
  faLink,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { Box, createTheme, ThemeProvider } from '@mui/material';
import {
  QueryClientProvider,
  QueryClient,
  useQuery,
} from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Helmet } from 'react-helmet';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { AuthContext } from './context/AuthProvider';
import { User } from './model/User';
import { Repo } from './repo/Repo';
import { RoleplayProjectPage } from './repo/RoleplayProjectPage';
import './App.css';

const queryClient = new QueryClient();

library.add(faDiscord);
library.add(faEarthAmericas);
library.add(faDoorOpen);
library.add(faClipboard);
library.add(faGlobe);
library.add(faUser);
library.add(faMeta);
library.add(faHandshake);
library.add(faLink);
library.add(faAnglesRight);
library.add(faAnglesLeft);

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
    text: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    title?: React.CSSProperties;
    text?: React.CSSProperties;
  }

  interface TypeBackground {
    dark: string;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    title: true;
    text: true;
  }
}

export function App() {
  const theme = createTheme({
    cssVariables: true,
    palette: {
      mode: 'dark',
      background: {
        default: '#1f2023',
        dark: '#191a1d',
        paper: '#2e3034',
      },
      text: {
        primary: '#efefef',
        secondary: '#adadad',
      },
      divider: '#44454a',
    },
    components: {
      MuiMenu: {
        styleOverrides: {
          root: {
            display: 'contents',
          },
          paper: {
            backgroundImage: 'var(--mui-overlays-1)',
            backgroundColor: 'var(--mui-palette-background-default)',
            zIndex: 4000,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            transition: '0.15s ease-out',
            '&:hover': {
              borderColor: '#707176',
              boxShadow: 'inset 0 0 40px 26px rgba(255, 255, 255, 0.02)',
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
        fontSize: '4rem',
        fontWeight: 'bold',
      },
      subtitle1: {
        fontSize: '1rem',
        fontStyle: 'italic',
        color: 'var(--mui-palette-text-secondary)',
      },
      h1: {
        fontSize: '2.8rem',
        fontWeight: 'bold',
      },
      h2: {
        fontSize: '2.4rem',
        fontWeight: 'bold',
      },
      h3: {
        fontSize: '2.2rem',
      },
      h4: {
        fontSize: '1.8rem',
      },
      h5: {
        fontSize: '1.6rem',
      },
      text: {
        fontSize: '1.25rem',
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

  const AuthWrapper = (props: PropsWithChildren) => {
    const { data: user, isLoading: isAuthLoading } = useQuery({
      queryKey: ['auth'],
      queryFn: () => {
        return fetch(`http://localhost:3001/auth/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((res) => res.json())
          .then((json) => {
            const { user } = json;
            return {
              id: user.id,
              name: user.name,
              imageUrl: user.image_url,
              role: user.role,
            } as User;
          });
      },
      retry: false,
    });

    const isAuthenticated = !!user;
    return (
      <AuthContext.Provider value={{ user, isAuthLoading, isAuthenticated }}>
        {props.children}
      </AuthContext.Provider>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthWrapper>
          <CookiesProvider>
            <Helmet>
              <meta property='og:url' content={window.location.href} />
            </Helmet>
            <Box id='app-container'>
              <Navbar />
              <div style={{ flexGrow: 1, minHeight: 0 }}>
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
        </AuthWrapper>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
