import { useState } from 'react';
import { Repo } from './repo/Repo';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { AuthContext, UserData } from './context/AuthProvider';
import { LoginComponent } from './components/LoginComponent';
import { QueryClientProvider, QueryClient } from 'react-query';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import './App.css';
import { Box, createTheme, ThemeProvider } from '@mui/material';

export const USER_DATA_COOKIE = 'user';
const queryClient = new QueryClient();

library.add(faDiscord);

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
              }}
            >
              <Box className='nav'>
                <header>VR Roleplay Repo</header>
                {/* <DarkModeToggle /> */}
                <LoginComponent />
              </Box>
              <BrowserRouter>
                <Routes>
                  <Route path='/repo' element={<Repo />} />
                  <Route path='/auth/*' element={<div>you did it!</div>} />
                  <Route
                    path='*'
                    element={<Navigate to='/repo' replace={true} />}
                  />
                </Routes>
              </BrowserRouter>
            </Box>
          </CookiesProvider>
        </AuthContext.Provider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
