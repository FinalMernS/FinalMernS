import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const wsLink = typeof window !== 'undefined' 
  ? new WebSocketLink(
      new SubscriptionClient(
        process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql',
        {
          reconnect: true,
          connectionParams: () => {
            const token = localStorage.getItem('token');
            return token ? { authorization: `Bearer ${token}` } : {};
          },
        }
      )
    )
  : null;

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

