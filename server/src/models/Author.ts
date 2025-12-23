import mongoose, { Schema } from 'mongoose';
import { IAuthor } from '../types';

const authorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      minlength: [2, 'Author name must be at least 2 characters'],
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    birthDate: {
      type: Date,
    },
    nationality: {
      type: String,
      trim: true,
      maxlength: [50, 'Nationality cannot exceed 50 characters'],
    },
    photo: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

authorSchema.index({ name: 1 });
authorSchema.index({ isDeleted: 1 });

export const Author = mongoose.model<IAuthor>('Author', authorSchema);


