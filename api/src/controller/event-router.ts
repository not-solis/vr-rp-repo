import { Router } from 'express';
import { getEvents } from '../model/project-model.js';
import { respondError, respondSuccess } from '../index.js';

const router = Router();
router.get('/', (req, res) => {
  const { start_date: startDate, end_date: endDate, tags, active } = req.query;
  if (!startDate || !endDate) {
    respondError(res, {
      code: 400,
      name: 'Query Error',
      message:
        'Missing date range parameters: must include start_date and end_date.',
    });
    return;
  }

  getEvents({
    startDate: new Date(startDate as string),
    endDate: new Date(endDate as string),
    tags: Array.isArray(tags)
      ? (tags as string[])
      : ((tags as string)?.split('|') ?? []),
    activeOnly: active === 'true',
  })
    .then((data) => {
      respondSuccess(res, data, 206);
    })
    .catch((err) => {
      console.error(err);
      respondError(res, {
        name: 'Get Projects Error',
        message: err.message,
      });
    });
});

export { router as eventRouter };
