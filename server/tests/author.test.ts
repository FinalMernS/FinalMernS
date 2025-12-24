import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import { createTestServer } from './test-server';
import { generateToken } from '../src/utils/auth';

describe('Author GraphQL', () => {
  let mongoServer: MongoMemoryServer;
  let request: supertest.Agent;
  let adminToken: string;
  let userToken: string;

  jest.setTimeout(120000); // 120 seconds timeout for MongoDB setup

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const app = await createTestServer();
    request = supertest(app as any);

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

    // Create regular user and get token
    const regularUser = await User.create({
      email: 'user@test.com',
      password: 'password123',
      name: 'Regular User',
      role: 'USER',
    });

    userToken = generateToken({
      userId: regularUser._id.toString(),
      email: regularUser.email,
      role: regularUser.role,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    const { Author } = await import('../src/models/Author');
    await Author.deleteMany({});
  });

  describe('createAuthor mutation', () => {
    it('should create an author successfully', async () => {
      const mutation = `
        mutation CreateAuthor($input: CreateAuthorInput!) {
          createAuthor(input: $input) {
            id
            name
            bio
            nationality
          }
        }
      `;

      const variables = {
        input: {
          name: 'Test Author',
          bio: 'Test biography',
          nationality: 'American',
        },
      };

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.createAuthor).toBeDefined();
      expect(res.body.data.createAuthor.name).toBe(variables.input.name);
      expect(res.body.data.createAuthor.bio).toBe(variables.input.bio);
      expect(res.body.data.createAuthor.nationality).toBe(variables.input.nationality);
    });

    it('should require admin access', async () => {
      const mutation = `
        mutation CreateAuthor($input: CreateAuthorInput!) {
          createAuthor(input: $input) {
            id
            name
          }
        }
      `;

      const variables = {
        input: {
          name: 'Test Author',
        },
      };

      const res = await request
        .post('/graphql')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ query: mutation, variables });

      expect(res.status).toBe(200);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain('Admin');
    });
  });

  describe('authors query', () => {
    it('should return all non-deleted authors', async () => {
      const { Author } = await import('../src/models/Author');
      await Author.create({ name: 'Author 1' });
      await Author.create({ name: 'Author 2' });
      await Author.create({ name: 'Author 3', isDeleted: true });

      const query = `
        query {
          authors {
            id
            name
            isDeleted
          }
        }
      `;

      const res = await request
        .post('/graphql')
        .send({ query });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.authors).toBeDefined();
      expect(res.body.data.authors.length).toBe(2);
      expect(res.body.data.authors.every((a: any) => !a.isDeleted)).toBe(true);
    });
  });
});