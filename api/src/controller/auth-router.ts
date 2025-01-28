import { RequestHandler, Router } from 'express';
import jwt from 'jsonwebtoken';
import {
  createUser,
  getUserByDiscordId,
  getUserById,
} from '../model/users-model.js';
import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_PATH,
  isDev,
  JWT_SECRET,
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
    } = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `${token_type} ${access_token}` },
    }).then<any>((res) => res.json());

    const user =
      (await getUserByDiscordId(discordId)) ??
      (await createUser(
        discordId,
        global_name,
        `https://cdn.discordapp.com/avatars/${discordId}/${avatar}`,
      ));
    const { userId: id } = user!;

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
