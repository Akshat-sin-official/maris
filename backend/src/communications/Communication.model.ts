import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunication extends Document {
  orgId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId | null; // Null for channel/group broadcasts
  channel: string; // E.g., "incident-123", "org-general"
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationSchema: Schema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Communication = mongoose.model<ICommunication>('Communication', CommunicationSchema);
