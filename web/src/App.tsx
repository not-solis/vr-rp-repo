import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faDiscord,
  faMeta,
  faTwitch,
} from '@fortawesome/free-brands-svg-icons';
import {
  faCalendar,
  faClipboard,
  faClock,
} from '@fortawesome/free-regular-svg-icons';
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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import 'javascript-time-ago/load-all-locales';
import { useEffect, useState } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AboutPage } from './about/AboutPage';
import { Navbar } from './components/Navbar';
import { AuthContext } from './context/AuthProvider';
import { SnackbarContext, SnackbarProps } from './context/SnackbarProvider';
import { HomePage } from './home/HomePage';
import { queryServer, ResponseData } from './model/ServerResponse';
import { User, UserRole } from './model/User';
import { Repo } from './repo/Repo';
import { RoleplayProjectPage } from './repo/RoleplayProjectPage';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './App.css';

// FontAwesome icons
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
library.add(faCalendar);
library.add(faTwitch);

// react-time-ago default locale
TimeAgo.addDefaultLocale(en);

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
    light: string;
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

export const APP_TITLE = 'VR Roleplay Repo';
export const APP_KEYWORDS = [
  'roleplay',
  'rp',
  'larp',
  'vr',
  'virtual',
  'virtual reality',
  'vrrp',
  'vrlarp',
  'vrroleplay',
  'repo',
  'repository',
  'myriad',
];

export function App() {
  const [snackbarProps, setSnackbarProps] = useState<SnackbarProps>();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const createSnackbar = (props: SnackbarProps) => {
    setSnackbarProps(props);
    setSnackbarOpen(true);
  };
  const createErrorSnackbar = (err: any) => {
    const props: SnackbarProps = err.name
      ? {
          title: err.name,
          severity: 'error',
          content: err.message,
          autoHideDuration: 6000,
        }
      : {
          title: 'Error',
          severity: 'error',
          content: err,
          autoHideDuration: 6000,
        };
    setSnackbarProps(props);
    setSnackbarOpen(true);
  };

  const {
    data: user,
    isLoading: isAuthLoading,
    error,
  } = useQuery({
    queryKey: ['auth'],
    queryFn: () =>
      queryServer<ResponseData<User>>('/auth', {
        useAuth: true,
        returnFullResponse: true,
      }),
    select: (userData) => userData?.data,
    retry: false,
  });

  useEffect(() => {
    if (error) {
      createErrorSnackbar(error);
    }
  }, [error]);

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

  const theme = createTheme({
    cssVariables: true,
    palette: {
      mode: 'dark',
      background: {
        default: '#1f2023',
        light: '#25262a',
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

  const comingSoon = (what: string) => (
    <h1
      style={{
        margin: '25vh auto',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 60,
      }}
    >
      Coming soon: {what}
    </h1>
  );

  return (
    <HelmetProvider>
      <Helmet>
        <title>{APP_TITLE}</title>
        <meta title={APP_TITLE} />
        <meta name='description' content='The front page of VR Roleplay' />
        <meta
          property='og:description'
          content='The front page of VR Roleplay'
        />
        <meta property='og:type' content='website' />
        <meta property='og:title' content={APP_TITLE} />
        <meta property='og:site_name' content={APP_TITLE} />
        <meta property='og:image' content='%PUBLIC_URL%/myriad_logo.jpg' />
        <meta property='og:image:alt' content={`${APP_TITLE} icon`} />
        <meta property='og:url' content={window.location.href} />
        <meta name='keywords' content={APP_KEYWORDS.join(', ')} />
      </Helmet>
      <ThemeProvider theme={theme}>
        <SnackbarContext.Provider
          value={{
            createSnackbar,
            createErrorSnackbar,
          }}
        >
          <AuthContext.Provider
            value={{ user, isAuthLoading, isAuthenticated, hasPermission }}
          >
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <CookiesProvider>
                <BrowserRouter>
                  <Box id='app-container'>
                    <Navbar />
                    <div style={{ flexGrow: 1, minHeight: 0 }}>
                      <Routes>
                        <Route path='/' element={<HomePage />} />
                        <Route path='/repo' element={<Repo />} />
                        <Route
                          path='/repo/new'
                          element={<RoleplayProjectPage isNew />}
                        />
                        <Route
                          path='/repo/:urlName'
                          element={<RoleplayProjectPage />}
                        />
                        <Route
                          path='/community'
                          element={comingSoon('articles and asset resources')}
                        />
                        <Route path='/about' element={<AboutPage />} />
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
            </LocalizationProvider>
          </AuthContext.Provider>
        </SnackbarContext.Provider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
