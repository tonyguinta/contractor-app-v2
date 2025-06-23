import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  full_name: string
  company_name?: string
  phone?: string
}

const Register = () => {
  const { register: registerUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>()
  
  const password = watch('password')

  const handleRegistrationError = (error: any) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail

    if (status === 400 && detail === 'Email already registered') {
      // Email already exists - suggest login
      toast.error(
        (t) => (
          <div className="space-y-2">
            <div className="font-medium">Email already registered</div>
            <div className="text-sm text-gray-600">
              An account with this email already exists.
            </div>
            <div className="flex items-center justify-between pt-2">
              <Link 
                to="/login" 
                className="text-sm text-accent-600 hover:text-accent-700 font-medium"
                onClick={() => toast.dismiss(t.id)}
              >
                Sign in instead?
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
      toast.error('Please check all required fields and try again')
    } else if (status >= 500) {
      // Server errors
      toast.error('Server temporarily unavailable. Please try again in a moment.')
    } else {
      // Fallback for other errors
      toast.error(detail || 'Unable to create account. Please try again.')
    }
  }

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        company_name: data.company_name,
        phone: data.phone
      })
      toast.success('Account created successfully!')
    } catch (error: any) {
      handleRegistrationError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img src="/images/logos/logo.png" alt="BuildCraftPro" className="h-20 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-600">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-accent-500 hover:text-accent-600 transition-colors duration-200">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                {...register('full_name', { required: 'Full name is required' })}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                className="input-field"
                placeholder="Enter your full name"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-error">{errors.full_name.message}</p>
              )}
            </div>
            
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
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                Company Name (Optional)
              </label>
              <input
                {...register('company_name')}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                className="input-field"
                placeholder="Enter your company name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (Optional)
              </label>
              <input
                {...register('phone')}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                className="input-field"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type="password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-form-type="other"
                className="input-field"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register 