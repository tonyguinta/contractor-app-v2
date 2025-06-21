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

- SQLite database file: `backend/buildcraftpro.db`
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