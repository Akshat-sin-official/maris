import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserTokenPayload } from '../auth/jwt.utils';
import { UnauthorizedError, ForbiddenError } from '../common/errors';

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

const ROLE_ALIASES: Record<string, string[]> = {
  CONTROL_ROOM_OPERATOR: ['CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM'],
  CONTROL_ROOM: ['CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM'],
  RESEARCHER: ['RESEARCHER', 'SUPERVISOR'],
  SUPERVISOR: ['RESEARCHER', 'SUPERVISOR'],
  COASTAL_OFFICER: ['COASTAL_OFFICER', 'FIELD_OFFICER'],
  FIELD_OFFICER: ['COASTAL_OFFICER', 'FIELD_OFFICER'],
  ADMIN: ['ADMIN', 'ORG_ADMIN'],
  ORG_ADMIN: ['ADMIN', 'ORG_ADMIN'],
};

/**
 * Reusable Role-Based Access Control (RBAC) Middleware with Role Alias Support
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.user.role;
    const expandedUserRoles = ROLE_ALIASES[userRole] || [userRole];

    const isAuthorized = allowedRoles.some((role) => {
      const expandedAllowed = ROLE_ALIASES[role] || [role];
      return expandedUserRoles.some((r) => expandedAllowed.includes(r));
    });

    if (!isAuthorized) {
      return next(new ForbiddenError(`Role '${userRole}' is not authorized to access this resource`));
    }

    next();
  };
}
