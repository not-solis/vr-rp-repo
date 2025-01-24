import express from 'express';
import mung from 'express-mung';
import { projectRouter } from './controller/project-router';
import { authRouter } from './controller/auth-router';

export interface ResponseData<T> {
  success: boolean;
  errors?: string[];
  data?: T;
}

const app = express();
const PORT = 3001;

app.use(express.json());
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers',
  );
  next();
});
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

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
export default app;
