import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Book } from '../src/models/Book';
import { Author } from '../src/models/Author';
import { bookResolvers } from '../src/resolvers/book';
import { AppError, ErrorCode } from '../src/utils/errors';

describe('Book Resolvers', () => {
  let mongoServer: MongoMemoryServer;
  let testAuthor: any;
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
    await Book.deleteMany({});
    await Author.deleteMany({});

    testAuthor = await Author.create({
      name: 'Test Author',
      bio: 'Test bio',
    });

    adminContext = {
      user: {
        userId: 'admin123',
        email: 'admin@test.com',
        role: 'ADMIN',
      },
    };
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const input = {
        title: 'Test Book',
        description: 'Test description for the book',
        isbn: '1234567890123',
        price: 19.99,
        stock: 10,
        authorId: testAuthor._id.toString(),
      };

      const result = await bookResolvers.Mutation.createBook(null, { input }, adminContext);

      expect(result).not.toBeNull();
      expect(result!.title).toBe(input.title);
      expect(result!.isbn).toBe(input.isbn);
      expect(result!.price).toBe(input.price);
    });

    it('should throw error if author not found', async () => {
      const input = {
        title: 'Test Book',
        description: 'Test description',
        isbn: '1234567890123',
        price: 19.99,
        stock: 10,
        authorId: '507f1f77bcf86cd799439011',
      };

      await expect(bookResolvers.Mutation.createBook(null, { input }, adminContext)).rejects.toThrow(AppError);
    });

    it('should throw error if ISBN already exists', async () => {
      await Book.create({
        title: 'Existing Book',
        description: 'Description',
        isbn: '1234567890123',
        price: 19.99,
        stock: 10,
        authorId: testAuthor._id,
      });

      const input = {
        title: 'New Book',
        description: 'Description',
        isbn: '1234567890123',
        price: 19.99,
        stock: 10,
        authorId: testAuthor._id.toString(),
      };

      await expect(bookResolvers.Mutation.createBook(null, { input }, adminContext)).rejects.toThrow(AppError);
    });
  });

  describe('books query', () => {
    it('should return all books', async () => {
      await Book.create({
        title: 'Book 1',
        description: 'Description 1',
        isbn: '1111111111111',
        price: 10,
        stock: 5,
        authorId: testAuthor._id,
      });

      await Book.create({
        title: 'Book 2',
        description: 'Description 2',
        isbn: '2222222222222',
        price: 20,
        stock: 10,
        authorId: testAuthor._id,
      });

      const result = await bookResolvers.Query.books(null, {}, undefined);

      expect(result.length).toBe(2);
    });

    it('should filter books by search term', async () => {
      await Book.create({
        title: 'Harry Potter',
        description: 'Magic book',
        isbn: '1111111111111',
        price: 10,
        stock: 5,
        authorId: testAuthor._id,
      });

      await Book.create({
        title: 'Lord of the Rings',
        description: 'Fantasy book',
        isbn: '2222222222222',
        price: 20,
        stock: 10,
        authorId: testAuthor._id,
      });

      const result = await bookResolvers.Query.books(null, { search: 'Harry' }, undefined);

      expect(result.length).toBe(1);
      expect(result[0].title).toContain('Harry');
    });
  });
});


