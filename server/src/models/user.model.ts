import { Schema, model, type Document } from 'mongoose';
import type { UserRole } from '../types/user.js';

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      enum: ['user', 'admin'] satisfies UserRole[],
      default: 'user',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, returned) => {
        const { passwordHash: _passwordHash, _id, ...safeUser } = returned;
        return { ...safeUser, id: _id.toString() };
      },
    },
    toObject: {
      transform: (_document, returned) => {
        const { passwordHash: _passwordHash, _id, ...safeUser } = returned;
        return { ...safeUser, id: _id.toString() };
      },
    },
  },
);

export const UserModel = model<UserDocument>('User', userSchema);
