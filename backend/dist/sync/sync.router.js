"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncRouter = void 0;
const express_1 = require("express");
const sync_controller_1 = require("./sync.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const syncRouter = (0, express_1.Router)();
exports.syncRouter = syncRouter;
// Secure all sync endpoints
syncRouter.use(auth_middleware_1.authMiddleware);
syncRouter.post('/incident', sync_controller_1.syncSingleIncident);
syncRouter.post('/evidence', sync_controller_1.syncSingleEvidence);
syncRouter.post('/batch', sync_controller_1.syncBatch);
syncRouter.get('/status/:clientId', sync_controller_1.getSyncStatus);
