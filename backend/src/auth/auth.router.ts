import { Router } from 'express';
import { register, login, refresh, logout, getMe } from './auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rate-limiter.middleware';

const authRouter = Router();

// Rate limiter: max 5 requests per 15 minutes for security-sensitive auth routes
const authLimit = rateLimiter(15 * 60 * 1000, 5);

authRouter.post('/register', authLimit, register);
authRouter.post('/login', authLimit, login);
authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);
authRouter.get('/me', authMiddleware as any, getMe as any);

export { authRouter };
