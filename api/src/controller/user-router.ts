import { Router } from 'express';
import { auth } from './auth-router.js';
import { updateUserImageUrl, updateUserName } from '../model/users-model.js';
import { handleImageUploadRequest, limitImageUpload } from './image-router.js';
import { respondError, respondSuccess } from '../index.js';

const router = Router();

router.patch('/name', auth, (req, res) => {
  const id = res.locals.userId;
  const { name } = req.body;
  updateUserName(id, name)
    .then((name) => respondSuccess(res, name))
    .catch((err) =>
      respondError(res, {
        name: 'Update Username Error',
        message: err.message,
      }),
    );
});

router.post(
  '/image',
  limitImageUpload,
  auth,
  handleImageUploadRequest('users'),
);

router.patch('/image', auth, (req, res) => {
  const id = res.locals.userId;
  const { imageUrl } = req.body;
  updateUserImageUrl(id, imageUrl)
    .then((url) => respondSuccess(res, url))
    .catch((err) =>
      respondError(res, {
        name: 'Update Image URL Error',
        message: err.message,
      }),
    );
});

export { router as userRouter };
