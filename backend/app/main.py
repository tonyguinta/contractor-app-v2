import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, clients, projects, invoices, tasks, subprojects, company
from app.db.database import engine
from app.models import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BuildCraftPro API",
    description="A SaaS web application for general contractors",
    version="1.0.0"
)

# Configure CORS
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "http://localhost:5173",
    "https://app.buildcraftpro.com",  # Production frontend
    "https://app-staging.buildcraftpro.com"  # Staging frontend
]

# Add additional frontend URL from environment (for flexibility)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

# Legacy support for CORS_ORIGINS (but FRONTEND_URL is preferred)
cors_origins = os.getenv("CORS_ORIGINS")
if cors_origins and cors_origins not in allowed_origins:
    allowed_origins.append(cors_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(subprojects.router, prefix="/api/subprojects", tags=["subprojects"])
app.include_router(company.router, prefix="/api/company", tags=["company"])

@app.get("/")
async def root():
    return {"message": "BuildCraftPro API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 