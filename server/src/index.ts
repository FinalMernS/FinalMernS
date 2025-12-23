import express from 'express';
import { createServer } from 'http';
import { ApolloServer } from 'apollo-server-express';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './resolvers';
import { createContext } from './utils/context';

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookstore';

async function startServer() {
  const app = express();

  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://studio.apollographql.com'],
    credentials: true,
  }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: createContext,
    introspection: true,
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  const httpServer = createServer(app);

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: async (connectionParams: any) => {
        const token = connectionParams?.authorization?.replace('Bearer ', '');
        if (token) {
          try {
            const { verifyToken } = await import('./utils/auth');
            const payload = verifyToken(token);
            return { user: payload };
          } catch (error) {
            return {};
          }
        }
        return {};
      },
    },
    {
      server: httpServer,
      path: apolloServer.graphqlPath,
    }
  );

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});

