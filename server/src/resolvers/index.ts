import { authResolvers } from './auth';
import { authorResolvers } from './author';
import { bookResolvers } from './book';
import { orderResolvers } from './order';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...authorResolvers.Query,
    ...bookResolvers.Query,
    ...orderResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...authorResolvers.Mutation,
    ...bookResolvers.Mutation,
    ...orderResolvers.Mutation,
  },
  Subscription: {
    ...bookResolvers.Subscription,
    ...orderResolvers.Subscription,
  },
  Book: {
    ...bookResolvers.Book,
  },
  Order: {
    ...orderResolvers.Order,
  },
  OrderItem: {
    ...orderResolvers.OrderItem,
  },
};


