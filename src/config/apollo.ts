// src/config/apollo.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { NhostClient } from '@nhost/nhost-js'

// ---------------------------------------------------
// 1. Init Nhost Client
// ---------------------------------------------------
export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
})

// GraphQL Endpoints
const graphqlUrl =
  import.meta.env.VITE_GRAPHQL_URL ||
  `https://${import.meta.env.VITE_NHOST_SUBDOMAIN}.${import.meta.env.VITE_NHOST_REGION}.nhost.run/v1/graphql`

const graphqlWsUrl =
  import.meta.env.VITE_GRAPHQL_WS_URL ||
  `wss://${import.meta.env.VITE_NHOST_SUBDOMAIN}.${import.meta.env.VITE_NHOST_REGION}.nhost.run/v1/graphql`

// ---------------------------------------------------
// 2. HTTP link for queries and mutations
// ---------------------------------------------------
const httpLink = createHttpLink({ uri: graphqlUrl })

// Attach Nhost JWT
const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

// ---------------------------------------------------
// 3. WebSocket link for subscriptions
// ---------------------------------------------------
// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: graphqlWsUrl,
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken()
      return {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    },
    lazy: true,
    retryAttempts: 5,
  })
)

// ---------------------------------------------------
// 4. Error Handling
// ---------------------------------------------------
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    })
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
    if ('statusCode' in networkError && (networkError as any).statusCode === 401) {
      console.log('Authentication error - user needs to re-login.')
      nhost.auth.signOut()
    }
  }
})

// ---------------------------------------------------
// 5. Split link: use ws for subscriptions, http for others
// ---------------------------------------------------
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  from([errorLink, authLink, httpLink])
)

// ---------------------------------------------------
// 6. Create Apollo Client
// ---------------------------------------------------
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            merge(_, incoming) {
              return incoming
            },
          },
          messages: {
            merge(_, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
})