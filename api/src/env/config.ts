export const {
  NODE_ENV = 'development',
  DISCORD_REDIRECT_PATH = '',
  DISCORD_CLIENT_ID = '',
  DISCORD_CLIENT_SECRET = '',
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
} else if (!JWT_SECRET) {
  throw new Error('No JWT_SECRET provided');
} else if (!CLIENT_URL && !CLIENT_URL_PATTERN) {
  throw new Error('No CLIENT_URL provided');
} else if (!BLOB_READ_WRITE_TOKEN) {
  throw new Error('No BLOB_READ_WRITE_TOKEN provided');
}
