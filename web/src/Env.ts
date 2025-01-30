const DEFAULT_MAX_IMAGE_SIZE = 1024 * 1024;

export const {
  REACT_APP_SERVER_BASE_URL = '',
  REACT_APP_DISCORD_REDIRECT_PATH = '',
  REACT_APP_DISCORD_CLIENT_ID = '',
  REACT_APP_GOOGLE_REDIRECT_PATH = '',
  REACT_APP_GOOGLE_CLIENT_ID = '',
} = process.env;

if (!REACT_APP_SERVER_BASE_URL) {
  throw new Error('Server URL not configured.');
} else if (!REACT_APP_DISCORD_REDIRECT_PATH) {
  throw new Error('Discord redirect URL not configured.');
} else if (!REACT_APP_DISCORD_CLIENT_ID) {
  throw new Error('Discord client ID not configured.');
} else if (!REACT_APP_GOOGLE_REDIRECT_PATH) {
  throw new Error('Google redirect URL not configured.');
} else if (!REACT_APP_GOOGLE_CLIENT_ID) {
  throw new Error('Google client ID not configured.');
}

export const REACT_APP_MAX_IMAGE_SIZE =
  parseInt(process.env.REACT_APP_MAX_IMAGE_SIZE!) || DEFAULT_MAX_IMAGE_SIZE;
