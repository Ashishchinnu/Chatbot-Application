import { ApolloClient, InMemoryCache, createHttpLink, split, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { supabase } from './supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: `${supabaseUrl}/graphql/v1`,
})

// Auth link to attach JWT token
const authLink = setContext(async (_, { headers }) => {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
  }
})

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: `${supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://')}/graphql/v1`,
    connectionParams: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      return {
        headers: {
          authorization: token ? `Bearer ${token}` : `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
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