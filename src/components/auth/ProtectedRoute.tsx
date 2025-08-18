// // src/components/auth/ProtectedRoute.tsx
// import { Navigate } from 'react-router-dom'

// interface ProtectedRouteProps {
//   isAuthenticated: boolean
//   children: React.ReactNode
// }

// export default function ProtectedRoute({ isAuthenticated, children }: ProtectedRouteProps) {
//   if (!isAuthenticated) {
//     return <Navigate to="/sign-in" replace />
//   }

//   return <>{children}</>
// }
import { useAuthenticationStatus } from '@nhost/react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthenticationStatus()
  
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />
  }
  
  return children
}