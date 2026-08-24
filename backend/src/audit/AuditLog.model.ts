import mongoose, { Schema, Document } from 'mongoose';

export type AuditEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'UNAUTHORIZED_ACCESS'
  | 'USER_CREATE'
  | 'USER_UPDATE';

export interface IAuditLog extends Document {
  eventType: AuditEventType;
  userId: mongoose.Types.ObjectId | null;
  actorEmail: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'LOGOUT',
      'TOKEN_REFRESH',
      'UNAUTHORIZED_ACCESS',
      'USER_CREATE',
      'USER_UPDATE',
    ],
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  actorEmail: {
    type: String,
    required: true,
    index: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  details: {
    type: Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
