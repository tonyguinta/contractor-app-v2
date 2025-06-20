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
