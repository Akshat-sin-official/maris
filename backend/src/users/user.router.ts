import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser } from './user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const userRouter = Router();

// Apply authMiddleware globally to all user routes
userRouter.use(authMiddleware as any);

userRouter.get('/', getUsers as any);
userRouter.get('/:id', getUserById as any);
userRouter.post('/', createUser as any);
userRouter.patch('/:id', updateUser as any);

export { userRouter };
