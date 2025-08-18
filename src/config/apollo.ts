import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { supabase } from './supabase'

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8080/v1/graphql'
const graphqlWsUrl = import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:8080/v1/graphql'
const adminSecret = import.meta.env.VITE_HASURA_ADMIN_SECRET

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: graphqlUrl,
})

// Auth link to attach JWT token and required headers
const authLink = setContext(async (_, { headers }) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  const userId = session?.user?.id

  return {
    headers: {
      ...headers,
      ...(token && {
        'Authorization': `Bearer ${token}`,
        'x-hasura-user-id': userId,
        'x-hasura-default-role': 'user',
        'x-hasura-allowed-roles': '["user"]',
      }),
      ...(adminSecret && { 'x-hasura-admin-secret': adminSecret }),
      'Content-Type': 'application/json',
    },
  }
})

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: graphqlWsUrl,
    connectionParams: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const userId = session?.user?.id

      return {
        headers: {
          ...(token && {
            'Authorization': `Bearer ${token}`,
            'x-hasura-user-id': userId,
            'x-hasura-default-role': 'user',
            'x-hasura-allowed-roles': '["user"]',
          }),
          ...(adminSecret && { 'x-hasura-admin-secret': adminSecret }),
        },
      }
    },
  })
)

// Error handling
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    })
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
    
    // Handle authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      // Redirect to login or refresh token
      console.log('Authentication error - redirecting to login')
    }
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
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          chats: {
            merge(existing = [], incoming) {
              return incoming
            }
          },
          messages: {
            merge(existing = [], incoming) {
              return incoming
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: { 
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network'
    },
    query: { 
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    },
  },
})