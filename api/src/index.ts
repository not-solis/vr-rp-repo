import express from 'express';
import mung from 'express-mung';
import { projectRouter } from './controller/project-router.js';
import { authRouter } from './controller/auth-router.js';
import cors, { CorsOptions } from 'cors';
import { CLIENT_URL, CLIENT_URL_PATTERN } from './env/config.js';

export interface ResponseData<T> {
  success: boolean;
  errors?: string[];
  data?: T;
}

const PORT = 3001;
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
  // allowedHeaders: [
  //   'X-CSRF-Token',
  //   'X-Requested-With',
  //   'Accept',
  //   'Accept-Version',
  //   'Content-Length',
  //   'Content - MD5',
  //   'Content - Type',
  //   'Date',
  //   'X - Api - Version',
  // ],
  methods: ['GET', 'OPTIONS', 'PATCH', 'DELETE', 'POST', 'PUT'],
  credentials: true,
  preflightContinue: true,
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());

app.use(
  mung.json((body) => {
    const remapJson = (obj: any) => {
      Object.entries(obj).forEach(([k, v]) => {
        if (v instanceof Date) {
          obj[k] = new Date(v).getTime();
        }
      });
      return obj;
    };
    return remapJson(body);
  }),
);

app.use('/projects', projectRouter);
app.use('/auth', authRouter);
app.get('/', (_, res) => {
  res.status(200).json({ message: 'Hello world!' });
});

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
export { app };
