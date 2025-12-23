import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/User';
import { authResolvers } from '../src/resolvers/auth';
import { generateToken } from '../src/utils/auth';
import { AppError, ErrorCode } from '../src/utils/errors';

describe('Auth Resolvers', () => {
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
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = await authResolvers.Mutation.register(null, { input }, undefined);

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(input.email);
      expect(result.user.name).toBe(input.name);
      expect(result.user.role).toBe('USER');
    });

    it('should throw error if email already exists', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Existing User',
      });

      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'New User',
      };

      await expect(authResolvers.Mutation.register(null, { input }, undefined)).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const input = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authResolvers.Mutation.login(null, { input }, undefined);

      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe(input.email);
    });

    it('should throw error with incorrect password', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const input = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(authResolvers.Mutation.login(null, { input }, undefined)).rejects.toThrow(AppError);
    });

    it('should throw error with non-existent email', async () => {
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(authResolvers.Mutation.login(null, { input }, undefined)).rejects.toThrow(AppError);
    });
  });

  describe('me', () => {
    it('should return user when authenticated', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const context = {
        user: {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
        },
      };

      const result = await authResolvers.Query.me(null, null, context as any);

      expect(result).toBeDefined();
      expect(result?.email).toBe(user.email);
    });

    it('should return null when not authenticated', async () => {
      const result = await authResolvers.Query.me(null, null, {} as any);
      expect(result).toBeNull();
    });
  });
});


