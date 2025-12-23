import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Author } from '../src/models/Author';
import { authorResolvers } from '../src/resolvers/author';
import { AppError, ErrorCode } from '../src/utils/errors';

describe('Author Resolvers', () => {
  let mongoServer: MongoMemoryServer;
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
    await Author.deleteMany({});

    adminContext = {
      user: {
        userId: 'admin123',
        email: 'admin@test.com',
        role: 'ADMIN',
      },
    };
  });

  describe('createAuthor', () => {
    it('should create an author successfully', async () => {
      const input = {
        name: 'Test Author',
        bio: 'Test biography',
        nationality: 'American',
      };

      const result = await authorResolvers.Mutation.createAuthor(null, { input }, adminContext);

      expect(result.name).toBe(input.name);
      expect(result.bio).toBe(input.bio);
      expect(result.nationality).toBe(input.nationality);
    });

    it('should require admin access', async () => {
      const input = {
        name: 'Test Author',
      };

      const userContext = {
        user: {
          userId: 'user123',
          email: 'user@test.com',
          role: 'USER',
        },
      };

      await expect(authorResolvers.Mutation.createAuthor(null, { input }, userContext)).rejects.toThrow(AppError);
    });
  });

  describe('authors query', () => {
    it('should return all non-deleted authors', async () => {
      await Author.create({ name: 'Author 1' });
      await Author.create({ name: 'Author 2' });
      await Author.create({ name: 'Author 3', isDeleted: true });

      const result = await authorResolvers.Query.authors(null, {}, undefined);

      expect(result.length).toBe(2);
    });
  });
});


