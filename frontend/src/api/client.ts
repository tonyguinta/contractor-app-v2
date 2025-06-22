import axios, { AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import {
  Client, ClientCreate, ClientUpdate,
  Project, ProjectCreate, ProjectUpdate, ProjectWithClient,
  Invoice, InvoiceCreate, InvoiceUpdate, InvoiceWithClient,
  Task, TaskCreate, TaskUpdate,
  User, UserCreate, UserLogin, Token
} from '../types/api'

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

// Authentication API
export const authApi = {
  login: (data: UserLogin): Promise<AxiosResponse<Token>> => 
    api.post('/auth/login', data),
  register: (data: UserCreate): Promise<AxiosResponse<User>> => 
    api.post('/auth/register', data),
  getCurrentUser: (): Promise<AxiosResponse<User>> => 
    api.get('/auth/me'),
}

// Clients API
export const clientsApi = {
  getAll: (): Promise<AxiosResponse<Client[]>> => 
    api.get('/clients/'),
  getById: (id: number): Promise<AxiosResponse<Client>> => 
    api.get(`/clients/${id}/`),
  create: (data: ClientCreate): Promise<AxiosResponse<Client>> => 
    api.post('/clients/', data),
  update: (id: number, data: ClientUpdate): Promise<AxiosResponse<Client>> => 
    api.put(`/clients/${id}/`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/clients/${id}/`),
}

// Projects API
export const projectsApi = {
  getAll: (): Promise<AxiosResponse<ProjectWithClient[]>> => 
    api.get('/projects/'),
  getById: (id: number): Promise<AxiosResponse<ProjectWithClient>> => 
    api.get(`/projects/${id}/`),
  create: (data: ProjectCreate): Promise<AxiosResponse<Project>> => 
    api.post('/projects/', data),
  update: (id: number, data: ProjectUpdate): Promise<AxiosResponse<Project>> => 
    api.put(`/projects/${id}/`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/projects/${id}/`),
}

// Tasks API
export const tasksApi = {
  getAll: (projectId?: number): Promise<AxiosResponse<Task[]>> => 
    api.get('/tasks/', { params: projectId ? { project_id: projectId } : {} }),
  getById: (id: number): Promise<AxiosResponse<Task>> => 
    api.get(`/tasks/${id}/`),
  create: (data: TaskCreate): Promise<AxiosResponse<Task>> => 
    api.post('/tasks/', data),
  update: (id: number, data: TaskUpdate): Promise<AxiosResponse<Task>> => 
    api.put(`/tasks/${id}/`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/tasks/${id}/`),
}

// Invoices API
export const invoicesApi = {
  getAll: (): Promise<AxiosResponse<InvoiceWithClient[]>> => 
    api.get('/invoices/'),
  getById: (id: number): Promise<AxiosResponse<InvoiceWithClient>> => 
    api.get(`/invoices/${id}/`),
  create: (data: InvoiceCreate): Promise<AxiosResponse<Invoice>> => 
    api.post('/invoices/', data),
  update: (id: number, data: InvoiceUpdate): Promise<AxiosResponse<Invoice>> => 
    api.put(`/invoices/${id}/`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/invoices/${id}/`),
} 