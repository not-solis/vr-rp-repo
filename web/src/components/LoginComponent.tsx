import { useEffect } from 'react';
import { useAuth, UserData } from '../context/AuthProvider';
import { useCookies } from 'react-cookie';
import { USER_DATA_COOKIE } from '../App';
import OAuth2Login from 'react-simple-oauth2-login';
import { Box, Button, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const LoginComponent = () => {
  const { userData, setUserData } = useAuth();
  const theme = useTheme();
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
    setUserData({});
    setCookie(USER_DATA_COOKIE, undefined, { expires: new Date() });
  };

  const onAuthSuccess = (data: Record<string, any>) => {
    fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    }).then((response) =>
      response.json().then((json) => {
        const { id, username, global_name, avatar } = json;
        handleLogin({
          id,
          username,
          globalName: global_name,
          avatar,
        });
      })
    );
  };

  const onAuthFailure = (err: Error) => console.error(err);

  return userData?.id ? (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Box style={{ paddingRight: '20px' }}>
        Logged in as: {userData.globalName}
      </Box>
      <Button color='error' variant='contained' onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  ) : (
    <OAuth2Login
      authorizationUrl='https://discord.com/oauth2/authorize'
      responseType='token'
      clientId={process.env.REACT_APP_DISCORD_CLIENT_ID ?? ''}
      redirectUri='http://localhost:3000/auth/discord'
      scope='identify'
      buttonText='Login with Discord'
      onSuccess={onAuthSuccess}
      onFailure={onAuthFailure}
      render={({ className, buttonText, children, onClick }) => (
        <Button
          style={{
            backgroundColor: '#5865F2',
            color: theme.palette.text.primary,
          }}
          variant='contained'
          startIcon={<FontAwesomeIcon icon={['fab', 'discord']} />}
          onClick={onClick}
        >
          Login with Discord
        </Button>
      )}
    />
  );
};
