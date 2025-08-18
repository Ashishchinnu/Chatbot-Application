// src/App.tsx
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import SignInPage from './components/auth/SignInPage'
import SignUpPage from './components/auth/SignUpPage'
import { ChatApplication } from "d:/Chatbot-Application/src/components/ChatApplication"

export default function App() {
  return (
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
  )
}