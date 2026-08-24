import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors';
import { logger } from '../config/logger';
import { env } from '../config/env';

import { ZodError } from 'zod';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: unknown = undefined;
  let isOperational = err instanceof AppError ? err.isOperational : false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Request validation failed';
    isOperational = true;
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  if (!isOperational) {
    logger.error(`Non-operational system error: ${err.message}`, err);
  } else {
    logger.warn(`Operational error: ${err.message}`);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(details !== undefined && { details }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
