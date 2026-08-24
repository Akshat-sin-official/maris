import mongoose, { Schema, Document } from 'mongoose';
import { LocationSchema, ILocation } from '../locations/Location.schema';

export interface IEvidence extends Document {
  orgId: mongoose.Types.ObjectId | null;
  uploadedBy: mongoose.Types.ObjectId;
  incidentId: mongoose.Types.ObjectId | null;
  observationId?: mongoose.Types.ObjectId | null;
  mediaType: 'image' | 'video' | 'audio';
  url: string;
  fileHash: string; // SHA-256 verification hash
  location?: ILocation;
  deviceMetadata?: Record<string, unknown>;
  capturedAt: Date;
  source: string;
  syncState: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';
  // Offline sync parameters
  clientId?: string | null;
  clientCreatedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema: Schema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
      index: true,
    },
    observationId: {
      type: Schema.Types.ObjectId,
      ref: 'Observation',
      default: null,
      index: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    location: {
      type: LocationSchema,
      default: null,
    },
    deviceMetadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    capturedAt: {
      type: Date,
      required: true,
    },
    source: {
      type: String,
      default: 'mobile_app',
    },
    // Offline sync definitions
    clientId: {
      type: String,
      default: null,
      index: {
        unique: true,
        sparse: true, // Prevents unique clashes on null values
      },
    },
    clientCreatedAt: {
      type: Date,
      default: null,
    },
    syncState: {
      type: String,
      enum: ['PENDING', 'SYNCING', 'SYNCED', 'FAILED', 'CONFLICT'],
      default: 'SYNCED',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Evidence = mongoose.model<IEvidence>('Evidence', EvidenceSchema);
