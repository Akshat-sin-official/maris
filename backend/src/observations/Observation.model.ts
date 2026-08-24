import mongoose, { Schema, Document } from 'mongoose';
import { LocationSchema, ILocation } from '../locations/Location.schema';

export interface IVerification {
  status: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
  verifiedBy: mongoose.Types.ObjectId | null;
  verifiedAt: Date | null;
  notes?: string;
}

export interface IObservation extends Document {
  orgId: mongoose.Types.ObjectId | null;
  observerId: mongoose.Types.ObjectId; // Identical to creatorId in most cases, but tracks field observer context
  creatorId: mongoose.Types.ObjectId;  // Tracks creation actor
  location: ILocation;
  category: 'sst' | 'chlorophyll' | 'vessel_sighting' | 'wildlife' | 'weather_hazard';
  value: string;
  confidence: number; // 0.0 to 1.0
  evidenceIds: mongoose.Types.ObjectId[];
  verification: IVerification;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED', 'REJECTED'],
      required: true,
      default: 'UNVERIFIED',
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
    },
  },
  { _id: false }
);

const ObservationSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    observerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    category: {
      type: String,
      enum: ['sst', 'chlorophyll', 'vessel_sighting', 'wildlife', 'weather_hazard'],
      required: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: [0.0, 'Confidence cannot be less than 0.0'],
      max: [1.0, 'Confidence cannot be greater than 1.0'],
    },
    evidenceIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Evidence' }],
      default: [],
    },
    verification: {
      type: VerificationSchema,
      default: () => ({ status: 'UNVERIFIED', verifiedBy: null, verifiedAt: null }),
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enable geospatial queries on observation point coordinates
ObservationSchema.index({ location: '2dsphere' });

export const Observation = mongoose.model<IObservation>('Observation', ObservationSchema);
