import { Router } from 'express';
import { syncSingleIncident, syncSingleEvidence, syncBatch, getSyncStatus } from './sync.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const syncRouter = Router();

// Secure all sync endpoints
syncRouter.use(authMiddleware as any);

syncRouter.post('/incident', syncSingleIncident as any);
syncRouter.post('/evidence', syncSingleEvidence as any);
syncRouter.post('/batch', syncBatch as any);
syncRouter.get('/status/:clientId', getSyncStatus as any);

export { syncRouter };
