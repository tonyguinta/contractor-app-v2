# Naming Conventions

## General Rules
- Use `snake_case` for Python variables, functions, and filenames
- Use `PascalCase` for Python classes and React components
- Use `camelCase` for JavaScript/TypeScript variables and function names
- Use `kebab-case` for URLs and API endpoints
- Use descriptive names that clearly indicate purpose

## Backend Naming

### Models (SQLAlchemy)
- Use singular nouns: `User`, `Client`, `Project`, `Task`, `Invoice`
- Table names are automatically pluralized: `users`, `clients`, `projects`
- Foreign key fields: `owner_id`, `client_id`, `project_id`
- Relationship fields: `owner`, `client`, `projects`, `tasks`

### Schemas (Pydantic)
- Base name + action: `ClientCreate`, `ClientUpdate`, `ClientResponse`
- Use descriptive suffixes: `ProjectDetail`, `InvoiceList`, `UserProfile`
- Request schemas: `LoginRequest`, `RegisterRequest`
- Response schemas: `TokenResponse`, `UserResponse`

### API Endpoints
- Use plural nouns: `/clients/`, `/projects/`, `/invoices/`
- RESTful patterns: `GET /clients/`, `POST /clients/`, `PUT /clients/{id}`
- Nested resources: `/projects/{id}/tasks/`, `/clients/{id}/invoices/`

### Python Variables and Functions
```python
# Good
def create_client(client_data: ClientCreate) -> Client:
    new_client = Client(**client_data.dict())
    return new_client

# Variables
current_user = get_current_user()
client_list = get_all_clients()
project_count = len(projects)
```

## Frontend Naming

### Components
- Use PascalCase: `Dashboard`, `ClientList`, `ProjectForm`
- Descriptive names: `LoadingSpinner`, `AuthContext`, `Layout`
- Page components match routes: `Clients.tsx`, `Projects.tsx`, `Invoices.tsx`

### TypeScript Interfaces
```typescript
// Props interfaces
interface ClientFormProps {
  client?: Client
  onSubmit: (data: ClientData) => void
}

// Data interfaces
interface Client {
  id: number
  name: string
  email: string
  created_at: string
}

// API response types
interface ApiResponse<T> {
  data: T
  message?: string
}
```

### Variables and Functions
```typescript
// Good
const clientList = await clientsApi.getAll()
const handleSubmit = (formData: ClientData) => { }
const isLoading = useState(false)

// API functions
export const clientsApi = {
  getAll: () => api.get('/clients/'),
  getById: (id: number) => api.get(`/clients/${id}`),
  create: (data: ClientCreate) => api.post('/clients/', data)
}
```

## File Naming

### Backend Files
- `models.py` (single file for all models)
- `schemas.py` (single file for all schemas)
- API routers: `auth.py`, `clients.py`, `projects.py`, `invoices.py`
- Utilities: `security.py`, `deps.py`, `database.py`

### Frontend Files
- Components: `Dashboard.tsx`, `Layout.tsx`, `LoadingSpinner.tsx`
- Pages: `Login.tsx`, `Register.tsx`, `Clients.tsx`
- API: `client.ts` (single file for all API calls)
- Context: `AuthContext.tsx`

## Database Naming

### Table Names
- Automatically pluralized by SQLAlchemy: `users`, `clients`, `projects`, `tasks`, `invoices`
- Use lowercase with underscores for multi-word tables

### Column Names
- Use `snake_case`: `full_name`, `company_name`, `created_at`, `updated_at`
- Boolean fields: `is_active`, `is_completed`, `is_paid`
- Foreign keys: `owner_id`, `client_id`, `project_id`
- Timestamps: `created_at`, `updated_at`, `due_date`, `completed_at`

## Constants and Enums

### Backend Constants
```python
# Status constants
PROJECT_STATUS_PLANNING = "planning"
PROJECT_STATUS_IN_PROGRESS = "in_progress"
PROJECT_STATUS_COMPLETED = "completed"

# Configuration
DEFAULT_PAGE_SIZE = 20
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
```

### Frontend Constants
```typescript
// API endpoints
const API_BASE_URL = 'http://localhost:8000'
const ROUTES = {
  DASHBOARD: '/',
  CLIENTS: '/clients',
  PROJECTS: '/projects',
  INVOICES: '/invoices'
}

// UI constants
const LOADING_TIMEOUT = 30000
const DEFAULT_PAGE_SIZE = 10
```

## Avoid These Patterns

### Bad Examples
```python
# Bad: Unclear abbreviations
def get_cli(): pass
def create_proj(): pass

# Bad: Non-descriptive names
def process(): pass
def handle(): pass

# Bad: Inconsistent casing
class clientModel(): pass
def CreateUser(): pass
```

```typescript
// Bad: Unclear component names
const Comp = () => { }
const Thing = () => { }

// Bad: Non-descriptive variables
const data = await api.get()
const result = process(input)
```