import { Router } from 'express';
import { getUpdates, postUpdate } from '../model/updates-model.js';
import { auth } from './auth-router.js';
import { respondError, respondSuccess } from '../index.js';

const router = Router();

router.get('/', (req, res) => {
  const { projectId, userId, start, limit } = req.query;
  getUpdates(
    projectId as string,
    userId as string,
    parseInt(start as string) || undefined,
    parseInt(limit as string) || undefined,
  )
    .then((data) => respondSuccess(res, data))
    .catch((err) =>
      respondError(res, {
        name: 'Get Updates Error',
        message: err.message,
      }),
    );
});

router.post('/', auth, (req, res) => {
  const userId = res.locals.userId;
  const { projectId } = req.query;
  const { text } = req.body;
  postUpdate(text, userId, projectId as string)
    .then((data) => respondSuccess(res, data))
    .catch((err) =>
      respondError(res, {
        name: 'Post Update Error',
        message: err.message,
      }),
    );
});

export { router as updatesRouter };
