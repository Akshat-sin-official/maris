import { Router } from 'express';
import {
  analyzeIncident,
  getAnalysis,
  getMatches,
  getExplanation,
  lookupByCoordinates
} from './intelligence.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const intelligenceRouter = Router();

// Secure all intelligence endpoints
intelligenceRouter.use(authMiddleware as any);

intelligenceRouter.get('/lookup', lookupByCoordinates as any);
intelligenceRouter.post('/analyze/:incidentId', analyzeIncident as any);
intelligenceRouter.get('/:incidentId', getAnalysis as any);
intelligenceRouter.get('/:incidentId/matches', getMatches as any);
intelligenceRouter.get('/:incidentId/explanation', getExplanation as any);

export { intelligenceRouter };
