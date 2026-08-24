import mongoose, { Schema, Document } from 'mongoose';

export interface IPrioritySignal extends Document {
  ruleName: string;
  factor: string; // E.g., "sst_gradient", "storm_proximity"
  weight: number; // Multiplier or score adder
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrioritySignalSchema: Schema = new Schema(
  {
    ruleName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    factor: {
      type: String,
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PrioritySignal = mongoose.model<IPrioritySignal>('PrioritySignal', PrioritySignalSchema);
