import { Router } from 'express';
import { getUpdates, postUpdate } from '../model/updates-model.js';
import { auth } from './auth-router.js';

const router = Router();

router.get('/', (req, res) => {
  const { projectId, userId } = req.query;
  getUpdates(projectId as string, userId as string)
    .then((response) => {
      res.status(200).send({ success: true, data: response });
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

router.post('/', auth, (req, res) => {
  const userId = res.locals.userId;
  const { projectId } = req.query;
  const { text } = req.body;
  postUpdate(text, userId, projectId as string)
    .then((response) => {
      res.status(200).send({ success: true, data: response });
    })
    .catch((error) =>
      res.status(500).send({ success: false, errors: [error.message] }),
    );
});

export { router as updatesRouter };
