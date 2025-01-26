import { RequestHandler, Router } from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { createUser, getUserByDiscordId, User } from '../model/users-model.js';
import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_PATH,
  isDev,
  JWT_SECRET,
} from '../env/config.js';
const { sign, verify } = jwt;

const TOKEN_EXPIRATION = parseInt(process.env.TOKEN_EXPIRATION!) ?? 36000;

/**
 * RequestHandler used to preface endpoints that require user authentication.
 */
export const auth: RequestHandler = (request, response, next) => {
  try {
    const { userToken: token } = request.cookies;
    if (!token) {
      response.status(401).json();
    }
    const jwtToken = verify(token, JWT_SECRET) as jwt.JwtPayload;
    response.locals.user = jwtToken.user as User;
    next();
  } catch (err) {
    console.error(err);
    response.status(401).json();
  }
};

const router = Router();

router.use(cookieParser());

router.get('/', (request, response) => {
  try {
    const { userToken: token } = request.cookies;
    if (!token) {
      console.log('No user token found.');
      response.json({ authenticated: false });
      return;
    }

    const jwtToken = verify(token, JWT_SECRET) as jwt.JwtPayload;
    const user: User = jwtToken.user;
    const newToken = sign({ user }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    // Reset token in cookie
    response.cookie('userToken', newToken, {
      maxAge: TOKEN_EXPIRATION * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    response.json({ authenticated: true, user });
  } catch (err) {
    console.error(err);
    response.json({ authenticated: false });
  }
});

/**
 * Redirect URL for Discord OAuth code workflow.
 */
router.get('/discord', async (request, response) => {
  const respond = (status: number, result: unknown = {}) => {
    response.status(status).send(`
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

  const { code } = request.query;
  if (!code) {
    respond(400, { message: 'Authorization code must be provided' });
    return;
  }

  const secure = !isDev;
  const redirectUrl = new URL(
    DISCORD_REDIRECT_PATH,
    `http${secure ? 's' : ''}://${request.headers.host}`,
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
    ).then((res) => res.json() as any);

    const {
      id: discordId,
      global_name,
      avatar,
    } = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `${token_type} ${access_token}` },
    }).then((res) => res.json() as any);

    let { data: user } = await getUserByDiscordId(discordId);
    if (!user) {
      const { data: newUser } = await createUser(
        discordId,
        global_name,
        `https://cdn.discordapp.com/avatars/${discordId}/${avatar}`,
      );
      user = newUser;
    }

    // Sign user JWT
    const token = sign({ user }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    // Set cookie for the user
    response.cookie('userToken', token, {
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

router.post('/logout', (_, response) => {
  // clear cookie
  response.clearCookie('userToken').json({ message: 'Logged out' });
});

export { router as authRouter };
