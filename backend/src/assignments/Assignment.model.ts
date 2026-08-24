import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  orgId: mongoose.Types.ObjectId;
  assigneeId: mongoose.Types.ObjectId;
  assignedById: mongoose.Types.ObjectId;
  targetType: 'Incident' | 'Observation';
  targetId: mongoose.Types.ObjectId;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedById: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['Incident', 'Observation'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType', // Dynamically references target model
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      required: true,
      default: 'PENDING',
      index: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
