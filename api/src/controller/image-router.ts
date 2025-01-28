import { Request, Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { respondError, respondSuccess, ResponseData } from '../index.js';
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
      respondError(res, {
        name: 'Image Upload Error',
        message: 'No image provided.',
        code: 400,
      });
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
        respondSuccess(res, blob.url, 201);
      })
      .catch((err) =>
        respondError(res, {
          name: 'Image Upload Error',
          message: err.message,
        }),
      );
  };
