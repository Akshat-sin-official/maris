import { Router } from 'express';
import { getEvidenceById, deleteEvidence, getEvidenceAccessUrl } from './evidence.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const evidenceRouter = Router();

// Secure all standalone evidence routes
evidenceRouter.use(authMiddleware as any);

evidenceRouter.get('/:id', getEvidenceById as any);
evidenceRouter.get('/:id/access', getEvidenceAccessUrl as any);
evidenceRouter.delete('/:id', deleteEvidence as any);

export { evidenceRouter };
