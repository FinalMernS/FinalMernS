import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import { createTestServer } from './test-server';

describe('Auth GraphQL', () => {
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
    await User.deleteMany({});
  });

  describe('register mutation', () => {
    it('should register a new user successfully', async () => {
      const mutation = `
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

      const variables = {
        input: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        },
      };

      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.register).toBeDefined();
      expect(res.body.data.register.token).toBeDefined();
      expect(res.body.data.register.user.email).toBe(variables.input.email);
      expect(res.body.data.register.user.name).toBe(variables.input.name);
      expect(res.body.data.register.user.role).toBe('USER');
    });

    it('should throw error if email already exists', async () => {
      const { User } = await import('../src/models/User');
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Existing User',
      });

      const mutation = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              id
              email
              name
            }
          }
        }
      `;

      const variables = {
        input: {
          email: 'test@example.com',
          password: 'password123',
          name: 'New User',
        },
      };

      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('already exists');
    });
  });

  describe('login mutation', () => {
    it('should login successfully with correct credentials', async () => {
      const { User } = await import('../src/models/User');
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              email
              name
            }
          }
        }
      `;

      const variables = {
        input: {
          email: 'test@example.com',
          password: 'password123',
        },
      };

      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.login).toBeDefined();
      expect(res.body.data.login.token).toBeDefined();
      expect(res.body.data.login.user.email).toBe(variables.input.email);
    });

    it('should throw error with incorrect password', async () => {
      const { User } = await import('../src/models/User');
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              email
            }
          }
        }
      `;

      const variables = {
        input: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      };

      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('Invalid');
    });

    it('should throw error with non-existent email', async () => {
      const mutation = `
        mutation Login($input: LoginInput!) {
          login(input: $input) {
            token
            user {
              id
              email
            }
          }
        }
      `;

      const variables = {
        input: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      };

      const res = await request
        .post('/graphql')
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('me query', () => {
    it('should return user when authenticated', async () => {
      const { User } = await import('../src/models/User');
      const { generateToken } = await import('../src/utils/auth');
      
      const user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      const query = `
        query {
          me {
            id
            email
            name
            role
          }
        }
      `;

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${token}`)
        .send({ query });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.me).toBeDefined();
      expect(res.body.data.me.email).toBe(user.email);
    });

    it('should return null when not authenticated', async () => {
      const query = `
        query {
          me {
            id
            email
            name
          }
        }
      `;

      const res = await request
        .post('/graphql')
        .send({ query });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.me).toBeNull();
    });
  });
});