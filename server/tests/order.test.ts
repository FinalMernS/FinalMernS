import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Order } from '../src/models/Order';
import { Book } from '../src/models/Book';
import { User } from '../src/models/User';
import { Author } from '../src/models/Author';
import { orderResolvers } from '../src/resolvers/order';
import { AppError, ErrorCode } from '../src/utils/errors';

describe('Order Resolvers', () => {
  let mongoServer: MongoMemoryServer;
  let testUser: any;
  let testAuthor: any;
  let testBook: any;
  let userContext: any;
  let adminContext: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Order.deleteMany({});
    await Book.deleteMany({});
    await User.deleteMany({});
    await Author.deleteMany({});

    testUser = await User.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
    });

    testAuthor = await Author.create({
      name: 'Test Author',
    });

    testBook = await Book.create({
      title: 'Test Book',
      description: 'Test description',
      isbn: '1234567890123',
      price: 19.99,
      stock: 10,
      authorId: testAuthor._id,
    });

    userContext = {
      user: {
        userId: testUser._id.toString(),
        email: testUser.email,
        role: 'USER',
      },
    };

    adminContext = {
      user: {
        userId: 'admin123',
        email: 'admin@test.com',
        role: 'ADMIN',
      },
    };
  });

  describe('createOrder', () => {
    it('should create an order successfully', async () => {
      const input = {
        items: [
          {
            bookId: testBook._id.toString(),
            quantity: 2,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          country: 'USA',
        },
      };

      const result = await orderResolvers.Mutation.createOrder(null, { input }, userContext);

      expect(result).not.toBeNull();
      expect(result!.items.length).toBe(1);
      expect(result!.totalAmount).toBe(testBook.price * 2);
      expect(result!.status).toBe('PENDING');
    });

    it('should update book stock after creating order', async () => {
      const initialStock = testBook.stock;
      const quantity = 3;

      const input = {
        items: [
          {
            bookId: testBook._id.toString(),
            quantity,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          country: 'USA',
        },
      };

      await orderResolvers.Mutation.createOrder(null, { input }, userContext);

      const updatedBook = await Book.findById(testBook._id);
      expect(updatedBook?.stock).toBe(initialStock - quantity);
    });

    it('should throw error if insufficient stock', async () => {
      const input = {
        items: [
          {
            bookId: testBook._id.toString(),
            quantity: 100,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          country: 'USA',
        },
      };

      await expect(orderResolvers.Mutation.createOrder(null, { input }, userContext)).rejects.toThrow(AppError);
    });
  });

  describe('myOrders', () => {
    it('should return orders for the authenticated user', async () => {
      await Order.create({
        userId: testUser._id,
        items: [{ bookId: testBook._id, quantity: 1, price: testBook.price }],
        totalAmount: testBook.price,
        status: 'PENDING',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          country: 'USA',
        },
      });

      const result = await orderResolvers.Query.myOrders(null, null, userContext);

      expect(result.length).toBe(1);
    });
  });
});


