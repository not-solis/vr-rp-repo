import { Router } from 'express';
import { sign, verify } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const {
  JWT_SECRET,
  TOKEN_EXPIRATION = 36000,
  CLIENT_URL = 'http://localhost:3000',
} = process.env;

const router = Router();

router.use(cookieParser());
router.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  }),
);
router.get('/', (request, response, next) => {
  try {
    if (!JWT_SECRET) {
      response.status(500).send();
      return;
    }

    const { token } = request.cookies;
    if (!token) {
      response.status(401).send();
      return;
    }

    verify(token, JWT_SECRET);
    next();
  } catch (error) {
    console.log(error);
    response.status(401).send();
  }
});

router.get('/discord', (request, response) => {
  response.write('Success!');
});

router.post('/token', (request, response) => {
  if (!JWT_SECRET) {
    response.status(500).send();
    return;
  }
  const token = sign(request.body, JWT_SECRET);
  response.status(200).json({ success: true, token });
});

export { router as authRouter };
