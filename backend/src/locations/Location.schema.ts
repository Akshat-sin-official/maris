import { Schema } from 'mongoose';

export interface ILocation {
  type: 'Point' | 'Polygon' | 'MultiPolygon';
  coordinates: number[] | number[][] | number[][][]; // Standard GeoJSON coordinate structures
}

export const LocationSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point', 'Polygon', 'MultiPolygon'],
      required: true,
    },
    coordinates: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: (value: any) => {
          // Simple validation: coordinates must be an array
          return Array.isArray(value);
        },
        message: 'Coordinates must be a valid array for GeoJSON geometries.',
      },
    },
  },
  { _id: false } // Embedded subdocuments do not need independent ObjectIDs
);
