import mongoose, { Schema, Document } from 'mongoose';

export interface IHistoricalMatch extends Document {
  sourceIncidentId: mongoose.Types.ObjectId;
  matchedIncidentId: mongoose.Types.ObjectId;
  similarityScore: number; // 0.0 to 1.0
  matchingFeatures: string[]; // E.g., ["location", "vessel_type"]
  createdAt: Date;
  updatedAt: Date;
}

const HistoricalMatchSchema: Schema = new Schema(
  {
    sourceIncidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
      index: true,
    },
    matchedIncidentId: {
      type: Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
      index: true,
    },
    similarityScore: {
      type: Number,
      required: true,
      min: [0.0, 'Similarity score cannot be less than 0.0'],
      max: [1.0, 'Similarity score cannot be greater than 1.0'],
      index: true,
    },
    matchingFeatures: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HistoricalMatch = mongoose.model<IHistoricalMatch>('HistoricalMatch', HistoricalMatchSchema);
