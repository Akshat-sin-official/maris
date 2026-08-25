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

// Protected Control Room routes (auth + RBAC required: CONTROL_ROOM_OPERATOR or ADMIN)
tipRouter.get('/control-room', authMiddleware, requireRole('CONTROL_ROOM_OPERATOR', 'ADMIN'), listControlRoomTips);
tipRouter.patch('/:id/status', authMiddleware, requireRole('CONTROL_ROOM_OPERATOR', 'ADMIN'), updateTipStatus);
tipRouter.post('/:id/convert-to-incident', authMiddleware, requireRole('CONTROL_ROOM_OPERATOR', 'ADMIN'), convertTipToIncident);

export { tipRouter };
