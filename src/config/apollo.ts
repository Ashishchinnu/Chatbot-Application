import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { nhost } from './nhost';

const httpLink = createHttpLink({
  uri: `https://${import.meta.env.VITE_NHOST_SUBDOMAIN || 'your-nhost-subdomain'}.nhost.run/v1/graphql`,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `wss://${import.meta.env.VITE_NHOST_SUBDOMAIN || 'your-nhost-subdomain'}.nhost.run/v1/graphql`,
    connectionParams: () => ({
      headers: {
        Authorization: `Bearer ${nhost.auth.getAccessToken()}`,
      },
    }),
  })
);

const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.error(`Network error: ${networkError}`);
  }
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink])
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});