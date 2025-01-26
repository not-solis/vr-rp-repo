import express from 'express';
import mung from 'express-mung';
import { projectRouter } from './controller/project-router.js';
import { authRouter } from './controller/auth-router.js';
import cors, { CorsOptions } from 'cors';
import { CLIENT_URL, CLIENT_URL_PATTERN, PORT } from './env/config.js';
import { userRouter } from './controller/user-router.js';

export interface ResponseData<T> {
  success: boolean;
  errors?: string[];
  data?: T;
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

app.get('/', (_, res) => {
  res.status(200).json({ message: 'Hello world!' });
});
app.use('/projects', projectRouter);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.listen(PORT, () => console.log(`App running on port ${PORT}`));
export { app };
