import { Request, Response } from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { respondError, respondSuccess, ResponseData } from '../index.js';
import { deleteImage, uploadImage } from '../service/r2.js';
import { R2_URL } from '../env/config.js';

const SUFFIX_LENGTH = 16;
const ALPHANUM =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateRandomSuffix = () =>
  '-' +
  Array(SUFFIX_LENGTH)
    .fill(undefined)
    .map(() => ALPHANUM.charAt(Math.floor(Math.random() * 62)))
    .join('');

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

    const idx = file.name.lastIndexOf('.');
    const fileName =
      idx === -1
        ? file.name + generateRandomSuffix()
        : `${file.name.slice(0, idx)}${generateRandomSuffix()}${file.name.slice(idx)}`;
    uploadImage(fileName, filePath, file.data, file.mimetype)
      .then(() => {
        if (old) {
          // Clean up, no need to wait for response.
          const oldUrl = new URL(old);
          // Image path is pointed at by the URL path.
          deleteImage(oldUrl.pathname.substring(1));
        }
        respondSuccess(res, `${R2_URL}/${filePath}/${fileName}`, 201);
      })
      .catch((err) => {
        console.error(err);
        respondError(res, {
          name: 'Image Upload Error',
          message: err.message,
        });
      });
  };
