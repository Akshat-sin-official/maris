"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intelligenceRouter = void 0;
const express_1 = require("express");
const intelligence_controller_1 = require("./intelligence.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const intelligenceRouter = (0, express_1.Router)();
exports.intelligenceRouter = intelligenceRouter;
// Secure all intelligence endpoints
intelligenceRouter.use(auth_middleware_1.authMiddleware);
intelligenceRouter.get('/lookup', intelligence_controller_1.lookupByCoordinates);
intelligenceRouter.post('/analyze/:incidentId', intelligence_controller_1.analyzeIncident);
intelligenceRouter.get('/:incidentId', intelligence_controller_1.getAnalysis);
intelligenceRouter.get('/:incidentId/matches', intelligence_controller_1.getMatches);
intelligenceRouter.get('/:incidentId/explanation', intelligence_controller_1.getExplanation);
