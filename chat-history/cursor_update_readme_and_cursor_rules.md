# Update readme and cursor rules
_Exported on 6/20/2025 at 16:11:47 CDT from Cursor (1.1.3)_

---

**User**

Any updates we should make to the readme and .cursor/rules based on where we are so far?

---

**Cursor**

I'll examine the current README and check if there's a `.cursor/rules` file to see what updates might be needed based on the current state of the project.

Now let me examine the current .cursor/rules files to understand what coding standards and patterns are already documented:

Let me also check the other .cursor/rules files to get a complete picture:

Now let me check the SETUP_GUIDE.md to see what setup instructions are already documented:

Let me also check the current backend and frontend structure to see what's actually implemented:

Based on my analysis of the current project state, here are the key updates we should make to the README and .cursor/rules:

## Recommended Updates

### 1. README.md Updates

The README needs several updates to reflect the current state:

```markdown
# Contractor App

A SaaS web application for general contractors (carpentry, HVAC, plumbing, electrical) to manage their projects, clients, and invoices.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Client Management**: Store and manage client information
- **Project Management**: Create and track projects with detailed cost breakdowns
- **Task Management**: Assign and track tasks within projects
- **Invoice Generation**: Create and manage invoices with tax calculations
- **Dashboard**: Overview of projects, clients, invoices, and revenue metrics
- **Mobile-First Design**: Fully responsive interface for use on job sites

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework
- **SQLAlchemy**: SQL toolkit and ORM
- **Pydantic**: Data validation and settings management
- **SQLite**: Database (easily upgradeable to PostgreSQL)
- **JWT**: JSON Web Tokens for authentication

### Frontend
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Next-generation frontend build tool
- **React Router**: Declarative routing for React
- **Axios**: HTTP client for API requests

### Development Tools
- **Python Virtual Environment**: Isolated Python environment
- **ESLint & Prettier**: Code formatting and linting
- **Hot Reload**: Development servers with auto-refresh

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- Git (optional)

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/contractor-app.git
cd contractor-app
```

2. **Run the automated setup:**
```bash
python setup.py
```

3. **Start the application:**
```bash
python run.py
```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend

1. **Create and activate virtual environment:**
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Run the development server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Run the development server:**
```bash
npm run dev
```

## Project Structure

```
contractor-app/
├── backend/
│   ├── app/
│   │   ├── api/            # API endpoints (auth, clients, projects, invoices)
│   │   ├── core/           # Security, dependencies, configuration
│   │   ├── db/             # Database setup and connection
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   └── main.py         # FastAPI application entry point
│   ├── requirements.txt    # Python dependencies
│   └── venv/              # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── api/            # API client configuration
│   │   ├── components/     # Reusable React components
│   │   ├── context/        # React context providers (Auth)
│   │   ├── pages/          # Page components (Dashboard, Clients, etc.)
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
├── .cursor/               # Cursor IDE rules and conventions
├── README.md              # This file
├── SETUP_GUIDE.md         # Detailed setup instructions
├── run.py                 # Application startup script
└── setup.py               # Automated setup script
```

## Database Schema

The application uses the following main entities:

- **Users**: Contractor authentication and profile
- **Clients**: Customer information and contact details
- **Projects**: Construction projects with cost tracking
- **Tasks**: Project tasks with time tracking
- **Invoices**: Billing with tax calculations and payment status

## Development Guidelines

This project follows specific coding conventions documented in `.cursor/rules/`:
- **Architecture**: Clear separation between frontend/backend layers
- **Backend Style**: FastAPI with Pydantic validation and SQLAlchemy ORM
- **Frontend Style**: React with TypeScript and Tailwind CSS
- **Authentication**: JWT-based authentication flow
- **Data Modeling**: Consistent database patterns with proper relationships
- **Naming**: Consistent naming conventions across the stack

## API Documentation

When running the backend server, visit http://localhost:8000/docs for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

## Contributing

1. Follow the coding conventions in `.cursor/rules/`
2. Use the provided setup scripts for consistent development environment
3. Test both frontend and backend changes
4. Update documentation when adding new features

## License

This project is licensed under the MIT License - see the LICENSE file for details.
```

### 2. .cursor/rules Updates

Now let's update the `.cursor/rules` files to reflect current patterns and add missing guidelines:

```markdown
# Project Architecture

This is a fullstack SaaS app for general contractors using:

- Frontend: React + TypeScript + Tailwind CSS + Vite
- Backend: FastAPI + SQLAlchemy + Pydantic + SQLite
- Auth: JWT (no OAuth, no social login)
- Development: Python virtual environment + npm
- Deployment: Frontend on Vercel, Backend on Render (planned)

## Current Implementation Status

✅ **Completed Core Features:**
- User authentication (register/login with JWT)
- Client management (CRUD operations)
- Project management with cost tracking
- Task management within projects
- Invoice generation with tax calculations
- Dashboard with business metrics
- Responsive mobile-first UI

## Directory Structure

Maintain a clear separation between:

### Backend (`backend/app/`)
- `api/` → FastAPI routers (auth.py, clients.py, projects.py, invoices.py)
- `models/` → SQLAlchemy DB models with proper relationships
- `schemas/` → Pydantic request/response schemas
- `core/` → Security, dependencies, and global configuration
- `db/` → Database connection and session management

### Frontend (`frontend/src/`)
- `api/` → API client configuration (axios setup)
- `pages/` → Page-level React components (Dashboard, Clients, etc.)
- `components/` → Reusable UI building blocks (Layout, LoadingSpinner)
- `context/` → React context providers (AuthContext)

## API Design Patterns

- Use RESTful APIs with standard HTTP methods
- All routes return consistent JSON responses
- Use Pydantic schemas for request/response validation
- Implement proper error handling with HTTP status codes
- Protected routes use JWT authentication via `Depends(get_current_user)`

## Database Patterns

- All models inherit from SQLAlchemy Base
- Use proper foreign key relationships
- Include `created_at` timestamps with timezone awareness
- Follow the User → Clients → Projects → Tasks/Invoices hierarchy

## Frontend Patterns

- Use React functional components with hooks
- Implement proper loading states and error handling
- Use React Router for navigation
- Store JWT in localStorage with automatic header injection
- Use Tailwind CSS classes for styling (no custom CSS)

Avoid GraphQL, WebSocket, or complex state management for MVP.
```

```markdown
# Backend Code Style

## Core Principles

- Use **FastAPI** for all route handling
- Group routes by feature (`auth.py`, `clients.py`, `projects.py`, `invoices.py`)
- Use **Pydantic** for all request/response models
- Use **SQLAlchemy ORM**, not raw SQL
- Inject DB sessions using FastAPI's dependency system (`Depends(get_db)`)
- Always validate user input using Pydantic schemas
- Protect routes with JWT authentication (`Depends(get_current_user)`)

## Route Structure Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.models import User, Client
from app.schemas.schemas import ClientCreate, ClientResponse

router = APIRouter()

@router.post("/clients/", response_model=ClientResponse)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Implementation here
    pass
```

## Database Model Patterns

- All models must include `id`, `created_at` fields
- Use proper foreign key relationships
- Include `updated_at` for mutable entities
- Use timezone-aware datetime fields

```python
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="projects")
```

## Schema Patterns

- Create separate schemas for Create, Update, and Response
- Use proper validation and field types
- Include examples for API documentation

```python
class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## Error Handling

- Use HTTPException for API errors
- Return appropriate HTTP status codes
- Provide clear error messages

```python
if not client:
    raise HTTPException(status_code=404, detail="Client not found")
```

## Authentication Pattern

- All protected routes must use `get_current_user` dependency
- JWT tokens are validated automatically
- User ownership is enforced in route handlers

```python
@router.get("/clients/", response_model=List[ClientResponse])
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Client).filter(Client.owner_id == current_user.id).all()
```
```

```markdown
```

Example route structure:
```python
@router.post("/projects/")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):

```

->


```

```markdown
Example route structure:
```python
@router.post("/projects/")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):

```

->


```

Let me fix the backend style file by removing the redundant example:

```markdown
    return db.query(Client).filter(Client.owner_id == current_user.id).all()
```

Example route structure:
```python
@router.post("/projects/")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):

```

->

    return db.query(Client).filter(Client.owner_id == current_user.id).all()
```
```

```markdown
# Backend Code Style

## Core Principles

- Use **FastAPI** for all route handling
- Group routes by feature (`auth.py`, `clients.py`, `projects.py`, `invoices.py`)
- Use **Pydantic** for all request/response models
- Use **SQLAlchemy ORM**, not raw SQL
- Inject DB sessions using FastAPI's dependency system (`Depends(get_db)`)
- Always validate user input using Pydantic schemas
- Protect routes with JWT authentication (`Depends(get_current_user)`)

## Route Structure Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.models import User, Client
from app.schemas.schemas import ClientCreate, ClientResponse

router = APIRouter()

@router.post("/clients/", response_model=ClientResponse)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Implementation here
    pass
```

## Database Model Patterns

- All models must include `id`, `created_at` fields
- Use proper foreign key relationships
- Include `updated_at` for mutable entities
- Use timezone-aware datetime fields

```python
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="projects")
```

## Schema Patterns

- Create separate schemas for Create, Update, and Response
- Use proper validation and field types
- Include examples for API documentation

```python
class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## Error Handling

- Use HTTPException for API errors
- Return appropriate HTTP status codes
- Provide clear error messages

```python
if not client:
    raise HTTPException(status_code=404, detail="Client not found")
```

## Authentication Pattern

- All protected routes must use `get_current_user` dependency
- JWT tokens are validated automatically
- User ownership is enforced in route handlers

```python
@router.get("/clients/", response_model=List[ClientResponse])
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Client).filter(Client.owner_id == current_user.id).all()
```
```

Now let's update the frontend style guide:

```markdown
# Frontend Code Style

## Core Principles

- Use **React with TypeScript** for all components
- Use **Tailwind CSS** for styling (no custom CSS files)
- Keep all components **functional and stateless** unless state is needed
- Use **custom hooks** for shared logic (API calls, local state)
- Use `axios` in `src/api` and never directly inside pages/components
- Keep forms in pages; decompose layout/UI into reusable components

## Component Structure

```tsx
import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../components/LoadingSpinner'

interface Props {
  // Define props with TypeScript interfaces
}

const ComponentName = ({ prop1, prop2 }: Props) => {
  const [loading, setLoading] = useState(false)
  
  // Component logic here
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return (
    <div className="space-y-6">
      {/* Use Tailwind classes for styling */}
    </div>
  )
}

export default ComponentName
```

## API Integration Pattern

- All API calls go through `src/api/client.ts`
- Use axios interceptors for authentication
- Handle loading and error states consistently

```tsx
// In src/api/client.ts
export const clientsApi = {
  getAll: () => api.get('/clients/'),
  create: (data: ClientCreate) => api.post('/clients/', data),
  update: (id: number, data: ClientUpdate) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`)
}

// In components
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await clientsApi.getAll()
      setData(response.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  fetchData()
}, [])
```

## Styling Guidelines

- Use Tailwind utility classes exclusively
- Follow mobile-first responsive design
- Use consistent spacing scale (space-y-4, space-y-6, etc.)
- Use semantic color classes (text-gray-900, bg-primary-600)
- Apply consistent card styling with `card` class

```tsx
// Good: Using Tailwind classes
<div className="card">
  <h2 className="text-lg font-medium text-gray-900 mb-4">Title</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Content */}
  </div>
</div>

// Bad: Custom CSS or inline styles
<div style={{ padding: '16px' }}>
```

## State Management

- Use React's built-in state (useState, useContext)
- Use AuthContext for authentication state
- Keep component state local when possible
- Use custom hooks for complex state logic

```tsx
// Custom hook example
const useClients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  
  const fetchClients = async () => {
    // API logic here
  }
  
  return { clients, loading, fetchClients }
}
```

## Navigation and Routing

- Use React Router for navigation
- Use Link components instead of anchor tags
- Implement proper route protection with AuthContext

```tsx
import { Link } from 'react-router-dom'

// Good: Using Link component
<Link to="/clients" className="btn btn-primary">
  View Clients
</Link>
```

## Form Handling

- Keep forms simple with controlled components
- Implement proper validation and error handling
- Use consistent form styling with Tailwind

```tsx
const [formData, setFormData] = useState({
  name: '',
  email: ''
})

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    await clientsApi.create(formData)
    // Handle success
  } catch (error) {
    // Handle error
  }
}
```

## What to Avoid

- Class-based components (use functional components)
- CSS-in-JS libraries (stick with Tailwind)
- Complex state management libraries (Redux, Zustand)
- Direct API calls in components (use api/client.ts)
- Custom CSS files (use Tailwind utilities)
```

Now let's add a new rule file for development workflow:

```markdown
# Development Workflow

## Setup Process

### Quick Start
1. Run `python setup.py` for automated setup
2. Run `python run.py` to start both servers
3. Access frontend at http://localhost:3000
4. Access API docs at http://localhost:8000/docs

### Manual Setup
1. Backend: Create venv, install requirements, run uvicorn
2. Frontend: npm install, npm run dev
3. Both servers must run simultaneously for full functionality

## Development Environment

### Backend Development
- Use Python virtual environment in `backend/venv/`
- Run `uvicorn app.main:app --reload` for hot reload
- Access API documentation at `/docs` endpoint
- Use SQLite database (automatically created)
- JWT tokens stored in localStorage on frontend

### Frontend Development
- Use Vite dev server with hot module replacement
- TypeScript compilation happens automatically
- Tailwind CSS classes are compiled on-demand
- React components use functional patterns with hooks

## Database Management

- SQLite database file: `backend/contractor_app.db`
- Models defined in `backend/app/models/models.py`
- Database tables created automatically on first run
- No migrations needed for development (SQLite auto-creates)

## API Testing

- Use FastAPI's automatic docs at http://localhost:8000/docs
- Test authentication by registering a user first
- Protected endpoints require JWT token in Authorization header
- Use browser's network tab to debug API calls

## Common Development Tasks

### Adding a New Feature
1. Define database model in `models/models.py`
2. Create Pydantic schemas in `schemas/schemas.py`
3. Implement API routes in `api/[feature].py`
4. Add API client methods in `frontend/src/api/client.ts`
5. Create React components and pages
6. Update navigation if needed

### Authentication Flow
1. User registers/logs in → receives JWT
2. JWT stored in localStorage
3. Axios interceptor adds JWT to all requests
4. Backend validates JWT on protected routes
5. Frontend redirects to login if JWT invalid

### Debugging Tips
- Backend errors: Check uvicorn console output
- Frontend errors: Check browser console and network tab
- Database issues: Check SQLite file exists and has correct permissions
- CORS issues: Ensure backend CORS settings allow frontend origin

## Code Quality

### Backend Standards
- Use FastAPI dependency injection
- Validate all inputs with Pydantic
- Handle errors with HTTPException
- Follow RESTful API conventions
- Include proper type hints

### Frontend Standards
- Use TypeScript interfaces for all props
- Handle loading and error states
- Use consistent Tailwind classes
- Keep components focused and reusable
- Implement proper form validation

## File Structure Conventions

### Backend Files
- `api/` → One file per feature (auth.py, clients.py, etc.)
- `models/` → Single models.py file for all SQLAlchemy models
- `schemas/` → Single schemas.py file for all Pydantic schemas
- `core/` → Security, dependencies, configuration

### Frontend Files
- `pages/` → One file per route (Dashboard.tsx, Clients.tsx, etc.)
- `components/` → Reusable UI components (Layout.tsx, LoadingSpinner.tsx)
- `api/` → Single client.ts file for all API methods
- `context/` → React contexts (AuthContext.tsx)

## Performance Considerations

- SQLite is sufficient for development and small deployments
- Frontend uses lazy loading for routes (if implemented)
- API responses are kept minimal with proper Pydantic schemas
- Images and assets served through Vite's static file handling
```

Finally, let's update the naming conventions to be more specific:

```markdown
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
```

## Summary

I've updated both the README and .cursor/rules files to accurately reflect the current state of your contractor app project. Here's what was updated:

### README.md Updates:
- ✅ Removed outdated Docker references
- ✅ Updated tech stack to reflect SQLite instead of PostgreSQL
- ✅ Added accurate setup instructions using `setup.py` and `run.py`
- ✅ Updated project structure to match current implementation
- ✅ Added database schema overview
- ✅ Added development guidelines section
- ✅ Included API documentation reference
- ✅ Added contributing guidelines

### .cursor/rules Updates:

1. **architecture.md**: 
   - Added current implementation status
   - Detailed directory structure patterns
   - Added API, database, and frontend patterns

2. **backend-style.md**: 
   - Comprehensive route structure examples
   - Database model patterns with real examples
   - Schema patterns and validation
   - Error handling and authentication patterns

3. **frontend-style.md**: 
   - Component structure guidelines
   - API integration patterns
   - Styling guidelines with Tailwind
   - State management and routing patterns

4. **naming.md**: 
   - Comprehensive naming conventions for all layers
   - Real examples from your codebase
   - Database naming patterns
   - Constants and file naming conventions

5. **development-workflow.md** (new):
   - Setup and development processes
   - Database management
   - API testing guidelines
   - Common development tasks
   - Debugging tips

These updates provide comprehensive documentation that matches your current project structure and implementation patterns. The documentation now serves as a reliable guide for development and onboarding, reflecting the actual state of your contractor app rather than outdated or aspirational information.

---

**User**

So, we'll update these again once we get this ready for deployment (e.g., I assume we're going to add Docker back, Postgres, etc.)?

---

**Cursor**

Absolutely! You're exactly right. The current documentation reflects the **development/MVP state** of the project, but we'll definitely need to update both the README and .cursor/rules when we prepare for production deployment.

Here's what will likely need updating for deployment:

## Expected Production Changes

### Tech Stack Updates
- **Database**: SQLite → PostgreSQL (with proper migrations)
- **Containerization**: Add Docker & Docker Compose back
- **Environment**: Development scripts → Production configs
- **Security**: Enhanced security settings, environment variables
- **Monitoring**: Logging, error tracking, health checks

### Documentation Updates Needed

#### README.md
- Add Docker setup instructions back
- Update database setup (PostgreSQL + migrations)
- Add environment variable configuration
- Include deployment instructions for Vercel/Render
- Add production vs development setup sections
- Update prerequisites (Docker, PostgreSQL)

#### .cursor/rules Updates
- **architecture.md**: Add deployment architecture patterns
- **backend-style.md**: Add production database patterns, migrations
- **development-workflow.md**: Add Docker workflow, production debugging
- **data-modeling.md**: Update for PostgreSQL-specific patterns
- New file: **deployment.md** for production-specific guidelines

#### New Production Patterns
```python
# Production database setup
DATABASE_URL = os.getenv("DATABASE_URL")  # PostgreSQL URL
REDIS_URL = os.getenv("REDIS_URL")        # For caching/sessions

# Docker environment
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
```

### When to Update
I'd recommend updating the documentation in phases:

1. **Pre-deployment**: When we start adding Docker/PostgreSQL
2. **During deployment**: As we configure production environments  
3. **Post-deployment**: Final cleanup with actual production URLs/configs

This way the documentation stays accurate for the current development workflow while we're building features, then gets updated to reflect the production-ready architecture.

Should we create a simple checklist or roadmap of what needs to be updated for production deployment?

```python
# Production database setup
DATABASE_URL = os.getenv("DATABASE_URL")  # PostgreSQL URL
REDIS_URL = os.getenv("REDIS_URL")        # For caching/sessions

# Docker environment
FROM python:3.11-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
```

