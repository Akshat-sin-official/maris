import express from 'express';
import { submitTip, trackTipStatus, listControlRoomTips } from './tip.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const tipRouter = express.Router();

// Public routes (no auth required for citizen/tipster submission)
tipRouter.post('/submit', submitTip);
tipRouter.get('/track/:tipsterId', trackTipStatus);

// Internal staff routes (auth required)
tipRouter.get('/control-room', authMiddleware, listControlRoomTips);

export { tipRouter };
