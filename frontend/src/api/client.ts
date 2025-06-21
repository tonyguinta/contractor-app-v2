import axios from 'axios'
import toast from 'react-hot-toast'

// Use environment variable for API URL, fallback to production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.buildcraftpro.com/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    const message = error.response?.data?.detail || 'An error occurred'
    toast.error(message)
    
    return Promise.reject(error)
  }
)

// API endpoints
export const clientsApi = {
  getAll: () => api.get('/clients/'),
  getById: (id: number) => api.get(`/clients/${id}/`),
  create: (data: any) => api.post('/clients/', data),
  update: (id: number, data: any) => api.put(`/clients/${id}/`, data),
  delete: (id: number) => api.delete(`/clients/${id}/`),
}

export const projectsApi = {
  getAll: () => api.get('/projects/'),
  getById: (id: number) => api.get(`/projects/${id}/`),
  create: (data: any) => api.post('/projects/', data),
  update: (id: number, data: any) => api.put(`/projects/${id}/`, data),
  delete: (id: number) => api.delete(`/projects/${id}/`),
}

export const invoicesApi = {
  getAll: () => api.get('/invoices/'),
  getById: (id: number) => api.get(`/invoices/${id}/`),
  create: (data: any) => api.post('/invoices/', data),
  update: (id: number, data: any) => api.put(`/invoices/${id}/`, data),
  delete: (id: number) => api.delete(`/invoices/${id}/`),
} 