"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errors_1 = require("../common/errors");
function generateToken(payload) {
    const options = {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
}
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw new errors_1.UnauthorizedError('Invalid or expired authentication token');
    }
}
