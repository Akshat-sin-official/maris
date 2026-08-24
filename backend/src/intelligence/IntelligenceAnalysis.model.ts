import mongoose, { Schema, Document } from 'mongoose';

export interface IIntelligenceAnalysis extends Document {
  incidentId: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId | null;
  priorityScore: number;
  confidence: number;
  evidenceStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED';
  matchedIncidents: mongoose.Types.ObjectId[];
  matchedObservations: mongoose.Types.ObjectId[];
  prioritySignals: {
    ruleName: string;
    factor: string;
    weight: number;
    scoreContribution: number;
  }[];
  explanation: {
    summary: string;
    details: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const IntelligenceAnalysisSchema: Schema = new Schema(
  {
    incidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
      unique: true,
      index: true,
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    priorityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0.0,
      max: 1.0,
    },
    evidenceStrength: {
      type: String,
      enum: ['WEAK', 'MODERATE', 'STRONG'],
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED', 'REJECTED'],
      default: 'UNVERIFIED',
      index: true,
    },
    matchedIncidents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Incident',
      },
    ],
    matchedObservations: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Observation',
      },
    ],
    prioritySignals: [
      {
        ruleName: { type: String, required: true },
        factor: { type: String, required: true },
        weight: { type: Number, required: true },
        scoreContribution: { type: Number, required: true },
      },
    ],
    explanation: {
      summary: { type: String, required: true },
      details: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
  }
);

export const IntelligenceAnalysis = mongoose.model<IIntelligenceAnalysis>(
  'IntelligenceAnalysis',
  IntelligenceAnalysisSchema
);
