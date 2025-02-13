import express, { Response } from 'express';
import { projectRouter } from './controller/project-router.js';
import { authRouter, TOKEN_EXPIRATION } from './controller/auth-router.js';
import cors, { CorsOptions } from 'cors';
import { CLIENT_URL, CLIENT_URL_PATTERN, isDev, PORT } from './env/config.js';
import { userRouter } from './controller/user-router.js';
import { updatesRouter } from './controller/updates-router.js';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import { eventRouter } from './controller/event-router.js';

export interface ResponseData<T> {
  success: boolean;
  error?: ResponseError;
  data?: T;
}

interface ResponseError {
  name: string;
  message: string | string[];
}

const app = express();

// cors
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const valid =
      !origin ||
      (CLIENT_URL
        ? CLIENT_URL === origin
        : new RegExp(CLIENT_URL_PATTERN).test(origin));
    callback(
      valid
        ? null
        : new Error(
            `Unsupported cross-origin request from ${origin} using pattern ${CLIENT_URL_PATTERN}`,
          ),
      valid,
    );
  },
  methods: ['GET', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
  credentials: true,
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.set('trust proxy', 1);
app.use(
  cookieSession({
    keys: ['key1'],
    maxAge: TOKEN_EXPIRATION * 1000,
    httpOnly: true,
    sameSite: isDev ? 'strict' : 'none',
    secure: !isDev,
  }),
);
app.use(express.json());
app.use(cookieParser());

interface ErrorResponse {
  name?: string;
  message?: string | string[];
  code?: number;
}

export const respondSuccess = <T>(res: Response, data?: T, status = 200) =>
  res.status(status).json({ success: true, data });
export const respondError = (res: Response, error: ErrorResponse = {}) => {
  const { name = 'Internal Server Error', message, code = 500 } = error;
  res
    .status(code)
    .json({ success: false, error: message ? { name, message } : undefined });
};

app.get('/', (_, res) => {
  res.status(200).json({ message: 'Hello world!' });
});
app.use('/projects', projectRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/updates', updatesRouter);
app.use('/events', eventRouter);
app.listen(PORT, () => console.log(`App running on port ${PORT}`));
export { app };
