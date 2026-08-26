import { Router } from 'express';
import { queryAgenticAI } from './agent.controller';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';

const agentRouter = Router();

// Allow public citizen and operational AI queries with optional authentication context
agentRouter.post('/query', optionalAuthMiddleware as any, queryAgenticAI as any);

export { agentRouter };
