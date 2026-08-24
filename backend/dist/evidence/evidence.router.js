"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evidenceRouter = void 0;
const express_1 = require("express");
const evidence_controller_1 = require("./evidence.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const evidenceRouter = (0, express_1.Router)();
exports.evidenceRouter = evidenceRouter;
// Secure all standalone evidence routes
evidenceRouter.use(auth_middleware_1.authMiddleware);
evidenceRouter.get('/:id', evidence_controller_1.getEvidenceById);
evidenceRouter.get('/:id/access', evidence_controller_1.getEvidenceAccessUrl);
evidenceRouter.delete('/:id', evidence_controller_1.deleteEvidence);
