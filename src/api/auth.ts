import express from 'express';
import { sign } from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_TOKEN = process.env.REACT_APP_JWT_SECRET ?? '';

app.get('/auth/discord', (request, response) => {
  response.write('hellohello');
});

app.post('/auth', (request, response) => {
  const token = sign(request.body, JWT_TOKEN);
  return response.status(200).json({ success: true, token });
});

app.listen(PORT);
