"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_utils_1 = require("../auth/jwt.utils");
const errors_1 = require("../common/errors");
function authMiddleware(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errors_1.UnauthorizedError('Access token is missing or invalid'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_utils_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        next(error);
    }
}
