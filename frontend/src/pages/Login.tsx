import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

const Login = () => {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showRegisterSuggestion, setShowRegisterSuggestion] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const clearLoginError = () => {
    if (loginError) {
      setLoginError(null)
      setShowRegisterSuggestion(false)
    }
  }

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setLoginError(null)
    setShowRegisterSuggestion(false)
    
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
    } catch (error: any) {
      handleLoginError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoginError = (error: any) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail

    if (status === 401 && detail === 'Incorrect email or password') {
      // Show persistent error message suggesting account creation
      setLoginError('The email or password you entered is incorrect.')
      setShowRegisterSuggestion(true)
    } else if (status === 422) {
      // Validation errors
      setLoginError('Please check your email and password format')
      setShowRegisterSuggestion(false)
    } else if (status >= 500) {
      // Server errors
      setLoginError('Server temporarily unavailable. Please try again in a moment.')
      setShowRegisterSuggestion(false)
    } else {
      // Fallback for other errors
      setLoginError(detail || 'Unable to sign in. Please try again.')
      setShowRegisterSuggestion(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div>
          <div className="flex justify-center">
            <img src="/images/logos/logo.png" alt="BuildCraftPro" className="h-60 w-auto" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-primary-600">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-accent-500 hover:text-accent-600 transition-colors duration-200">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  },
                  onChange: clearLoginError
                })}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                className="input-field"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 1,
                    message: 'Password cannot be empty'
                  },
                  onChange: clearLoginError
                })}
                type="password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                className="input-field"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Persistent error message */}
          {loginError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="text-sm">
                <p className="font-medium text-red-800">Unable to sign in</p>
                <p className="text-red-700 mt-1">{loginError}</p>
                {showRegisterSuggestion && (
                  <div className="mt-3">
                    <p className="text-red-700">
                      Don't have an account?{' '}
                      <Link 
                        to="/register" 
                        className="font-medium text-red-800 hover:text-red-900 underline"
                      >
                        Create one here
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 