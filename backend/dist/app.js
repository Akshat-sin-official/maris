"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const error_middleware_1 = require("./middleware/error.middleware");
const errors_1 = require("./common/errors");
const auth_router_1 = require("./auth/auth.router");
const user_router_1 = require("./users/user.router");
const incident_router_1 = require("./incidents/incident.router");
const observation_router_1 = require("./observations/observation.router");
const evidence_router_1 = require("./evidence/evidence.router");
const sync_router_1 = require("./sync/sync.router");
const intelligence_router_1 = require("./intelligence/intelligence.router");
const agent_router_1 = require("./agents/agent.router");
const app = (0, express_1.default)();
exports.app = app;
// Standard middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // In production, this will be configured with specific domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// API v1 Router
const v1Router = express_1.default.Router();
// Mount Routes
v1Router.use('/auth', auth_router_1.authRouter);
v1Router.use('/users', user_router_1.userRouter);
v1Router.use('/incidents', incident_router_1.incidentRouter);
v1Router.use('/observations', observation_router_1.observationRouter);
v1Router.use('/evidence', evidence_router_1.evidenceRouter);
v1Router.use('/sync', sync_router_1.syncRouter);
v1Router.use('/intelligence', intelligence_router_1.intelligenceRouter);
v1Router.use('/ai', agent_router_1.agentRouter);
// Health Check Endpoint
v1Router.get('/health', (_req, res) => {
    const dbStatus = mongoose_1.default.connection.readyState;
    const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.status(200).json({
        status: 'success',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: {
            database: {
                status: dbStatus === 1 ? 'up' : 'down',
                state: dbStates[dbStatus] || 'unknown',
            },
            api: {
                status: 'up',
            },
        },
    });
});
app.use('/api/v1', v1Router);
// Handle unknown API endpoints
app.use((_req, _res, next) => {
    next(new errors_1.NotFoundError('The requested API resource does not exist'));
});
// Global error handler
app.use(error_middleware_1.errorMiddleware);
