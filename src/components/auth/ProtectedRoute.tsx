import { Navigate } from 'react-router-dom'
import { useAuthenticationStatus } from '@nhost/react'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuthenticationStatus()
  if (isLoading) return null // or a spinner
  return isAuthenticated ? children : <Navigate to="/sign-in" replace />
}