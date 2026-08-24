"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentRouter = void 0;
const express_1 = require("express");
const agent_controller_1 = require("./agent.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const agentRouter = (0, express_1.Router)();
exports.agentRouter = agentRouter;
// Secure query endpoint under authentication
agentRouter.post('/query', auth_middleware_1.authMiddleware, agent_controller_1.queryAgenticAI);
