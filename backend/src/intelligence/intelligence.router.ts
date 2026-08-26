import { Router } from 'express';
import {
  analyzeIncident,
  getAnalysis,
  getMatches,
  getExplanation,
  lookupByCoordinates,
  getLiveLocations
} from './intelligence.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware';

const intelligenceRouter = Router();

// Public endpoints with optional authentication context
intelligenceRouter.get('/live-locations', optionalAuthMiddleware as any, getLiveLocations as any);
intelligenceRouter.get('/locations/live', optionalAuthMiddleware as any, getLiveLocations as any);
intelligenceRouter.get('/lookup', optionalAuthMiddleware as any, lookupByCoordinates as any);

// Incident-specific analysis endpoints require full authentication
intelligenceRouter.post('/analyze/:incidentId', authMiddleware as any, analyzeIncident as any);
intelligenceRouter.get('/:incidentId', authMiddleware as any, getAnalysis as any);
intelligenceRouter.get('/:incidentId/matches', authMiddleware as any, getMatches as any);
intelligenceRouter.get('/:incidentId/explanation', authMiddleware as any, getExplanation as any);

export { intelligenceRouter };
