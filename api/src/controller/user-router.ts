import { Router } from 'express';
import { auth } from './auth-router.js';
import { updateUserName } from '../model/users-model.js';
import cookieParser from 'cookie-parser';

const router = Router();
router.use(cookieParser());

router.patch('/name', auth, (req, res) => {
  const id = res.locals.userId;
  const { name } = req.body;
  updateUserName(id, name)
    .then((name) => res.status(200).json({ success: true, data: name }))
    .catch(() =>
      res
        .status(500)
        .json({ success: false, errors: ['Internal server error.'] }),
    );
});

export { router as userRouter };
