import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowDropDown, Close, Edit, Logout, Save } from '@mui/icons-material';
import {
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OAuth2Login from 'react-simple-oauth2-login';

import { useAuth } from '../context/AuthProvider';
import { useEnv } from '../context/EnvProvider';
import './UserComponent.css';

export const UserComponent = () => {
  const { serverBaseUrl, discordClientId, discordRedirectPath } = useEnv();
  const { user, isAuthLoading } = useAuth();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const [isEditingName, setEditingName] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMenuOpen = !!menuAnchorEl;
  const navigate = useNavigate();
  const theme = useTheme();

  if (isAuthLoading) {
    return <CircularProgress />;
  }

  const handleLogout = () => {
    fetch(`${serverBaseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).then(() => navigate(0));
    closeMenu();
  };

  const onAuthSuccess = (data: Record<string, any>) => {
    navigate(0);
    // setUser(data as User);
  };

  const onAuthFailure = (err: Error) => console.error(err);

  // Uses native MouseEvent
  const handleClickOutside = (event: MouseEvent) => {
    // Close if click is outside the button or menu.
    if (
      menuRef.current &&
      buttonRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      closeMenu();
    }
  };

  const openMenu = (event: ReactMouseEvent<HTMLElement>) => {
    document.addEventListener('click', handleClickOutside, { capture: true });
    setMenuAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    document.removeEventListener('click', handleClickOutside, {
      capture: true,
    });
    setMenuAnchorEl(undefined);
  };

  return user ? (
    <>
      <div
        id='user-button'
        ref={buttonRef}
        aria-controls={isMenuOpen ? 'user-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={isMenuOpen ? 'true' : undefined}
        onClick={isMenuOpen ? closeMenu : openMenu}
      >
        <Avatar
          alt={user.name}
          src={user.imageUrl}
          style={{ width: 32, height: 32, marginRight: 8 }}
        >
          {user.name.charAt(0)}
        </Avatar>
        <Typography
          className='disabled-text-interaction'
          variant='body1'
          style={{ paddingRight: 16 }}
        >
          {user.name}
        </Typography>
        <ArrowDropDown
          className={`toggle-arrow toggle-${isMenuOpen ? 'open' : 'closed'}`}
        />
      </div>
      <Menu
        id='user-menu'
        ref={menuRef}
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
        slotProps={{
          root: {
            style: { display: 'contents' },
          },
        }}
      >
        <li style={{ padding: '6px 12px' }}>
          <TextField
            disabled={!isEditingName}
            variant='outlined'
            size='small'
            value={user.name}
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
      responseType='code'
      isCrossOrigin
      clientId={discordClientId ?? ''}
      redirectUri={new URL(discordRedirectPath, serverBaseUrl).toString()}
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
