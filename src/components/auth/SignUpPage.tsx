import * as React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSignUpEmailPassword, useAuthenticationStatus } from '@nhost/react'
import { Mail, Lock, MessageCircle } from 'lucide-react'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthenticationStatus()
  const { signUpEmailPassword, isLoading, error } = useSignUpEmailPassword()
  const [showPwd, setShowPwd] = React.useState(false)

  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') || '')
    const password = String(fd.get('password') || '')
    await signUpEmailPassword(email, password)
    // If email verification is required in Nhost, user must verify before auth=true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-1 text-sm text-gray-600">Start chatting with AI</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 bg-white p-6 rounded-xl shadow">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Email address</span>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="block text-sm font-medium text-gray-700">Password</span>
            <div className="mt-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </span>
              <input
                name="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute inset-y-0 right-0 px-3 text-sm text-gray-600 hover:text-gray-900"
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60"
          >
            {isLoading ? 'Creating…' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}