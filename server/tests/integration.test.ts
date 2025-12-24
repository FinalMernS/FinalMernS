import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import { createTestServer } from './test-server';
import { generateToken } from '../src/utils/auth';

describe('Integration GraphQL Tests', () => {
  let mongoServer: MongoMemoryServer;
  let request: supertest.Agent;

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
    const { User } = await import('../src/models/User');
    const { Author } = await import('../src/models/Author');
    const { Book } = await import('../src/models/Book');
    const { Order } = await import('../src/models/Order');

    await User.deleteMany({});
    await Author.deleteMany({});
    await Book.deleteMany({});
    await Order.deleteMany({});
  });

  it('should create a complete order flow', async () => {
    // 1. Register a user
    const registerMutation = `
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          token
          user {
            id
            email
            name
            role
          }
        }
      }
    `;

    const registerRes = await request
      .post('/graphql')
      .send({
        query: registerMutation,
        variables: {
          input: {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
          },
        },
      });

    expect(registerRes.status).toBe(200);
    expect(registerRes.body.data.register).toBeDefined();
    expect(registerRes.body.data.register.token).toBeDefined();
    expect(registerRes.body.data.register.user.email).toBe('test@example.com');

    const userToken = registerRes.body.data.register.token;
    const userId = registerRes.body.data.register.user.id;

    // 2. Create an admin user and author
    const { User } = await import('../src/models/User');
    const { Author } = await import('../src/models/Author');

    const adminUser = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'ADMIN',
    });

    const adminToken = generateToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    const author = await Author.create({
      name: 'Test Author',
      bio: 'Test bio',
    });

    // 3. Create a book (admin)
    const createBookMutation = `
      mutation CreateBook($input: CreateBookInput!) {
        createBook(input: $input) {
          id
          title
          price
          stock
          author {
            id
            name
          }
        }
      }
    `;

    const bookRes = await request
      .post('/graphql')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: createBookMutation,
        variables: {
          input: {
            title: 'Test Book',
            description: 'Test description',
            isbn: '1234567890123',
            price: 19.99,
            stock: 10,
            authorId: author._id.toString(),
          },
        },
      });

    expect(bookRes.status).toBe(200);
    expect(bookRes.body.data.createBook).toBeDefined();
    expect(bookRes.body.data.createBook.title).toBe('Test Book');
    expect(bookRes.body.data.createBook.stock).toBe(10);

    const bookId = bookRes.body.data.createBook.id;

    // 4. Create an order (user)
    const createOrderMutation = `
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

    const orderRes = await request
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        query: createOrderMutation,
        variables: {
          input: {
            items: [
              {
                bookId: bookId,
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
      });

    expect(orderRes.status).toBe(200);
    expect(orderRes.body.data.createOrder).toBeDefined();
    expect(orderRes.body.data.createOrder.items.length).toBe(1);
    expect(orderRes.body.data.createOrder.totalAmount).toBe(39.98);
    expect(orderRes.body.data.createOrder.status).toBe('PENDING');

    // 5. Verify book stock was updated
    const bookQuery = `
      query Book($id: ID!) {
        book(id: $id) {
          id
          stock
        }
      }
    `;

    const bookQueryRes = await request
      .post('/graphql')
      .send({
        query: bookQuery,
        variables: { id: bookId },
      });

    expect(bookQueryRes.status).toBe(200);
    expect(bookQueryRes.body.data.book.stock).toBe(8);

    // 6. Get user orders
    const myOrdersQuery = `
      query {
        myOrders {
          id
          items {
            bookId
            quantity
          }
          totalAmount
        }
      }
    `;

    const ordersRes = await request
      .post('/graphql')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ query: myOrdersQuery });

    expect(ordersRes.status).toBe(200);
    expect(ordersRes.body.data.myOrders).toBeDefined();
    expect(ordersRes.body.data.myOrders.length).toBe(1);
    expect(ordersRes.body.data.myOrders[0].totalAmount).toBe(39.98);
  });
});