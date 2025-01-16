import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowDropDown, Close, Edit, Logout, Save } from '@mui/icons-material';
import {
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import OAuth2Login from 'react-simple-oauth2-login';

import { USER_DATA_COOKIE } from '../App';
import { useAuth, UserData } from '../context/AuthProvider';
import './UserComponent.css';

export const UserComponent = () => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const [isEditingName, setEditingName] = useState(false);
  const isMenuOpen = !!menuAnchorEl;
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
    closeMenu();
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
      }),
    );
  };

  const onAuthFailure = (err: Error) => console.error(err);

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setMenuAnchorEl(undefined);
  };

  return userData?.id ? (
    <>
      <div
        id='user-button'
        aria-controls={isMenuOpen ? 'user-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={isMenuOpen ? 'true' : undefined}
        onClick={openMenu}
      >
        <Avatar style={{ width: 32, height: 32, marginRight: 8 }} />
        <Typography
          className='disabled-text-interaction'
          variant='body1'
          style={{ paddingRight: 16 }}
        >
          {userData.username}
        </Typography>
        <ArrowDropDown
          className={`toggle-arrow toggle-${isMenuOpen ? 'open' : 'closed'}`}
        />
      </div>
      <Menu
        id='user-menu'
        disableAutoFocusItem
        disableScrollLock={true}
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={() => setMenuAnchorEl(undefined)}
        MenuListProps={{
          'aria-labelledby': 'user-button',
        }}
      >
        <li style={{ padding: '6px 12px' }}>
          <TextField
            disabled={!isEditingName}
            variant='outlined'
            size='small'
            value={userData.username}
            style={{ width: 160, marginRight: 6 }}
            slotProps={{
              input: {
                endAdornment: isEditingName && (
                  <IconButton
                    size='small'
                    style={{ marginRight: -8 }}
                    onClick={() => setEditingName(false)}
                  >
                    <Close fontSize='small' />
                  </IconButton>
                ),
              },
            }}
          />
          {isEditingName ? (
            <>
              <IconButton onClick={() => setEditingName(false)}>
                <Save />
              </IconButton>
            </>
          ) : (
            <IconButton onClick={() => setEditingName(true)}>
              <Edit />
            </IconButton>
          )}
        </li>
        <MenuItem onClick={handleLogout}>
          <Logout style={{ marginRight: 6 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
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
