import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import { createTestServer } from './test-server';
import { generateToken } from '../src/utils/auth';

describe('Order GraphQL', () => {
  let mongoServer: MongoMemoryServer;
  let request: supertest.Agent;
  let userToken: string;
  let testUserId: string;
  let testBookId: string;

  jest.setTimeout(120000); // 120 seconds timeout for MongoDB setup

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const app = await createTestServer();
    request = supertest(app);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    const { Order } = await import('../src/models/Order');
    const { Book } = await import('../src/models/Book');
    const { User } = await import('../src/models/User');
    const { Author } = await import('../src/models/Author');

    await Order.deleteMany({});
    await Book.deleteMany({});
    await User.deleteMany({});
    await Author.deleteMany({});

    const testUser = await User.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Test User',
    });

    testUserId = testUser._id.toString();
    userToken = generateToken({
      userId: testUserId,
      email: testUser.email,
      role: 'USER',
    });

    const testAuthor = await Author.create({
      name: 'Test Author',
    });

    const testBook = await Book.create({
      title: 'Test Book',
      description: 'Test description',
      isbn: '1234567890123',
      price: 19.99,
      stock: 10,
      authorId: testAuthor._id,
    });

    testBookId = testBook._id.toString();
  });

  describe('createOrder mutation', () => {
    it('should create an order successfully', async () => {
      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            id
            items {
              bookId
              quantity
              price
            }
            totalAmount
            status
          }
        }
      `;

      const variables = {
        input: {
          items: [
            {
              bookId: testBookId,
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
      };

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.createOrder).toBeDefined();
      expect(res.body.data.createOrder.items.length).toBe(1);
      expect(res.body.data.createOrder.totalAmount).toBe(39.98);
      expect(res.body.data.createOrder.status).toBe('PENDING');
    });

    it('should update book stock after creating order', async () => {
      const { Book } = await import('../src/models/Book');
      const initialBook = await Book.findById(testBookId);
      const initialStock = initialBook!.stock;
      const quantity = 3;

      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            id
            items {
              bookId
              quantity
            }
          }
        }
      `;

      const variables = {
        input: {
          items: [
            {
              bookId: testBookId,
              quantity,
            },
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            zipCode: '10001',
            country: 'USA',
          },
        },
      };

      await request
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ query: mutation, variables });

      const updatedBook = await Book.findById(testBookId);
      expect(updatedBook?.stock).toBe(initialStock - quantity);
    });

    it('should throw error if insufficient stock', async () => {
      const mutation = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            id
            items {
              bookId
              quantity
            }
          }
        }
      `;

      const variables = {
        input: {
          items: [
            {
              bookId: testBookId,
              quantity: 100,
            },
          ],
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            zipCode: '10001',
            country: 'USA',
          },
        },
      };

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('stock');
    });
  });

  describe('myOrders query', () => {
    it('should return orders for the authenticated user', async () => {
      const { Order } = await import('../src/models/Order');
      const { Book } = await import('../src/models/Book');
      const { User } = await import('../src/models/User');

      const user = await User.findOne({ email: 'user@test.com' });
      const book = await Book.findById(testBookId);

      await Order.create({
        userId: user!._id,
        items: [{ bookId: book!._id, quantity: 1, price: book!.price }],
        totalAmount: book!.price,
        status: 'PENDING',
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          zipCode: '10001',
          country: 'USA',
        },
      });

      const query = `
        query {
          myOrders {
            id
            items {
              bookId
              quantity
            }
            totalAmount
            status
          }
        }
      `;

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ query });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.myOrders).toBeDefined();
      expect(res.body.data.myOrders.length).toBe(1);
    });
  });
});