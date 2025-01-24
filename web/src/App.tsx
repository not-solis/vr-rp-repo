import { library } from '@fortawesome/fontawesome-svg-core';
import { faDiscord, faMeta } from '@fortawesome/free-brands-svg-icons';
import { faClipboard, faClock } from '@fortawesome/free-regular-svg-icons';
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
import {
  Alert,
  AlertTitle,
  Box,
  createTheme,
  PaletteColorOptions,
  Snackbar,
  Stack,
  ThemeProvider,
} from '@mui/material';
import {
  QueryClientProvider,
  QueryClient,
  useQuery,
} from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { AuthContext } from './context/AuthProvider';
import { EnvContext } from './context/EnvProvider';
import { SnackbarContext, SnackbarProps } from './context/SnackbarProvider';
import { User, UserRole } from './model/User';
import { Repo } from './repo/Repo';
import { RoleplayProjectPage } from './repo/RoleplayProjectPage';
import './App.css';

const {
  REACT_APP_SERVER_BASE_URL,
  REACT_APP_DISCORD_REDIRECT_PATH,
  REACT_APP_DISCORD_CLIENT_ID,
} = process.env;

if (!REACT_APP_SERVER_BASE_URL) {
  throw new Error('Server URL not configured.');
} else if (!REACT_APP_DISCORD_REDIRECT_PATH) {
  throw new Error('Discord redirect URL not configured.');
} else if (!REACT_APP_DISCORD_CLIENT_ID) {
  throw new Error('Discord client ID not configured.');
}

const env = {
  serverBaseUrl: REACT_APP_SERVER_BASE_URL,
  discordRedirectPath: REACT_APP_DISCORD_REDIRECT_PATH,
  discordClientId: REACT_APP_DISCORD_CLIENT_ID,
};

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
library.add(faClock);

declare module '@mui/material/styles' {
  interface Palette {
    plain: PaletteColorOptions;
  }
  interface PaletteOptions {
    plain?: PaletteColorOptions;
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

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    plain: true;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    title: true;
    text: true;
  }
}

const AuthWrapper = (props: PropsWithChildren) => {
  const { data: user, isLoading: isAuthLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: () => {
      return fetch(`${env.serverBaseUrl}/auth`, {
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
  const hasPermission = (role: UserRole = UserRole.User) => {
    if (!user?.role) {
      return false;
    }

    const order = [UserRole.Admin, UserRole.User, UserRole.Banned];
    const userOrder = order.indexOf(user.role);
    const roleOrder = order.indexOf(role);
    return userOrder <= roleOrder;
  };
  return (
    <AuthContext.Provider
      value={{ user, isAuthLoading, isAuthenticated, hasPermission }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export function App() {
  const [snackbarProps, setSnackbarProps] = useState<SnackbarProps>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
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
      plain: {
        main: '#e0e0e0',
        contrastText: 'black',
      },
      divider: '#44454a',
    },
    components: {
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            backgroundColor: 'var(--mui-palette-background-dark)',
            boxShadow: 'var(--mui-shadows-5)',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            paddingTop: '16px !important',
            paddingBottom: 4,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'var(--mui-overlays-1)',
            backgroundColor: 'var(--mui-palette-background-default)',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
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
            transition: '0.1s ease-out',
            '&:hover': {
              borderColor: '#707176',
              boxShadow:
                'inset 0 0 40px 26px rgba(255, 255, 255, 0.02), var(--mui-shadows-6)',
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
      fontFamily: 'Sora, serif',
      title: {
        fontSize: '3.2rem',
        fontWeight: 'bold',
      },
      subtitle1: {
        fontSize: '0.95rem',
        fontStyle: 'italic',
        lineHeight: '20px',
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
        fontSize: '2rem',
      },
      h4: {
        fontSize: '1.6rem',
      },
      h5: {
        fontSize: '1.4rem',
      },
      text: {
        fontSize: '1.25rem',
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.9rem',
      },
    },
  });

  const onSnackbarClose = () => {
    if (snackbarProps?.onClose) {
      snackbarProps?.onClose();
    }
    setSnackbarOpen(false);
  };

  const comingSoon = (
    <h1
      style={{
        margin: '25vh auto',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 84,
      }}
    >
      Coming soon!
    </h1>
  );

  return (
    <HelmetProvider>
      <EnvContext.Provider value={env}>
        <ThemeProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <SnackbarContext.Provider
              value={{
                createSnackbar: (props) => {
                  setSnackbarProps(props);
                  setSnackbarOpen(true);
                },
              }}
            >
              <AuthWrapper>
                <CookiesProvider>
                  <Helmet>
                    <meta property='og:url' content={window.location.href} />
                  </Helmet>
                  <BrowserRouter>
                    <Box id='app-container'>
                      <Navbar />
                      <div style={{ flexGrow: 1, minHeight: 0 }}>
                        <Routes>
                          <Route path='/' element={comingSoon} />
                          <Route path='/repo' element={<Repo />} />
                          <Route
                            path='/repo/new'
                            element={<RoleplayProjectPage isNew />}
                          />
                          <Route
                            path='/repo/:id'
                            element={<RoleplayProjectPage />}
                          />
                          <Route path='/community' element={comingSoon} />
                          <Route path='/resources' element={comingSoon} />
                          <Route path='/about-us' element={comingSoon} />
                          <Route
                            path='*'
                            element={<Navigate to='/' replace={true} />}
                          />
                        </Routes>
                      </div>
                    </Box>
                    <Snackbar
                      open={snackbarOpen}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      autoHideDuration={snackbarProps?.autoHideDuration ?? 3000}
                      onClose={onSnackbarClose}
                      disableWindowBlurListener
                      ClickAwayListenerProps={{ onClickAway: () => null }}
                    >
                      <Alert
                        severity={snackbarProps?.severity}
                        variant='standard'
                        onClose={onSnackbarClose}
                        style={{ width: '100%' }}
                      >
                        <AlertTitle>{snackbarProps?.title}</AlertTitle>
                        {typeof snackbarProps?.content === 'string' ? (
                          snackbarProps?.content
                        ) : (
                          <Stack spacing={1}>
                            {snackbarProps?.content.map((c, i) => (
                              <div key={i}>- {c}</div>
                            ))}
                          </Stack>
                        )}
                      </Alert>
                    </Snackbar>
                  </BrowserRouter>
                </CookiesProvider>
              </AuthWrapper>
            </SnackbarContext.Provider>
          </QueryClientProvider>
        </ThemeProvider>
      </EnvContext.Provider>
    </HelmetProvider>
  );
}
