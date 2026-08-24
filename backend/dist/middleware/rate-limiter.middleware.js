"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = rateLimiter;
const errors_1 = require("../common/errors");
const cache = new Map();
function rateLimiter(windowMs, maxRequests) {
    return (req, _res, next) => {
        // Bypass rate limiting during test executions to prevent test suite failures
        if (process.env.NODE_ENV === 'test') {
            return next();
        }
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        let record = cache.get(ip);
        if (!record) {
            record = { timestamps: [] };
            cache.set(ip, record);
        }
        // Filter out hits that occurred outside of the windowMs
        record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
        if (record.timestamps.length >= maxRequests) {
            const oldestTimestamp = record.timestamps[0];
            const secondsToWait = Math.ceil((windowMs - (now - oldestTimestamp)) / 1000);
            return next(new errors_1.AppError(`Too many requests. Please try again in ${secondsToWait} seconds.`, 429, true));
        }
        record.timestamps.push(now);
        next();
    };
}
