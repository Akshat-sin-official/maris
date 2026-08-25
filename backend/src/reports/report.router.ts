import { Router } from 'express';
import {
  listReports,
  getReportById,
  createReport,
  updateReport,
  publishReport,
  deleteReport,
} from './report.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const reportRouter = Router();

// Apply global auth check
reportRouter.use(authMiddleware as any);

reportRouter.get('/', listReports as any);
reportRouter.get('/:id', getReportById as any);

// Protected Authoring & Publishing endpoints for Researchers / Admins / Operators
const authorRoles = ['RESEARCHER', 'SUPERVISOR', 'ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM'];

reportRouter.post('/', requireRole(...authorRoles) as any, createReport as any);
reportRouter.patch('/:id', requireRole(...authorRoles) as any, updateReport as any);
reportRouter.patch('/:id/publish', requireRole(...authorRoles) as any, publishReport as any);
reportRouter.delete('/:id', requireRole(...authorRoles) as any, deleteReport as any);

export { reportRouter };
