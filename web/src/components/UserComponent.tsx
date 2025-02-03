import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ArrowDropDown,
  BugReport,
  Close,
  Edit,
  Login,
  Logout,
  Save,
} from '@mui/icons-material';
import {
  Avatar,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { MouseEvent as ReactMouseEvent, useRef, useState } from 'react';
import OAuth2Login from 'react-simple-oauth2-login';

import { VisuallyHiddenInput } from './VisuallyHiddenInput';
import { useAuth } from '../context/AuthProvider';
import { useSnackbar } from '../context/SnackbarProvider';
import {
  REACT_APP_DISCORD_CLIENT_ID,
  REACT_APP_DISCORD_REDIRECT_PATH,
  REACT_APP_GOOGLE_CLIENT_ID,
  REACT_APP_GOOGLE_REDIRECT_PATH,
  REACT_APP_MAX_IMAGE_SIZE,
  REACT_APP_SERVER_BASE_URL,
  REACT_APP_TWITCH_CLIENT_ID,
  REACT_APP_TWITCH_REDIRECT_PATH,
} from '../Env';
import { queryServer } from '../model/ServerResponse';
import './UserComponent.css';

export const UserComponent = () => {
  const { user, isAuthLoading } = useAuth();
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement>();
  const [isEditingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.name);
  const buttonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMenuOpen = !!menuAnchorEl;
  const queryClient = useQueryClient();
  const { createSnackbar, createErrorSnackbar } = useSnackbar();
  const theme = useTheme();

  if (isAuthLoading) {
    return <CircularProgress />;
  }

  const refetchUser = () => {
    queryClient.refetchQueries({
      queryKey: ['auth'],
    });
  };

  const resetUser = () => {
    queryClient.resetQueries({
      queryKey: ['auth'],
    });
  };

  const saveName = () => {
    if (name && name !== user?.name) {
      queryServer('/users/name', {
        method: 'PATCH',
        body: { name },
        isJson: true,
        useAuth: true,
      })
        .then(refetchUser)
        .catch(createErrorSnackbar)
        .finally(() => setEditingName(false));
    } else {
      cancelNameEdit();
    }
  };

  const saveImage = async (file: File) => {
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      const imageUrl = await queryServer<string>('/users/image', {
        method: 'POST',
        body: formData,
        useAuth: true,
      }).catch((err) => {
        console.error(err);
        createErrorSnackbar(err);
      });

      if (imageUrl) {
        queryServer('/users/image', {
          method: 'PATCH',
          body: { imageUrl },
          isJson: true,
          useAuth: true,
        })
          .then(refetchUser)
          .catch((err) => {
            console.error(err);
            createErrorSnackbar(err);
          });
      }
    }
  };

  const handleLogout = () => {
    queryServer('/auth/logout', { method: 'POST', useAuth: true }).then(
      resetUser,
    );
    closeMenu();
  };

  const onAuthSuccess = () => {
    closeMenu();
    refetchUser();
  };

  const onAuthFailure = (err: Error) => {
    closeMenu();
    console.error(err);
  };

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

  const cancelNameEdit = () => {
    setName(user!.name);
    setEditingName(false);
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
          style={{ width: 32, height: 32 }}
        >
          {user.name.charAt(0)}
        </Avatar>
        <Typography className='disabled-text-interaction' variant='body1'>
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
            style: { display: 'contents', width: 'fit-content' },
          },
        }}
      >
        <li style={{ paddingLeft: 16 }}>
          <Stack direction='row' alignItems='center' spacing={2}>
            <label id='avatar-label'>
              <Avatar id='user-menu-avatar' alt={user.name} src={user.imageUrl}>
                {user.name.charAt(0)}
              </Avatar>
              <VisuallyHiddenInput
                type='file'
                accept='image/*'
                onChange={(event) => {
                  const { files } = event.currentTarget;
                  if (files && files.length > 0) {
                    const file = files[0];
                    if (file.size > REACT_APP_MAX_IMAGE_SIZE) {
                      createSnackbar({
                        title: 'Input Error',
                        severity: 'error',
                        content: 'Image is too large! Max upload size is 1MB.',
                      });
                    } else {
                      saveImage(file);
                    }
                  }
                }}
              />
            </label>
            <Typography>{user.name}</Typography>
          </Stack>
        </li>
        <Divider variant='middle' />
        <li style={{ padding: '4px 12px' }}>
          <Typography variant='subtitle1'>{user.email}</Typography>
        </li>
        <li style={{ padding: '6px 12px' }}>
          <Stack direction='row' alignItems='center' spacing={1}>
            <TextField
              disabled={!isEditingName}
              variant='outlined'
              size='small'
              value={isEditingName ? name : user.name}
              style={{ width: 160, marginRight: isEditingName ? 0 : 44 }}
              onChange={(e) => setName(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: isEditingName ? (
                    <IconButton
                      size='small'
                      style={{ transform: 'translateX(8px)' }}
                      onClick={cancelNameEdit}
                    >
                      <Close fontSize='small' />
                    </IconButton>
                  ) : (
                    <IconButton
                      size='small'
                      style={{ transform: 'translateX(8px)' }}
                      onClick={() => {
                        setName(user.name);
                        setEditingName(true);
                      }}
                    >
                      <Edit fontSize='small' />
                    </IconButton>
                  ),
                },
              }}
            />
            {isEditingName && (
              <IconButton onClick={saveName}>
                <Save fontSize='small' />
              </IconButton>
            )}
          </Stack>
        </li>
        <Divider variant='middle' />
        <MenuItem
          onClick={() =>
            window.open(
              'https://github.com/mfboulos/vr-rp-myriad/issues/new?template=Blank+issue',
              '_blank',
            )
          }
        >
          <BugReport style={{ marginRight: 6 }} />
          Report Bug
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout style={{ marginRight: 6 }} />
          Logout
        </MenuItem>
      </Menu>
    </>
  ) : (
    <>
      <div
        id='user-button'
        ref={buttonRef}
        aria-controls={isMenuOpen ? 'user-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={isMenuOpen ? 'true' : undefined}
        onClick={isMenuOpen ? closeMenu : openMenu}
      >
        <Login />
        Login
      </div>
      <Menu
        id='login-menu'
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
          'aria-labelledby': 'login-button',
          style: { padding: 8 },
        }}
        slotProps={{
          root: {
            style: { display: 'contents' },
          },
        }}
      >
        <li>
          <OAuth2Login
            authorizationUrl='https://discord.com/oauth2/authorize'
            responseType='code'
            isCrossOrigin
            clientId={REACT_APP_DISCORD_CLIENT_ID}
            redirectUri={new URL(
              REACT_APP_DISCORD_REDIRECT_PATH,
              REACT_APP_SERVER_BASE_URL,
            ).toString()}
            scope='identify+email'
            buttonText='Discord'
            onSuccess={onAuthSuccess}
            onFailure={onAuthFailure}
            render={({ className, buttonText, children, onClick }) => (
              <Button
                style={{
                  display: 'flex',
                  backgroundColor: '#5865F2',
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                }}
                variant='contained'
                startIcon={<FontAwesomeIcon icon={['fab', 'discord']} />}
                onClick={onClick}
              >
                {buttonText}
              </Button>
            )}
          />
        </li>
        <li>
          <OAuth2Login
            authorizationUrl='https://accounts.google.com/o/oauth2/v2/auth'
            responseType='code'
            isCrossOrigin
            clientId={REACT_APP_GOOGLE_CLIENT_ID}
            redirectUri={new URL(
              REACT_APP_GOOGLE_REDIRECT_PATH,
              REACT_APP_SERVER_BASE_URL,
            ).toString()}
            scope='email'
            buttonText='Google'
            onSuccess={onAuthSuccess}
            onFailure={onAuthFailure}
            render={({ className, buttonText, children, onClick }) => (
              <Button
                style={{
                  display: 'flex',
                  backgroundColor: 'white',
                  color: '#303030',
                  textTransform: 'none',
                }}
                variant='contained'
                startIcon={
                  <img
                    src='https://www.vectorlogo.zone/logos/google/google-icon.svg'
                    width={20}
                  />
                }
                onClick={onClick}
              >
                {buttonText}
              </Button>
            )}
          />
        </li>
        <li>
          <OAuth2Login
            authorizationUrl='https://id.twitch.tv/oauth2/authorize'
            responseType='code'
            isCrossOrigin
            clientId={REACT_APP_TWITCH_CLIENT_ID}
            redirectUri={new URL(
              REACT_APP_TWITCH_REDIRECT_PATH,
              REACT_APP_SERVER_BASE_URL,
            ).toString()}
            scope={encodeURIComponent('user:read:email')}
            buttonText='Twitch'
            onSuccess={onAuthSuccess}
            onFailure={onAuthFailure}
            render={({ className, buttonText, children, onClick }) => (
              <Button
                style={{
                  display: 'flex',
                  backgroundColor: '#8956fb',
                  color: theme.palette.text.primary,
                  textTransform: 'none',
                }}
                variant='contained'
                startIcon={<FontAwesomeIcon icon={['fab', 'twitch']} />}
                onClick={onClick}
              >
                {buttonText}
              </Button>
            )}
          />
        </li>
      </Menu>
    </>
  );
};
