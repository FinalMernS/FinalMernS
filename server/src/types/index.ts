import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAuthor extends Document {
  _id: string;
  name: string;
  bio?: string;
  birthDate?: Date;
  nationality?: string;
  photo?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBook extends Document {
  _id: string;
  title: string;
  description: string;
  isbn: string;
  price: number;
  stock: number;
  coverImage?: string;
  publishedDate?: Date;
  authorId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  bookId: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  _id: string;
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}


