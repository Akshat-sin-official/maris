import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser } from './user.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const userRouter = Router();

// Apply authMiddleware globally to all user routes
userRouter.use(authMiddleware as any);

// Require Admin / Staff authorization for user management endpoints
userRouter.get('/', requireRole('ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM', 'CONTROL_ROOM_OPERATOR') as any, getUsers as any);
userRouter.get('/:id', getUserById as any);
userRouter.post('/', requireRole('ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM', 'CONTROL_ROOM_OPERATOR') as any, createUser as any);
userRouter.patch('/:id', requireRole('ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM', 'CONTROL_ROOM_OPERATOR') as any, updateUser as any);

export { userRouter };
