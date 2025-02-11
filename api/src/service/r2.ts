import {
  DeleteObjectCommand,
  DeleteObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_ENDPOINT,
} from '../env/config.js';

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadImage = async (
  fileName: string,
  path: string,
  file: string | Buffer | Blob | ReadableStream | File,
  contentType: string,
) => {
  const params: PutObjectCommandInput = {
    Bucket: R2_BUCKET_NAME,
    Key: `${path}/${fileName}`,
    Body: file,
    ContentType: contentType,
  };
  const command = new PutObjectCommand(params);
  return s3.send(command);
};

export const deleteImage = async (path: string) => {
  const params: DeleteObjectCommandInput = {
    Bucket: R2_BUCKET_NAME,
    Key: path,
  };
  const command = new DeleteObjectCommand(params);
  return s3.send(command);
};

// R2_BUCKET_NAME
