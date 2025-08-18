// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { NhostProvider, useAuthenticationStatus } from '@nhost/react'
import { nhost } from './config/nhost'
import { apolloClient } from './config/apollo'

import ProtectedRoute from './components/auth/ProtectedRoute'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import { ChatApplication } from './components/ChatApplication'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />

      {/* Protected chat route */}
      <Route
        path="/"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ChatApplication />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <AppRoutes />
      </ApolloProvider>
    </NhostProvider>
  )
}