import { Document, Types } from 'mongoose';



export interface IUser extends Document {
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
  title: string;
  description: string;
  isbn: string;
  price: number;
  stock: number;
  coverImage?: string;
  publishedDate?: Date;

  authorId: Types.ObjectId;   
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}



export interface IOrderItem {
  bookId: Types.ObjectId;     
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;     
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
  userId: string; // ✅ JWT-та string болады
  email: string;
  role: 'USER' | 'ADMIN';
}
