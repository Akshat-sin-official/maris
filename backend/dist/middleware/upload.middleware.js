"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const errors_1 = require("../common/errors");
const env_1 = require("../config/env");
const storage = multer_1.default.memoryStorage();
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
];
function fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(new errors_1.ValidationError(`MIME type '${file.mimetype}' is not supported.`));
    }
    callback(null, true);
}
// Multer supports limits. We'll set a generous maximum buffer limit of 50MB,
// but we will validate individual files inside the controller or middleware dynamically using env configurations.
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: Math.max(env_1.env.MAX_IMAGE_SIZE_MB, env_1.env.MAX_VIDEO_SIZE_MB) * 1024 * 1024,
    }
});
