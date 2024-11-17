import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import Repo from './repo/Repo';
import { DarkModeToggle } from './components/DarkModeToggle';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import OAuth2Login from 'react-simple-oauth2-login';
import { CookiesProvider, useCookies } from 'react-cookie';
import { decodeToken } from 'react-jwt';
import './App.css';

interface UserData {
  id: string;
  username: string;
  globalName: string;
  avatar: string;
}

const USER_DATA_COOKIE = 'user';

function App() {
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [cookies, setCookie] = useCookies(['user']);

  useEffect(() => {
    if (cookies.user) {
      setUserData(cookies.user);
    }
  });

  const handleLogin = (userData: UserData) => {
    setUserData(userData);
    setCookie(USER_DATA_COOKIE, JSON.stringify(userData));
  };

  const handleLogout = () => {
    setToken('');
    setUserData(null);
    setCookie(USER_DATA_COOKIE, undefined, { expires: new Date() });
  };

  return (
    <CookiesProvider>
      <div style={{ height: '100vh' }}>
        <div className='nav'>
          <header>VR Roleplay Repo </header>
          {/* <DarkModeToggle /> */}
          {userData ? (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ paddingRight: '20px' }}>
                Logged in as: {userData.globalName}
              </div>
              <input type='button' onClick={handleLogout} value='Logout' />
            </div>
          ) : (
            <OAuth2Login
              authorizationUrl='https://discord.com/oauth2/authorize'
              responseType='token'
              clientId={process.env.REACT_APP_DISCORD_CLIENT_ID ?? ''}
              redirectUri='http://localhost:3000/auth/discord'
              scope='identify'
              buttonText='Login with Discord'
              onSuccess={(data) => {
                fetch('https://discord.com/api/users/@me', {
                  headers: { Authorization: `Bearer ${data.access_token}` },
                }).then((response) =>
                  response.json().then((json) => {
                    console.log(json);
                    const { id, username, global_name, avatar } = json;
                    handleLogin({
                      id,
                      username,
                      globalName: global_name,
                      avatar,
                    });
                  })
                );
              }}
              onFailure={(err) => {
                console.log(err);
              }}
            />
          )}
        </div>
        <BrowserRouter>
          <Routes>
            <Route path='/repo' element={<Repo />} />
            <Route path='/auth/*' element={<div>you did it!</div>} />
            <Route path='*' element={<Navigate to='/repo' replace={true} />} />
          </Routes>
        </BrowserRouter>
      </div>
    </CookiesProvider>

    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

export default App;
