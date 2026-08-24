import { Router } from 'express';
import { createIncident, getIncidents, getIncidentById, updateIncident, getIncidentTimeline } from './incident.controller';
import { createEvidenceForIncident, getEvidenceForIncident } from '../evidence/evidence.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const incidentRouter = Router();

// Secure all incident endpoints
incidentRouter.use(authMiddleware as any);

incidentRouter.post('/', createIncident as any);
incidentRouter.get('/', getIncidents as any);
incidentRouter.get('/:id', getIncidentById as any);
incidentRouter.patch('/:id', updateIncident as any);

// Sub-resource endpoints
incidentRouter.get('/:id/timeline', getIncidentTimeline as any);
incidentRouter.post('/:id/evidence', uploadMiddleware.single('file'), createEvidenceForIncident as any);
incidentRouter.get('/:id/evidence', getEvidenceForIncident as any);

export { incidentRouter };
