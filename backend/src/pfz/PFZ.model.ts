import mongoose, { Schema, Document } from 'mongoose';
import { LocationSchema, ILocation } from '../locations/Location.schema';

export interface IPFZ extends Document {
  area: ILocation;
  sstGradient: number; // Sea Surface Temperature gradient metric
  chlorophyllConcentration: number; // Chlorophyll content metric
  confidence: number; // 0.0 to 1.0
  validFrom: Date;
  validTo: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PFZSchema: Schema = new Schema(
  {
    area: {
      type: LocationSchema,
      required: true,
    },
    sstGradient: {
      type: Number,
      required: true,
    },
    chlorophyllConcentration: {
      type: Number,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: [0.0, 'Confidence cannot be less than 0.0'],
      max: [1.0, 'Confidence cannot be greater than 1.0'],
    },
    validFrom: {
      type: Date,
      required: true,
      index: true,
    },
    validTo: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enable geospatial queries on fishing zone polygon areas
PFZSchema.index({ area: '2dsphere' });

export const PFZ = mongoose.model<IPFZ>('PFZ', PFZSchema);
