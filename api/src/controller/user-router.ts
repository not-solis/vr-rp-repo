import { Router } from 'express';
import { auth } from './auth-router.js';
import { updateUserImageUrl, updateUserName } from '../model/users-model.js';
import { handleImageUploadRequest, limitImageUpload } from './image-router.js';

const router = Router();

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
    .then((url) => res.status(200).json({ success: true, data: url }))
    .catch(() =>
      res
        .status(500)
        .json({ success: false, errors: ['Internal server error.'] }),
    );
});

export { router as userRouter };
