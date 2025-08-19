// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { NhostProvider, useAuthenticationStatus } from '@nhost/react'
//import React from 'react'
import { nhost, apolloClient } from './config/apollo'


import ProtectedRoute from './components/auth/ProtectedRoute'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import { ChatApplication } from './components/ChatApplication'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  // React.useEffect(() => {
  //   const logJwt = async () => {
  //     if (isAuthenticated) {
  //       const token = await nhost.auth.getAccessToken()
  //       if (token) {
  //         console.log("Raw JWT:", token)
  //         // 🔑 Decode JWT payload
  //         const decoded = JSON.parse(atob(token.split('.')[1]))
  //         console.log("Decoded JWT:", decoded)
  //       } else {
  //         console.log("No JWT available yet")
  //       }
  //     }
  //   }
  //   logJwt()
  // }, [isAuthenticated])
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