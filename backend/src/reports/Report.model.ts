import mongoose, { Schema, Document } from 'mongoose';

export type ReportCategory =
  | 'BIODIVERSITY_ASSESSMENT'
  | 'PFZ_ADVISORY'
  | 'SPECIES_MIGRATION'
  | 'POLLUTION_DRIFT'
  | 'ILLEGAL_TRAWLING'
  | 'CLIMATE_IMPACT';

export type ReportStatus = 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface IReport extends Document {
  reportId: string;
  title: string;
  category: ReportCategory;
  author: string;
  authorId: mongoose.Types.ObjectId;
  abstract: string;
  content: string;
  region: string;
  status: ReportStatus;
  tags: string[];
  downloadsCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'BIODIVERSITY_ASSESSMENT',
        'PFZ_ADVISORY',
        'SPECIES_MIGRATION',
        'POLLUTION_DRIFT',
        'ILLEGAL_TRAWLING',
        'CLIMATE_IMPACT',
      ],
      default: 'BIODIVERSITY_ASSESSMENT',
    },
    author: {
      type: String,
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    abstract: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      default: 'Gulf of Mannar EEZ Sector',
    },
    status: {
      type: String,
      enum: ['DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'ARCHIVED'],
      default: 'DRAFT',
    },
    tags: [String],
    downloadsCount: {
      type: Number,
      default: 0,
    },
    publishedAt: Date,
  },
  { timestamps: true }
);

export const Report = mongoose.model<IReport>('Report', ReportSchema);
