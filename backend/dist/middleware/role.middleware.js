"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = roleMiddleware;
const errors_1 = require("../common/errors");
function roleMiddleware(allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errors_1.ForbiddenError('Access denied: user context missing'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errors_1.ForbiddenError('Access denied: insufficient permissions'));
        }
        next();
    };
}
