// src/config/apollo.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { NhostClient } from '@nhost/nhost-js'

// ---------------------------------------------------
// 1. Init Nhost Client (for auth)
// ---------------------------------------------------
export const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN,
  region: import.meta.env.VITE_NHOST_REGION,
})

// GraphQL Endpoints (only HTTP now)
const graphqlUrl =
  import.meta.env.VITE_GRAPHQL_URL ||
  `https://${import.meta.env.VITE_NHOST_SUBDOMAIN}.${import.meta.env.VITE_NHOST_REGION}.nhost.run/v1/graphql`

// ---------------------------------------------------
// 2. HTTP link for queries and mutations
// ---------------------------------------------------
const httpLink = createHttpLink({ uri: graphqlUrl })

// ---------------------------------------------------
// 3. Attach Nhost JWT to requests
// ---------------------------------------------------
const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  //console.log("Apollo is using JWT token:", token)
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }
})

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
    if (
      'statusCode' in networkError &&
      (networkError as any).statusCode === 401
    ) {
      console.log('Authentication error - user needs to re-login.')
      nhost.auth.signOut()
    }
  }
})

// ---------------------------------------------------
// 5. Create Apollo Client (HTTP only)
// ---------------------------------------------------
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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