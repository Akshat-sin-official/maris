"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.LocationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['Point', 'Polygon', 'MultiPolygon'],
        required: true,
    },
    coordinates: {
        type: mongoose_1.Schema.Types.Mixed,
        required: true,
        validate: {
            validator: (value) => {
                // Simple validation: coordinates must be an array
                return Array.isArray(value);
            },
            message: 'Coordinates must be a valid array for GeoJSON geometries.',
        },
    },
}, { _id: false } // Embedded subdocuments do not need independent ObjectIDs
);
