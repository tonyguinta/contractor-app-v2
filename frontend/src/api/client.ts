import axios, { AxiosResponse } from 'axios'
import toast from 'react-hot-toast'
import {
  Client, ClientCreate, ClientUpdate,
  Project, ProjectCreate, ProjectUpdate, ProjectWithClient,
  Invoice, InvoiceCreate, InvoiceUpdate, InvoiceWithClient,
  Task, TaskCreate, TaskUpdate,
  User, UserCreate, UserLogin, Token,
  Subproject, SubprojectCreate, SubprojectUpdate, SubprojectWithItems,
  MaterialEntry, MaterialEntryCreate,
  MaterialItem, MaterialItemCreate, MaterialItemUpdate,
  LaborItem, LaborItemCreate, LaborItemUpdate,
  PermitItem, PermitItemCreate, PermitItemUpdate,
  OtherCostItem, OtherCostItemCreate, OtherCostItemUpdate,
  CostSummary
} from '../types/api'

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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
    
    // Handle different error response formats
    let message = 'An error occurred'
    
    console.log('API Error Response:', error.response?.data)
    
    if (error.response?.data) {
      const data = error.response.data
      
      // Handle FastAPI validation errors (array of error objects)
      if (Array.isArray(data) && data.length > 0) {
        message = data.map(err => err.msg || err.message || 'Validation error').join(', ')
      }
      // Handle standard error responses with detail field
      else if (data.detail) {
        // Check if detail is an array (FastAPI validation errors)
        if (Array.isArray(data.detail)) {
          message = data.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ')
        } else {
          message = data.detail
        }
      }
      // Handle other error formats
      else if (data.message) {
        message = data.message
      }
    }
    
    // Ensure message is always a string to prevent React rendering errors
    const safeMessage = typeof message === 'string' ? message : 'An error occurred'
    toast.error(safeMessage)
    
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

// Subprojects API
export const subprojectsApi = {
  // Subproject CRUD
  create: (data: SubprojectCreate): Promise<AxiosResponse<Subproject>> => 
    api.post('/subprojects/', data),
  getByProject: (projectId: number): Promise<AxiosResponse<SubprojectWithItems[]>> => 
    api.get(`/subprojects/project/${projectId}`),
  getById: (id: number): Promise<AxiosResponse<SubprojectWithItems>> => 
    api.get(`/subprojects/${id}`),
  update: (id: number, data: SubprojectUpdate): Promise<AxiosResponse<Subproject>> => 
    api.put(`/subprojects/${id}`, data),
  delete: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/subprojects/${id}`),
  
  // Material autocomplete
  searchMaterials: (query: string, limit = 10): Promise<AxiosResponse<MaterialEntry[]>> => 
    api.get('/subprojects/materials/search', { params: { q: query, limit } }),
  createMaterialEntry: (data: MaterialEntryCreate): Promise<AxiosResponse<MaterialEntry>> => 
    api.post('/subprojects/materials/entries', data),
  
  // Material items
  createMaterial: (subprojectId: number, data: MaterialItemCreate): Promise<AxiosResponse<MaterialItem>> => 
    api.post(`/subprojects/${subprojectId}/materials`, data),
  updateMaterial: (id: number, data: MaterialItemUpdate): Promise<AxiosResponse<MaterialItem>> => 
    api.put(`/subprojects/materials/${id}`, data),
  deleteMaterial: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/subprojects/materials/${id}`),
  
  // Labor items
  createLabor: (subprojectId: number, data: LaborItemCreate): Promise<AxiosResponse<LaborItem>> => 
    api.post(`/subprojects/${subprojectId}/labor`, data),
  updateLabor: (id: number, data: LaborItemUpdate): Promise<AxiosResponse<LaborItem>> => 
    api.put(`/subprojects/labor/${id}`, data),
  deleteLabor: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/subprojects/labor/${id}`),
  
  // Permit items
  createPermit: (subprojectId: number, data: PermitItemCreate): Promise<AxiosResponse<PermitItem>> => 
    api.post(`/subprojects/${subprojectId}/permits`, data),
  updatePermit: (id: number, data: PermitItemUpdate): Promise<AxiosResponse<PermitItem>> => 
    api.put(`/subprojects/permits/${id}`, data),
  deletePermit: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/subprojects/permits/${id}`),
  
  // Other cost items
  createOtherCost: (subprojectId: number, data: OtherCostItemCreate): Promise<AxiosResponse<OtherCostItem>> => 
    api.post(`/subprojects/${subprojectId}/other-costs`, data),
  updateOtherCost: (id: number, data: OtherCostItemUpdate): Promise<AxiosResponse<OtherCostItem>> => 
    api.put(`/subprojects/other-costs/${id}`, data),
  deleteOtherCost: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/subprojects/other-costs/${id}`),
  
  // Cost summary
  getCostSummary: (subprojectId: number): Promise<AxiosResponse<CostSummary>> => 
    api.get(`/subprojects/${subprojectId}/cost-summary`),
} 