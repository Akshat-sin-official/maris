import multer from 'multer';
import { Request } from 'express';
import { ValidationError } from '../common/errors';
import { env } from '../config/env';

const storage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

function fileFilter(_req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new ValidationError(`MIME type '${file.mimetype}' is not supported.`));
  }
  callback(null, true);
}

// Multer supports limits. We'll set a generous maximum buffer limit of 50MB,
// but we will validate individual files inside the controller or middleware dynamically using env configurations.
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(env.MAX_IMAGE_SIZE_MB, env.MAX_VIDEO_SIZE_MB) * 1024 * 1024,
  }
});
