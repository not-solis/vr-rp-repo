export const {
  NODE_ENV = 'development',
  DISCORD_REDIRECT_PATH = '',
  DISCORD_CLIENT_ID = '',
  DISCORD_CLIENT_SECRET = '',
  GOOGLE_REDIRECT_PATH = '',
  GOOGLE_CLIENT_ID = '',
  GOOGLE_CLIENT_SECRET = '',
  TWITCH_REDIRECT_PATH = '',
  TWITCH_CLIENT_ID = '',
  TWITCH_CLIENT_SECRET = '',
  JWT_SECRET = '',
  CLIENT_URL = '',
  CLIENT_URL_PATTERN = '',
  BLOB_READ_WRITE_TOKEN = '',
} = process.env;

if (!DISCORD_REDIRECT_PATH) {
  throw new Error('No DISCORD_REDIRECT_PATH provided');
} else if (!DISCORD_CLIENT_ID) {
  throw new Error('No DISCORD_CLIENT_ID provided');
} else if (!DISCORD_CLIENT_SECRET) {
  throw new Error('No DISCORD_CLIENT_SECRET provided');
} else if (!GOOGLE_REDIRECT_PATH) {
  throw new Error('No GOOGLE_REDIRECT_PATH provided');
} else if (!GOOGLE_CLIENT_ID) {
  throw new Error('No GOOGLE_CLIENT_ID provided');
} else if (!GOOGLE_CLIENT_SECRET) {
  throw new Error('No GOOGLE_CLIENT_SECRET provided');
} else if (!TWITCH_REDIRECT_PATH) {
  throw new Error('No TWITCH_REDIRECT_PATH provided');
} else if (!TWITCH_CLIENT_ID) {
  throw new Error('No TWITCH_CLIENT_ID provided');
} else if (!TWITCH_CLIENT_SECRET) {
  throw new Error('No TWITCH_CLIENT_SECRET provided');
} else if (!JWT_SECRET) {
  throw new Error('No JWT_SECRET provided');
} else if (!CLIENT_URL && !CLIENT_URL_PATTERN) {
  throw new Error('No CLIENT_URL provided');
} else if (!BLOB_READ_WRITE_TOKEN) {
  throw new Error('No BLOB_READ_WRITE_TOKEN provided');
}

export const isDev = NODE_ENV === 'development';
export const PORT = process.env.PORT ?? 3001;
