import { del, put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN, isDev } from '../env/config.js';

export const uploadImage = async (
  fileName: string,
  path: string,
  file: string | Buffer | Blob | ArrayBuffer | ReadableStream | File,
  contentType: string,
) =>
  put(`${path}/${fileName}`, file, {
    access: 'public',
    addRandomSuffix: true,
    token: BLOB_READ_WRITE_TOKEN,
    contentType,
  });

export const deleteImage = async (fileUrl: string) => {
  return del(fileUrl, { token: BLOB_READ_WRITE_TOKEN });
};
