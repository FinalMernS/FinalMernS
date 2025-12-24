import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import { createTestServer } from './test-server';
import { generateToken } from '../src/utils/auth';

describe('Book GraphQL', () => {
  let mongoServer: MongoMemoryServer;
  let request: supertest.Agent;
  let adminToken: string;
  let testAuthorId: string;

  jest.setTimeout(120000); // 120 seconds timeout for MongoDB setup

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const app = await createTestServer();
    request = supertest(app);

    // Create admin user and get token
    const { User } = await import('../src/models/User');
    const adminUser = await User.create({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'ADMIN',
    });

    adminToken = generateToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    // Create test author
    const { Author } = await import('../src/models/Author');
    const author = await Author.create({
      name: 'Test Author',
      bio: 'Test bio',
    });
    testAuthorId = author._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    const { Book } = await import('../src/models/Book');
    const { Author } = await import('../src/models/Author');
    await Book.deleteMany({});
    await Author.deleteMany({});

    const author = await Author.create({
      name: 'Test Author',
      bio: 'Test bio',
    });
    testAuthorId = author._id.toString();
  });

  describe('createBook mutation', () => {
    it('should create a book successfully', async () => {
      const mutation = `
        mutation CreateBook($input: CreateBookInput!) {
          createBook(input: $input) {
            id
            title
            description
            isbn
            price
            stock
            author {
              id
              name
            }
          }
        }
      `;

      const variables = {
        input: {
          title: 'Test Book',
          description: 'Test description for the book',
          isbn: '1234567890123',
          price: 19.99,
          stock: 10,
          authorId: testAuthorId,
        },
      };

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.createBook).toBeDefined();
      expect(res.body.data.createBook.title).toBe(variables.input.title);
      expect(res.body.data.createBook.isbn).toBe(variables.input.isbn);
      expect(res.body.data.createBook.price).toBe(variables.input.price);
    });

    it('should throw error if author not found', async () => {
      const mutation = `
        mutation CreateBook($input: CreateBookInput!) {
          createBook(input: $input) {
            id
            title
          }
        }
      `;

      const variables = {
        input: {
          title: 'Test Book',
          description: 'Test description',
          isbn: '1234567890123',
          price: 19.99,
          stock: 10,
          authorId: '507f1f77bcf86cd799439011',
        },
      };

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('not found');
    });

    it('should throw error if ISBN already exists', async () => {
      const { Book } = await import('../src/models/Book');
      await Book.create({
        title: 'Existing Book',
        description: 'Description',
        isbn: '1234567890123',
        price: 19.99,
        stock: 10,
        authorId: testAuthorId,
      });

      const mutation = `
        mutation CreateBook($input: CreateBookInput!) {
          createBook(input: $input) {
            id
            title
          }
        }
      `;

      const variables = {
        input: {
          title: 'New Book',
          description: 'Description',
          isbn: '1234567890123',
          price: 19.99,
          stock: 10,
          authorId: testAuthorId,
        },
      };

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('ISBN');
    });
  });

  describe('books query', () => {
    it('should return all books', async () => {
      const { Book } = await import('../src/models/Book');
      await Book.create({
        title: 'Book 1',
        description: 'Description 1',
        isbn: '1111111111111',
        price: 10,
        stock: 5,
        authorId: testAuthorId,
      });

      await Book.create({
        title: 'Book 2',
        description: 'Description 2',
        isbn: '2222222222222',
        price: 20,
        stock: 10,
        authorId: testAuthorId,
      });

      const query = `
        query {
          books {
            id
            title
            price
          }
        }
      `;

      const res = await request
        .post('/graphql')
        .send({ query });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.books).toBeDefined();
      expect(res.body.data.books.length).toBe(2);
    });

    it('should filter books by search term', async () => {
      const { Book } = await import('../src/models/Book');
      await Book.create({
        title: 'Harry Potter',
        description: 'Magic book',
        isbn: '1111111111111',
        price: 10,
        stock: 5,
        authorId: testAuthorId,
      });

      await Book.create({
        title: 'Lord of the Rings',
        description: 'Fantasy book',
        isbn: '2222222222222',
        price: 20,
        stock: 10,
        authorId: testAuthorId,
      });

      const query = `
        query Books($search: String) {
          books(search: $search) {
            id
            title
          }
        }
      `;

      const res = await request
        .post('/graphql')
        .send({ query, variables: { search: 'Harry' } });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.books).toBeDefined();
      expect(res.body.data.books.length).toBe(1);
      expect(res.body.data.books[0].title).toContain('Harry');
    });
  });
});