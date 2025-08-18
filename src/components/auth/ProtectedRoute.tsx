import { Navigate } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'

interface ProtectedRouteProps {
  children: JSX.Element
  session: Session | null
}

export default function ProtectedRoute({ children, session }: ProtectedRouteProps) {
  return session ? children : <Navigate to="/sign-in" replace />
}