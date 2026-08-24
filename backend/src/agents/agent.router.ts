import { Router } from 'express';
import { queryAgenticAI } from './agent.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const agentRouter = Router();

// Secure query endpoint under authentication
agentRouter.post('/query', authMiddleware as any, queryAgenticAI as any);

export { agentRouter };
