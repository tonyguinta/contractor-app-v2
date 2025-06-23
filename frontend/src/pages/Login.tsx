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
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
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
      // Enhanced error message with registration suggestion
      toast.error(
        (t) => (
          <div className="space-y-2">
            <div className="font-medium">Unable to sign in</div>
            <div className="text-sm text-gray-600">
              The email or password you entered is incorrect.
            </div>
            <div className="flex items-center justify-between pt-2">
              <Link 
                to="/register" 
                className="text-sm text-accent-600 hover:text-accent-700 font-medium"
                onClick={() => toast.dismiss(t.id)}
              >
                Create account instead?
              </Link>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        ),
        {
          duration: 8000,
          style: {
            minWidth: '320px',
          },
        }
      )
    } else if (status === 422) {
      // Validation errors
      toast.error('Please check your email and password format')
    } else if (status >= 500) {
      // Server errors
      toast.error('Server temporarily unavailable. Please try again in a moment.')
    } else {
      // Fallback for other errors
      toast.error(detail || 'Unable to sign in. Please try again.')
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
                  }
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
                  }
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