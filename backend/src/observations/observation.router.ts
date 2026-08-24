import { Router } from 'express';
import { createObservation, getObservations, getObservationById, updateObservation } from './observation.controller';
import { createEvidenceForObservation, getEvidenceForObservation } from '../evidence/evidence.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const observationRouter = Router();

// Secure all observation endpoints
observationRouter.use(authMiddleware as any);

observationRouter.post('/', createObservation as any);
observationRouter.get('/', getObservations as any);
observationRouter.get('/:id', getObservationById as any);
observationRouter.patch('/:id', updateObservation as any);

// Evidence sub-resources
observationRouter.post('/:id/evidence', uploadMiddleware.single('file'), createEvidenceForObservation as any);
observationRouter.get('/:id/evidence', getEvidenceForObservation as any);

export { observationRouter };
