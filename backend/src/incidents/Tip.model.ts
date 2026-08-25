import mongoose, { Schema, Document } from 'mongoose';
import { LocationSchema, ILocation } from '../locations/Location.schema';

export type TipCategory =
  | 'ILLEGAL_FISHING'
  | 'WILDLIFE_TRAFFICKING'
  | 'POLLUTION'
  | 'SUSPICIOUS_VESSEL'
  | 'SANCTUARY_BREACH'
  | 'OTHER';

export type TipVerificationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'ACTIONED';

export type DistractionRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ITipEvidence {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  capturedAt?: Date;
  fileHash?: string;
}

export interface ITip extends Document {
  tipsterId: string; // 10-digit pseudonymous ID (e.g. TIP-8492019482)
  category: TipCategory;
  title: string;
  description: string;
  location: ILocation;
  reportedAt: Date;
  evidence: ITipEvidence[];
  
  // Multi-factor Genuineness Verification Metrics
  genuinenessScore: number; // 0 to 100
  distractionRisk: DistractionRiskLevel;
  verificationFactors: {
    spatialCorrelation: number; // 0-30
    historicalPatternMatch: number; // 0-30
    mediaProvenanceScore: number; // 0-20
    marineWeatherFeasibility: number; // 0-20
  };
  whyFlagged: string[];
  suggestedVerification: string[];
  
  // Background Security & System Provenance Metadata
  clientMetadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceType?: string;
    browser?: string;
    os?: string;
    screenResolution?: string;
    language?: string;
    timezone?: string;
  };

  status: TipVerificationStatus;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema = new Schema<ITip>(
  {
    tipsterId: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        'ILLEGAL_FISHING',
        'WILDLIFE_TRAFFICKING',
        'POLLUTION',
        'SUSPICIOUS_VESSEL',
        'SANCTUARY_BREACH',
        'OTHER',
      ],
      default: 'SUSPICIOUS_VESSEL',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: LocationSchema,
      required: true,
      index: '2dsphere',
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    evidence: [
      {
        id: String,
        type: { type: String, enum: ['image', 'video', 'audio', 'document'] },
        url: String,
        capturedAt: Date,
        fileHash: String,
      },
    ],
    genuinenessScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    distractionRisk: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'LOW',
    },
    verificationFactors: {
      spatialCorrelation: { type: Number, default: 15 },
      historicalPatternMatch: { type: Number, default: 15 },
      mediaProvenanceScore: { type: Number, default: 10 },
      marineWeatherFeasibility: { type: Number, default: 10 },
    },
    whyFlagged: [String],
    suggestedVerification: [String],
    clientMetadata: {
      ipAddress: String,
      userAgent: String,
      deviceType: String,
      browser: String,
      os: String,
      screenResolution: String,
      language: String,
      timezone: String,
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'ACTIONED'],
      default: 'SUBMITTED',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    reviewNotes: String,
  },
  {
    timestamps: true,
  }
);

export const Tip = mongoose.model<ITip>('Tip', TipSchema);
