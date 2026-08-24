import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../common/errors';

export interface UserTokenPayload {
  userId: string;
  role: string;
  email: string;
  orgId?: string | null;
}

export function generateToken(payload: UserTokenPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyToken(token: string): UserTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as UserTokenPayload;
    return decoded;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
}
