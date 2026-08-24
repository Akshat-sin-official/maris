"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observationRouter = void 0;
const express_1 = require("express");
const observation_controller_1 = require("./observation.controller");
const evidence_controller_1 = require("../evidence/evidence.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const observationRouter = (0, express_1.Router)();
exports.observationRouter = observationRouter;
// Secure all observation endpoints
observationRouter.use(auth_middleware_1.authMiddleware);
observationRouter.post('/', observation_controller_1.createObservation);
observationRouter.get('/', observation_controller_1.getObservations);
observationRouter.get('/:id', observation_controller_1.getObservationById);
observationRouter.patch('/:id', observation_controller_1.updateObservation);
// Evidence sub-resources
observationRouter.post('/:id/evidence', upload_middleware_1.uploadMiddleware.single('file'), evidence_controller_1.createEvidenceForObservation);
observationRouter.get('/:id/evidence', evidence_controller_1.getEvidenceForObservation);
