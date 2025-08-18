// src/config/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { nhost } from "d:/Chatbot-Application/src/config/nhost"  // <-- make sure you export default in nhost.ts

// HTTP link (queries + mutations)
const httpLink = createHttpLink({
  uri: `${nhost.graphql.getUrl()}`,
})

// Auth link → attach JWT token dynamically
const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// WebSocket link (subscriptions)
const wsLink = new GraphQLWsLink(
  createClient({
    url: nhost.graphql.getUrl().replace('http', 'ws'),
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken()
      return {
        headers: {
          authorization: token ? `Bearer ${token}` : '',
        },
      }
    },
  })
)

// Error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    })
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

// Split link: subscriptions use ws, others use http
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  from([errorLink, authLink, httpLink])
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
})