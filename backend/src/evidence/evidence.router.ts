import { Router } from 'express';
import { getEvidenceById, deleteEvidence, getEvidenceAccessUrl, uploadStandaloneEvidence } from './evidence.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const evidenceRouter = Router();

// Secure all standalone evidence routes
evidenceRouter.use(authMiddleware as any);

evidenceRouter.post('/upload', uploadMiddleware.single('file'), uploadStandaloneEvidence as any);
evidenceRouter.get('/:id', getEvidenceById as any);
evidenceRouter.get('/:id/access', getEvidenceAccessUrl as any);
evidenceRouter.delete('/:id', deleteEvidence as any);

export { evidenceRouter };

