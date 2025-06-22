import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

interface User {
  id: number
  email: string
  full_name: string
  company_name?: string
  phone?: string
  is_active: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  company_name?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        try {
          // Fetch current user data
          const response = await api.get('/auth/me')
          setUser(response.data)
        } catch (error) {
          // Token is invalid, remove it
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
        }
      }
      setLoading(false)
    }
    
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    const { access_token } = response.data
    
    localStorage.setItem('token', access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    
    // Fetch current user data
    const userResponse = await api.get('/auth/me')
    setUser(userResponse.data)
  }

  const register = async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData)
    setUser(response.data)
    
    // Auto-login after registration
    await login(userData.email, userData.password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 