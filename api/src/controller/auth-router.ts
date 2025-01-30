import { RequestHandler, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByOAuthId,
  updateOAuthId,
} from '../model/users-model.js';
import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_PATH,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_PATH,
  isDev,
  JWT_SECRET,
  TWITCH_CLIENT_ID,
  TWITCH_CLIENT_SECRET,
  TWITCH_REDIRECT_PATH,
} from '../env/config.js';
import { respondError, respondSuccess } from '../index.js';
const { sign, verify } = jwt;

const TOKEN_EXPIRATION = parseInt(process.env.TOKEN_EXPIRATION!) ?? 36000;

/**
 * RequestHandler used to preface endpoints that require user authentication.
 */
export const auth: RequestHandler = (req, res, next) => {
  try {
    const { userToken: token } = req.cookies;
    if (!token) {
      respondError(res, { code: 401 });
    }
    const jwtToken = verify(token, JWT_SECRET) as jwt.JwtPayload;
    res.locals.userId = jwtToken.id;
    next();
  } catch (err) {
    console.error(err);
    respondError(res);
  }
};

const oauthRespond = (res: Response, status: number, result: unknown = {}) => {
  res.status(status).send(`
    <!DOCTYPE html>
    <html>
      <head></head>
      <body style='background-color: #1f2023'>
        <script>
          window.addEventListener("message", function (event) {
            if (event.data.message === "requestResult") {
              event.source.postMessage({"message": "deliverResult", result: ${JSON.stringify(result)} }, "*");
            }
          });
        </script>
      </body>
    </html>
  `);
};

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { userToken: token } = req.cookies;
    if (!token) {
      console.log('No user token found.');
      respondSuccess(res, undefined, 204);
      return;
    }

    const jwtToken = verify(token, JWT_SECRET) as jwt.JwtPayload;
    const id = jwtToken.id;
    const newToken = sign({ id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    const user = await getUserById(id);

    // Reset token in cookie
    res.cookie('userToken', newToken, {
      maxAge: TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    respondSuccess(res, user);
  } catch (err) {
    console.error(err);
    respondError(res);
  }
});

/**
 * Redirect URL for Discord OAuth code workflow.
 */
router.get('/discord', async (req, res) => {
  const respond = (status: number, result: unknown = {}) => {
    oauthRespond(res, status, result);
  };

  const { code } = req.query;
  if (!code) {
    respond(400, { message: 'Authorization code must be provided' });
    return;
  }

  const secure = !isDev;
  const redirectUrl = new URL(
    DISCORD_REDIRECT_PATH,
    `http${secure ? 's' : ''}://${req.headers.host}`,
  );

  try {
    const { access_token, token_type } = await fetch(
      'https://discord.com/api/oauth2/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          code: code as string,
          grant_type: 'authorization_code',
          redirect_uri: redirectUrl.toString(),
          scope: 'identify',
        }),
      },
    ).then<any>((res) => res.json());

    const {
      id: discordId,
      global_name,
      avatar,
      email,
    } = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `${token_type} ${access_token}` },
    }).then<any>((res) => res.json());

    const user =
      (await getUserByOAuthId('discord_id', discordId)) ??
      (await getUserByEmail(email)) ??
      (await createUser(
        global_name,
        `https://cdn.discordapp.com/avatars/${discordId}/${avatar}`,
        'discord_id',
        discordId,
        email,
      ));
    const { userId: id, discordId: newDiscordId } = user!;

    // Update existing record with ID
    if (!newDiscordId) {
      updateOAuthId('discord_id', id, discordId);
    }

    // Sign user JWT
    const token = sign({ id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    // Set cookie for the user
    res.cookie('userToken', token, {
      maxAge: TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    respond(200, user);
  } catch (error) {
    console.error(error);
    respond(500, error);
  }
});

router.get('/google', async (req, res) => {
  const respond = (status: number, result: unknown = {}) => {
    oauthRespond(res, status, result);
  };

  const code = req.query.code as string;
  if (!code) {
    respond(400, { message: 'Authorization code must be provided' });
    return;
  }

  const secure = !isDev;
  const redirectUrl = new URL(
    GOOGLE_REDIRECT_PATH,
    `http${secure ? 's' : ''}://${req.headers.host}`,
  );

  try {
    const { access_token, token_type } = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUrl.toString(),
        }),
      },
    ).then<any>((res) => res.json());

    const {
      id: googleId,
      email,
      picture,
    } = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `${token_type} ${access_token}` },
    }).then<any>((res) => res.json());

    const user =
      (await getUserByOAuthId('google_id', googleId)) ??
      (await getUserByEmail(email)) ??
      (await createUser(
        (email as string).substring(0, (email as string).indexOf('@')),
        picture,
        'google_id',
        googleId,
        email,
      ));
    const { userId: id, googleId: newGoogleId } = user!;

    // Update existing record with ID
    if (!newGoogleId) {
      updateOAuthId('google_id', id, googleId);
    }

    // Sign user JWT
    const token = sign({ id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    // Set cookie for the user
    res.cookie('userToken', token, {
      maxAge: TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    respond(200, user);
  } catch (error) {
    console.error(error);
    respond(500, error);
  }
});

router.get('/twitch', async (req, res) => {
  const respond = (status: number, result: unknown = {}) => {
    oauthRespond(res, status, result);
  };

  const code = req.query.code as string;
  if (!code) {
    respond(400, { message: 'Authorization code must be provided' });
    return;
  }

  const secure = !isDev;
  const redirectUrl = new URL(
    TWITCH_REDIRECT_PATH,
    `http${secure ? 's' : ''}://${req.headers.host}`,
  );

  try {
    const { access_token, token_type } = await fetch(
      'https://id.twitch.tv/oauth2/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUrl.toString(),
        }),
      },
    ).then<any>((res) => res.json());

    const tokenType = token_type.charAt(0).toUpperCase() + token_type.slice(1);
    const { data } = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `${tokenType} ${access_token}`,
        'Client-Id': TWITCH_CLIENT_ID,
      },
    }).then<any>((res) => res.json());
    const { id: twitchId, display_name, profile_image_url, email } = data[0];

    const user =
      (await getUserByOAuthId('twitch_id', twitchId)) ??
      (await getUserByEmail(email)) ??
      (await createUser(
        display_name,
        profile_image_url,
        'twitch_id',
        twitchId,
        email,
      ));
    const { userId: id, googleId: newTwitchId } = user!;

    // Update existing record with ID
    if (!newTwitchId) {
      updateOAuthId('twitch_id', id, twitchId);
    }

    // Sign user JWT
    const token = sign({ id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    // Set cookie for the user
    res.cookie('userToken', token, {
      maxAge: TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    respond(200, user);
  } catch (error) {
    console.error(error);
    respond(500, error);
  }
});

router.post('/logout', (_, res) => {
  // clear cookie
  res.clearCookie('userToken');
  respondSuccess(res);
});

export { router as authRouter };
