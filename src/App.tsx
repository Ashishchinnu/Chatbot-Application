// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { NhostProvider } from '@nhost/react'

import {nhost} from './config/nhost'
import { apolloClient } from './config/apollo'

import ProtectedRoute from './components/auth/ProtectedRoute'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import { ChatApplication } from './components/ChatApplication'

export default function App() {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <Routes>
          {/* Public routes */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />

          {/* Protected chat route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ChatApplication />
              </ProtectedRoute>
            }
          />
        </Routes>
      </ApolloProvider>
    </NhostProvider>
  )
}