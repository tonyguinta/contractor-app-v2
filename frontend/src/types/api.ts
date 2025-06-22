// API Response Types - Match backend Pydantic schemas exactly

// Base API Response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string
}

// User Types
export interface User {
  id: number
  email: string
  full_name: string
  company_name: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserCreate {
  email: string
  password: string
  full_name: string
  company_name?: string | null
  phone?: string | null
}

export interface UserLogin {
  email: string
  password: string
}

// Client Types
export interface Client {
  id: number
  name: string
  email: string | null
  phone: string | null
  address: string | null
  company: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  owner_id: number
}

export interface ClientCreate {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  company?: string | null
  notes?: string | null
}

export interface ClientUpdate {
  name?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  company?: string | null
  notes?: string | null
}

// Project Types
export type ProjectStatus = "planning" | "in_progress" | "completed" | "on_hold"

export interface Project {
  id: number
  title: string
  description: string | null
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  estimated_cost: number
  actual_cost: number
  labor_cost: number
  material_cost: number
  permit_cost: number
  other_cost: number
  created_at: string
  updated_at: string | null
  owner_id: number
  client_id: number
}

export interface ProjectCreate {
  title: string
  client_id: number
  description?: string | null
  status?: ProjectStatus
  start_date?: string | null
  end_date?: string | null
  estimated_cost?: number
  labor_cost?: number
  material_cost?: number
  permit_cost?: number
  other_cost?: number
}

export interface ProjectUpdate {
  title?: string | null
  client_id?: number | null
  description?: string | null
  status?: ProjectStatus
  start_date?: string | null
  end_date?: string | null
  estimated_cost?: number | null
  actual_cost?: number | null
  labor_cost?: number | null
  material_cost?: number | null
  permit_cost?: number | null
  other_cost?: number | null
}

export interface ProjectWithClient extends Project {
  client: Client
}

// Task Types
export type TaskStatus = "pending" | "in_progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  estimated_hours: number
  actual_hours: number
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string | null
  project_id: number
}

export interface TaskCreate {
  title: string
  project_id: number
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  estimated_hours?: number
  due_date?: string | null
}

export interface TaskUpdate {
  title?: string | null
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  estimated_hours?: number | null
  actual_hours?: number | null
  due_date?: string | null
  completed_at?: string | null
}

// Invoice Types
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue"

export interface Invoice {
  id: number
  invoice_number: string
  title: string
  description: string | null
  amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  status: InvoiceStatus
  issue_date: string
  due_date: string
  paid_date: string | null
  created_at: string
  updated_at: string | null
  owner_id: number
  client_id: number
  project_id: number | null
}

export interface InvoiceCreate {
  title: string
  client_id: number
  amount: number
  issue_date: string
  due_date: string
  project_id?: number | null
  description?: string | null
  tax_rate?: number
}

export interface InvoiceUpdate {
  title?: string | null
  amount?: number | null
  description?: string | null
  tax_rate?: number | null
  issue_date?: string
  due_date?: string
  status?: InvoiceStatus
  paid_date?: string | null
}

export interface InvoiceWithClient extends Invoice {
  client: Client
  project?: Project | null
}

// Authentication Types
export interface Token {
  access_token: string
  token_type: string
}

// Error Types
export interface ApiError {
  detail: string
  code?: string
}

// Pagination Types (for future use)
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
} 