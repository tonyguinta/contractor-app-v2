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
  sales_tax_rate: number
  sales_tax_amount: number
  total_with_tax: number
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
  sales_tax_rate?: number
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
  sales_tax_rate?: number | null
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

// Subproject Types
export type SubprojectStatus = "planning" | "in_progress" | "completed"

export interface Subproject {
  id: number
  title: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: SubprojectStatus
  created_at: string
  updated_at: string | null
  project_id: number
}

export interface SubprojectCreate {
  title: string
  project_id: number
  description?: string | null
  start_date?: string | null
  end_date?: string | null
  status?: SubprojectStatus
}

export interface SubprojectUpdate {
  title?: string | null
  description?: string | null
  start_date?: string | null
  end_date?: string | null
  status?: SubprojectStatus
}

// Material Entry Types (for autocomplete)
export interface MaterialEntry {
  id: number
  description: string
  unit: string
  category: string | null
  unit_price: number | null
  created_at: string
  user_id: number
}

export interface MaterialEntryCreate {
  description: string
  unit: string
  category?: string | null
  unit_price?: number | null
}

// Material Item Types
export interface MaterialItem {
  id: number
  description: string
  unit: string
  quantity: number
  unit_cost: number
  category: string | null
  created_at: string
  updated_at: string | null
  subproject_id: number
}

export interface MaterialItemCreate {
  description: string
  unit: string
  quantity: number
  unit_cost: number
  subproject_id: number
  category?: string | null
}

export interface MaterialItemUpdate {
  description?: string | null
  unit?: string | null
  quantity?: number | null
  unit_cost?: number | null
  category?: string | null
}

// Labor Item Types
export interface LaborItem {
  id: number
  role: string
  number_of_workers: number
  hourly_rate: number
  hours: number
  created_at: string
  updated_at: string | null
  subproject_id: number
}

export interface LaborItemCreate {
  role: string
  number_of_workers: number
  hourly_rate: number
  hours: number
  subproject_id: number
}

export interface LaborItemUpdate {
  role?: string | null
  number_of_workers?: number | null
  hourly_rate?: number | null
  hours?: number | null
}

// Permit Item Types
export interface PermitItem {
  id: number
  description: string
  cost: number
  issued_date: string | null
  expiration_date: string | null
  notes: string | null
  created_at: string
  updated_at: string | null
  subproject_id: number
}

export interface PermitItemCreate {
  description: string
  cost: number
  subproject_id: number
  issued_date?: string | null
  expiration_date?: string | null
  notes?: string | null
}

export interface PermitItemUpdate {
  description?: string | null
  cost?: number | null
  issued_date?: string | null
  expiration_date?: string | null
  notes?: string | null
}

// Other Cost Item Types
export interface OtherCostItem {
  id: number
  description: string
  cost: number
  notes: string | null
  created_at: string
  updated_at: string | null
  subproject_id: number
}

export interface OtherCostItemCreate {
  description: string
  cost: number
  subproject_id: number
  notes?: string | null
}

export interface OtherCostItemUpdate {
  description?: string | null
  cost?: number | null
  notes?: string | null
}

// Detailed response types with nested data
export interface SubprojectWithItems extends Subproject {
  material_items: MaterialItem[]
  labor_items: LaborItem[]
  permit_items: PermitItem[]
  other_cost_items: OtherCostItem[]
}

export interface ProjectWithSubprojects extends Project {
  client: Client
  subprojects: SubprojectWithItems[]
}

// Cost summary types
export interface CostSummary {
  total_materials: number
  total_labor: number
  total_permits: number
  total_other: number
  estimated_total: number
} 