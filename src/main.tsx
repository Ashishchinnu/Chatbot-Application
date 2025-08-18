// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { NhostProvider } from '@nhost/react'

import App from './App'
import './index.css'

import { apolloClient, nhost } from './config/apollo'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
  <ApolloProvider client={apolloClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ApolloProvider>
</NhostProvider>
  </React.StrictMode>
)