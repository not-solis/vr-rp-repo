import { Request, Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { ResponseData } from '../index.js';
import { deleteImage, uploadImage } from '../model/image-model.js';
import { isDev } from '../env/config.js';

export const limitImageUpload = fileUpload({
  limits: {
    fileSize: 1024 * 1024,
  },
});

/**
 * Handles image upload to the given path.
 *
 * If `res.params.old` is provided with a valid image upload URL, it will also
 * delete the old image at the provided URL.
 *
 * @param path Path to image upload
 * @returns
 */
export const handleImageUploadRequest =
  (path: string) => (req: Request, res: Response<ResponseData<string>>) => {
    if (!req.files) {
      res.status(400).send({ success: false, errors: ['No image provided.'] });
      return;
    }

    const old: string = res.locals.old;
    const file = req.files.image as UploadedFile;
    const filePath = path.replace(/^\/*|\/*$/g, '');
    uploadImage(
      file.name,
      isDev ? `dev/${filePath}` : filePath,
      file.data,
      file.mimetype,
    )
      .then((blob) => {
        if (old) {
          // Clean up, no need to wait for response
          deleteImage(old);
        }
        res.status(201).json({
          success: true,
          data: blob.url,
        });
      })
      .catch((err) =>
        res.status(500).send({ success: false, errors: [err.message] }),
      );
  };
