import { RequestHandler, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import {
  createUser,
  getUserById,
  getUserByOAuthEmail,
  getUserByOAuthId,
  updateOAuthId,
  UserRole,
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
import { sendMail } from '../service/email-service.js';
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

const sendWelcomeEmail = (email: string, name: string) => (user: any) => {
  sendMail({
    to: email,
    subject: 'Welcome to the Repo',
    html: `
    <h1>Hello, ${name}!</h1>
    <p>Your account has been successfully registered as <b>${name}</b>. You
    can change your account details at any time under the user menu.</p>`,
  });
  return user;
};

interface OAuthUserInfo {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
}

interface OAuthHandlerProps {
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  redirectPath: string;
  idType: 'discord_id' | 'google_id' | 'twitch_id';
  getUserInfo: (tokenType: string, token: string) => Promise<OAuthUserInfo>;
}

const handleOAuth: (props: OAuthHandlerProps) => RequestHandler =
  (props: OAuthHandlerProps) => async (req, res) => {
    const {
      tokenUrl,
      clientId,
      clientSecret,
      redirectPath,
      idType,
      getUserInfo,
    } = props;
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
      redirectPath,
      `http${secure ? 's' : ''}://${req.headers.host}`,
    );

    try {
      const { token_type, access_token } = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUrl.toString(),
        }),
      }).then<any>((res) => res.json());
      const tokenType =
        token_type.charAt(0).toUpperCase() + token_type.slice(1);

      const {
        id: oauthId,
        name,
        email,
        imageUrl,
      } = await getUserInfo(tokenType, access_token);

      const user =
        (await getUserByOAuthId(idType, oauthId)) ??
        (await getUserByOAuthEmail(email)) ??
        (await createUser(name, imageUrl, idType, oauthId, email).then(
          sendWelcomeEmail(email, name),
        ));
      const { userId: id, [idType]: newOAuthId } = user!;

      // Update existing record with ID
      if (!newOAuthId) {
        updateOAuthId(idType, id, oauthId);
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

    if (user.role === UserRole.Banned) {
      res.clearCookie('userToken');
      respondError(res, {
        code: 401,
        name: 'Permission Error',
        message: 'This user is banned.',
      });
    }

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
router.get(
  '/discord',
  handleOAuth({
    clientId: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    redirectPath: DISCORD_REDIRECT_PATH,
    idType: 'discord_id',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    getUserInfo: async (tokenType, accessToken) =>
      fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `${tokenType} ${accessToken}` },
      })
        .then<any>((res) => res.json())
        .then<OAuthUserInfo>((json) => ({
          id: json.id,
          name: json.global_name,
          email: json.email,
          imageUrl: json.avatar,
        })),
  }),
);

router.get(
  '/google',
  handleOAuth({
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    redirectPath: GOOGLE_REDIRECT_PATH,
    idType: 'google_id',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    getUserInfo: async (tokenType, accessToken) =>
      fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `${tokenType} ${accessToken}` },
      })
        .then<any>((res) => res.json())
        .then<OAuthUserInfo>((json) => ({
          id: json.id,
          name: (json.email as string).substring(
            0,
            (json.email as string).indexOf('@'),
          ),
          email: json.email,
          imageUrl: json.picture,
        })),
  }),
);

router.get(
  '/twitch',
  handleOAuth({
    clientId: TWITCH_CLIENT_ID,
    clientSecret: TWITCH_CLIENT_SECRET,
    redirectPath: TWITCH_REDIRECT_PATH,
    idType: 'twitch_id',
    tokenUrl: 'https://id.twitch.tv/oauth2/token',
    getUserInfo: async (tokenType, accessToken) =>
      fetch('https://api.twitch.tv/helix/users', {
        headers: {
          Authorization: `${tokenType} ${accessToken}`,
          'Client-Id': TWITCH_CLIENT_ID,
        },
      })
        .then<any>((res) => res.json())
        .then<any>((json) => json.data[0])
        .then<OAuthUserInfo>((json) => ({
          id: json.id,
          name: json.display_name,
          email: json.email,
          imageUrl: json.profile_image_url,
        })),
  }),
);

router.post('/logout', (_, res) => {
  // clear cookie
  res.clearCookie('userToken');
  respondSuccess(res);
});

export { router as authRouter };
