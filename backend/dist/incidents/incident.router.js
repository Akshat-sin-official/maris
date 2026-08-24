"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidentRouter = void 0;
const express_1 = require("express");
const incident_controller_1 = require("./incident.controller");
const evidence_controller_1 = require("../evidence/evidence.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const incidentRouter = (0, express_1.Router)();
exports.incidentRouter = incidentRouter;
// Secure all incident endpoints
incidentRouter.use(auth_middleware_1.authMiddleware);
incidentRouter.post('/', incident_controller_1.createIncident);
incidentRouter.get('/', incident_controller_1.getIncidents);
incidentRouter.get('/:id', incident_controller_1.getIncidentById);
incidentRouter.patch('/:id', incident_controller_1.updateIncident);
// Sub-resource endpoints
incidentRouter.get('/:id/timeline', incident_controller_1.getIncidentTimeline);
incidentRouter.post('/:id/evidence', upload_middleware_1.uploadMiddleware.single('file'), evidence_controller_1.createEvidenceForIncident);
incidentRouter.get('/:id/evidence', evidence_controller_1.getEvidenceForIncident);
