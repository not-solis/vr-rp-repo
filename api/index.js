import express from 'express';
import mung from 'express-mung';
import { getProjectById, getProjects } from './model/project-model.js';

// TODO: use service architecture. Served all-in-one in index for now.

const app = express();
const PORT = 3001;

app.use(express.json());
app.use((_, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers'
  );
  next();
});
app.use(
  mung.json((body, req, res) => {
    const remapJson = (obj) => {
      Object.entries(obj).forEach(([k, v]) => {
        if (v instanceof Date) {
          obj[k] = new Date(v).getTime();
        }
      });
      return obj;
    };
    return remapJson(body);
  })
);

app.get('/projects', (req, res) => {
  const { start, limit, sortBy, name, tags, asc } = req.query;
  getProjects(
    parseInt(start),
    parseInt(limit),
    sortBy,
    name,
    tags ? tags.split('|') : [],
    asc === 'true'
  )
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

app.get('/projects/:id', (req, res) => {
  const { id } = req.params;
  getProjectById(id)
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((error) => res.status(500).send(error));
});

app.get('/auth/discord', (req, res) => {
  res.write('hellohello');
});

app.post('/auth', (req, res) => {
  const token = sign(req.body, JWT_TOKEN);
  return res.status(200).json({ success: true, token });
});

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
