import { Routes, Route } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { useEffect, useState } from 'react'
import { supabase } from './config/supabase'
import { apolloClient } from './config/apollo'
import { Session } from '@supabase/supabase-js'

import ProtectedRoute from './components/auth/ProtectedRoute'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import { ChatApplication } from './components/ChatApplication'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
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
    <ApolloProvider client={apolloClient}>
      <Routes>
        {/* Public routes */}
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        {/* Protected chat route */}
        <Route
          path="/"
          element={
            <ProtectedRoute session={session}>
              <ChatApplication session={session} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ApolloProvider>
  )
}