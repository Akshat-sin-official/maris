import mongoose, { Schema, Document } from 'mongoose';
import { LocationSchema, ILocation } from '../locations/Location.schema';

export interface IAlert extends Document {
  orgId: mongoose.Types.ObjectId | null;
  type: 'STORM' | 'OIL_SPILL' | 'SHELTER_ZONE_VIOLATION' | 'PFZ_CROSSING';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  area: ILocation;
  confidence: number; // 0.0 to 1.0
  evidenceStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  sources: string[]; // List of source sensors or reports
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema: Schema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['STORM', 'OIL_SPILL', 'SHELTER_ZONE_VIOLATION', 'PFZ_CROSSING'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      required: true,
      index: true,
    },
    area: {
      type: LocationSchema,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: [0.0, 'Confidence cannot be less than 0.0'],
      max: [1.0, 'Confidence cannot be greater than 1.0'],
    },
    evidenceStrength: {
      type: String,
      enum: ['WEAK', 'MODERATE', 'STRONG'],
      required: true,
    },
    sources: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enable geospatial operations on alert polygon boundaries
AlertSchema.index({ area: '2dsphere' });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
