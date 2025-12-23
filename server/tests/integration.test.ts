import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import { Author } from '../src/models/Author';
import { Book } from '../src/models/Book';
import { Order } from '../src/models/Order';
import { authResolvers } from '../src/resolvers/auth';
import { bookResolvers } from '../src/resolvers/book';
import { orderResolvers } from '../src/resolvers/order';

describe('Integration Tests', () => {
  let mongoServer: MongoMemoryServer;

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
    await User.deleteMany({});
    await Author.deleteMany({});
    await Book.deleteMany({});
    await Order.deleteMany({});
  });

  it('should create a complete order flow', async () => {
    // 1. Register a user
    const registerResult = await authResolvers.Mutation.register(
      null,
      {
        input: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      },
      undefined
    );

    expect(registerResult.user).toBeDefined();
    expect(registerResult.token).toBeDefined();

    const userContext = {
      user: {
        userId: registerResult.user._id.toString(),
        email: registerResult.user.email,
        role: registerResult.user.role,
      },
    };

    const adminContext = {
      user: {
        userId: 'admin123',
        email: 'admin@test.com',
        role: 'ADMIN',
      },
    };

    // 2. Create an author (admin)
    const author = await Author.create({
      name: 'Test Author',
      bio: 'Test bio',
    });

    // 3. Create a book (admin)
    const bookResult = await bookResolvers.Mutation.createBook(
      null,
      {
        input: {
          title: 'Test Book',
          description: 'Test description',
          isbn: '1234567890123',
          price: 19.99,
          stock: 10,
          authorId: author._id.toString(),
        },
      },
      adminContext
    );

    expect(bookResult).not.toBeNull();
    expect(bookResult!.title).toBe('Test Book');

    // 4. Create an order (user)
    const orderResult = await orderResolvers.Mutation.createOrder(
      null,
      {
        input: {
          items: [
            {
              bookId: bookResult!._id.toString(),
              quantity: 2,
            },
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            zipCode: '10001',
            country: 'USA',
          },
        },
      },
      userContext
    );

    expect(orderResult).not.toBeNull();
    expect(orderResult!.items.length).toBe(1);
    expect(orderResult!.totalAmount).toBe(19.99 * 2);

    // 5. Verify book stock was updated
    const updatedBook = await Book.findById(bookResult!._id);
    expect(updatedBook?.stock).toBe(8);

    // 6. Get user orders
    const orders = await orderResolvers.Query.myOrders(null, null, userContext);
    expect(orders.length).toBe(1);
    expect(orders[0]._id.toString()).toBe(orderResult!._id.toString());
  });
});


