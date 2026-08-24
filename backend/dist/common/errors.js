"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.DatabaseError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    details;
    constructor(message, statusCode, isOperational = true, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, details) {
        super(message, 400, true, details);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401, true);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden access') {
        super(message, 403, true);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404, true);
    }
}
exports.NotFoundError = NotFoundError;
class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', details) {
        super(message, 500, true, details);
    }
}
exports.DatabaseError = DatabaseError;
class ConflictError extends AppError {
    constructor(message = 'Conflict detected', details) {
        super(message, 409, true, details);
    }
}
exports.ConflictError = ConflictError;
