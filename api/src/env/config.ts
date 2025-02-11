import dotenv from 'dotenv';
dotenv.config();

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
  R2_BUCKET_NAME = '',
  R2_URL = '',
  R2_ENDPOINT = '',
  AWS_ACCESS_KEY_ID = '',
  AWS_SECRET_ACCESS_KEY = '',
  POSTGRES_URL,
  POSTGRES_USER,
  POSTGRES_HOST,
  POSTGRES_DATABASE,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
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
} else if (!R2_BUCKET_NAME) {
  throw new Error('No R2_BUCKET_NAME provided');
} else if (!R2_URL) {
  throw new Error('No R2_URL provided');
} else if (!R2_ENDPOINT) {
  throw new Error('No R2_ENDPOINT provided');
} else if (!AWS_ACCESS_KEY_ID) {
  throw new Error('No AWS_ACCESS_KEY_ID provided');
} else if (!AWS_SECRET_ACCESS_KEY) {
  throw new Error('No AWS_SECRET_ACCESS_KEY provided');
}

export const isDev = NODE_ENV === 'development';
export const PORT = process.env.PORT ?? 3001;
