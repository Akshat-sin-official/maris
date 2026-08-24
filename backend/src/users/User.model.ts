import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'CITIZEN' | 'TIPSTER' | 'FIELD_OFFICER' | 'CONTROL_ROOM' | 'SUPERVISOR' | 'ORG_ADMIN';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  orgId: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Do not fetch password hash in standard queries
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['CITIZEN', 'TIPSTER', 'FIELD_OFFICER', 'CONTROL_ROOM', 'SUPERVISOR', 'ORG_ADMIN'],
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      validate: {
        validator: function (this: IUser, val: mongoose.Types.ObjectId | null) {
          // orgId is required for staff roles, and must be null for CITIZEN and TIPSTER
          const citizenRoles: UserRole[] = ['CITIZEN', 'TIPSTER'];
          if (citizenRoles.includes(this.role)) {
            return val === null;
          }
          return val !== null;
        },
        message: 'Organization ID is required for staff roles and must be null for CITIZEN/TIPSTER roles.',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure passwordHash is never returned in JSON conversions
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
