import express from 'express';
import mung from 'express-mung';
import { projectRouter } from './controller/project-router';
import { authRouter } from './controller/auth-router';
import cors from 'cors';
import { CLIENT_URL } from './config';

export interface ResponseData<T> {
  success: boolean;
  errors?: string[];
  data?: T;
}

const app = express();
const PORT = 3001;

app.use(express.json());

// cors
// app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   res.setHeader('Access-Control-Allow-Origin', CLIENT_URL);
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET,OPTIONS,PATCH,DELETE,POST,PUT',
//   );
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
//   );
//   if (req.method === 'OPTIONS') {
//     res.status(200).end();
//     return;
//   }
//   next();
// });
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
export default app;
