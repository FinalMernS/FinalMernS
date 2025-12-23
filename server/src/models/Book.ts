import mongoose, { Schema } from 'mongoose';
import { IBook } from '../types';

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      match: [/^(?:\d{10}|\d{13})$/, 'ISBN must be 10 or 13 digits'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    coverImage: {
      type: String,
    },
    publishedDate: {
      type: Date,
    },
    authorId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Author',
      required: [true, 'Author is required'],
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

bookSchema.index({ title: 1 });
// isbn index is automatically created by unique: true
bookSchema.index({ authorId: 1 });
bookSchema.index({ isDeleted: 1 });
bookSchema.index({ price: 1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);


