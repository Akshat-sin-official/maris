import express from 'express';
import {
  submitTip,
  trackTipStatus,
  listControlRoomTips,
  updateTipStatus,
  convertTipToIncident,
} from './tip.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const tipRouter = express.Router();

// Public routes (no authentication required for citizen submission or status tracking)
tipRouter.post('/submit', submitTip);
tipRouter.get('/track/:tipsterId', trackTipStatus);

const staffRoles = [
  'CONTROL_ROOM_OPERATOR',
  'CONTROL_ROOM',
  'SUPERVISOR',
  'RESEARCHER',
  'FIELD_OFFICER',
  'COASTAL_OFFICER',
  'ADMIN',
  'ORG_ADMIN',
];

// Protected Control Room routes (auth + RBAC required)
tipRouter.get('/control-room', authMiddleware, requireRole(...staffRoles), listControlRoomTips);
tipRouter.patch('/:id/status', authMiddleware, requireRole(...staffRoles), updateTipStatus);
tipRouter.post('/:id/convert-to-incident', authMiddleware, requireRole(...staffRoles), convertTipToIncident);

export { tipRouter };
