import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserTokenPayload } from '../auth/jwt.utils';
import { UnauthorizedError } from '../common/errors';

// Extend Express Request to include the authenticated user
export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token is missing or invalid'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}
