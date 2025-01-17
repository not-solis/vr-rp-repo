import { Router } from 'express';
import { sign, verify } from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const {
  JWT_SECRET = '',
  TOKEN_EXPIRATION = 36000,
  CLIENT_URL = 'http://localhost:3000',
} = process.env;

const router = Router();

router.use(cookieParser());
router.use(
  cors({
    origin: [CLIENT_URL],
    credentials: true,
  })
);
router.post('/', (request, response, next) => {
  try {
    const { token } = request.cookies;
    if (!token) {
      return response.status(401);
    }

    verify(token, JWT_TOKEN);
    return next();
  } catch (error) {
    return response.status(401);
  }
});

router.get('/discord', (request, response) => {
  response.write('Success!');
});

router.post('/token', (request, response) => {
  const token = sign(request.body, JWT_TOKEN);
  return response.status(200).json({ success: true, token });
});

export { router as authRouter };
