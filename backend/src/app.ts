import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { errorMiddleware } from './middleware/error.middleware';
import { NotFoundError } from './common/errors';
import { authRouter } from './auth/auth.router';
import { userRouter } from './users/user.router';
import { incidentRouter } from './incidents/incident.router';
import { observationRouter } from './observations/observation.router';
import { evidenceRouter } from './evidence/evidence.router';
import { syncRouter } from './sync/sync.router';
import { intelligenceRouter } from './intelligence/intelligence.router';
import { agentRouter } from './agents/agent.router';
import { tipRouter } from './incidents/tip.router';
import { reportRouter } from './reports/report.router';

import { logger } from './config/logger';

const app = express();

// Standard middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*', // In production, this will be configured with specific domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enterprise HTTP Request Logging Middleware
app.use((req, res, next) => {
  const start = performance.now();
  res.on('finish', () => {
    const duration = Math.round(performance.now() - start);
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    logger.http(`${method.padEnd(6)} ${url} ${statusCode} - ${duration}ms`);
  });
  next();
});

// API v1 Router
const v1Router = express.Router();

// Mount Routes
v1Router.use('/auth', authRouter);
v1Router.use('/users', userRouter);
v1Router.use('/incidents', incidentRouter);
v1Router.use('/observations', observationRouter);
v1Router.use('/evidence', evidenceRouter);
v1Router.use('/sync', syncRouter);
v1Router.use('/intelligence', intelligenceRouter);
v1Router.use('/ai', agentRouter);
v1Router.use('/tips', tipRouter);
v1Router.use('/reports', reportRouter);

// Health Check Endpoint
v1Router.get('/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState;
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
  next(new NotFoundError('The requested API resource does not exist'));
});

// Global error handler
app.use(errorMiddleware);

export { app };
