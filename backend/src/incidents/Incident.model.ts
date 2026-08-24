import mongoose, { Schema, Document } from 'mongoose';
import { LocationSchema, ILocation } from '../locations/Location.schema';

export interface IIncidentItem {
  type: 'vessel_detection' | 'oil_slick' | 'unauthorized_entry' | 'marine_life_hazard';
  location: ILocation;
  detectedAt: Date;
  details?: Record<string, unknown>;
}

export type IncidentStatus =
  | 'RECEIVED'
  | 'SCREENING'
  | 'PRIORITIZED'
  | 'ASSIGNED'
  | 'UNDER_VERIFICATION'
  | 'VERIFIED'
  | 'ACTIONED'
  | 'CLOSED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'ON_HOLD'
  | 'ESCALATED';

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SyncState = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT';

export type TimelineEventType =
  | 'EVIDENCE_CAPTURED'
  | 'LOCATION_RECORDED'
  | 'INCIDENT_CREATED'
  | 'SAVED_OFFLINE'
  | 'SYNC_STARTED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'AI_ANALYSIS_STARTED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'MATCHES_FOUND'
  | 'PRIORITY_ASSIGNED'
  | 'CASE_ASSIGNED'
  | 'VERIFICATION_STARTED'
  | 'VERIFICATION_COMPLETED'
  | 'STATUS_CHANGED'
  | 'RESPONSE_UPDATED'
  | 'CASE_CLOSED';

export interface ITimelineEvent {
  eventType: TimelineEventType;
  actorId: mongoose.Types.ObjectId;
  message: string;
  timestamp: Date;
}

export interface IIncident extends Document {
  orgId: mongoose.Types.ObjectId | null;
  creatorId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  assignedTo: mongoose.Types.ObjectId | null;
  items: IIncidentItem[];
  timeline: ITimelineEvent[];
  // Offline sync parameters
  clientId?: string | null;
  clientCreatedAt?: Date | null;
  syncState: SyncState;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentItemSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['vessel_detection', 'oil_slick', 'unauthorized_entry', 'marine_life_hazard'],
      required: true,
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    detectedAt: {
      type: Date,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const TimelineEventSchema = new Schema(
  {
    eventType: {
      type: String,
      enum: [
        'EVIDENCE_CAPTURED',
        'LOCATION_RECORDED',
        'INCIDENT_CREATED',
        'SAVED_OFFLINE',
        'SYNC_STARTED',
        'SYNC_COMPLETED',
        'SYNC_FAILED',
        'AI_ANALYSIS_STARTED',
        'AI_ANALYSIS_COMPLETED',
        'MATCHES_FOUND',
        'PRIORITY_ASSIGNED',
        'CASE_ASSIGNED',
        'VERIFICATION_STARTED',
        'VERIFICATION_COMPLETED',
        'STATUS_CHANGED',
        'RESPONSE_UPDATED',
        'CASE_CLOSED',
      ],
      required: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const IncidentSchema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'RECEIVED',
        'SCREENING',
        'PRIORITIZED',
        'ASSIGNED',
        'UNDER_VERIFICATION',
        'VERIFIED',
        'ACTIONED',
        'CLOSED',
        'REJECTED',
        'DUPLICATE',
        'ON_HOLD',
        'ESCALATED',
      ],
      required: true,
      default: 'RECEIVED',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      default: 'LOW',
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    items: {
      type: [IncidentItemSchema],
      default: [],
    },
    timeline: {
      type: [TimelineEventSchema],
      default: [],
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

IncidentSchema.index({ 'items.location': '2dsphere' });

export const Incident = mongoose.model<IIncident>('Incident', IncidentSchema);
