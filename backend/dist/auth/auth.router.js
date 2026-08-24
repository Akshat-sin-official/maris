"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rate_limiter_middleware_1 = require("../middleware/rate-limiter.middleware");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
// Rate limiter: max 5 requests per 15 minutes for security-sensitive auth routes
const authLimit = (0, rate_limiter_middleware_1.rateLimiter)(15 * 60 * 1000, 5);
authRouter.post('/register', authLimit, auth_controller_1.register);
authRouter.post('/login', authLimit, auth_controller_1.login);
authRouter.post('/refresh', auth_controller_1.refresh);
authRouter.post('/logout', auth_controller_1.logout);
authRouter.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.getMe);
