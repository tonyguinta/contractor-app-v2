# Project Architecture

This is a fullstack SaaS app for general contractors using:

- Frontend: React + TypeScript + Tailwind CSS
- Backend: FastAPI + SQLAlchemy + Pydantic
- Auth: JWT (no OAuth, no social login)
- Deployment: Frontend on Vercel, Backend on Render

Maintain a clear separation between:
- `frontend/src/api` → For calling backend routes
- `frontend/src/pages` → Page-level React components
- `frontend/src/components` → Reusable building blocks
- `backend/app/api` → FastAPI routers
- `backend/app/models` → SQLAlchemy DB models
- `backend/app/schemas` → Pydantic request/response schemas
- `backend/app/core` → Config, security, and global logic
- `backend/app/services` → Optional business logic (e.g., estimates)

Use RESTful APIs. Avoid GraphQL or WebSocket for MVP.
