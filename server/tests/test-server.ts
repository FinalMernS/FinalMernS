import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs } from '../src/schema/typeDefs';
import { resolvers } from '../src/resolvers';
import { createContext } from '../src/utils/context';

export async function createTestServer(): Promise<Application> {
  const app: Application = express();
  app.use(express.json());

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
  apolloServer.applyMiddleware({ app: app as any, path: '/graphql' });

  return app;
}