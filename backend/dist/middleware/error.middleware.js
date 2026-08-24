"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const errors_1 = require("../common/errors");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const zod_1 = require("zod");
function errorMiddleware(err, _req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = undefined;
    let isOperational = err instanceof errors_1.AppError ? err.isOperational : false;
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
        details = err.details;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Request validation failed';
        isOperational = true;
        details = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
    }
    if (!isOperational) {
        logger_1.logger.error(`Non-operational system error: ${err.message}`, err);
    }
    else {
        logger_1.logger.warn(`Operational error: ${err.message}`);
    }
    res.status(statusCode).json({
        status: 'error',
        message,
        ...(details !== undefined && { details }),
        ...(env_1.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}
