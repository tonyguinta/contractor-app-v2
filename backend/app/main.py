from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, clients, projects, invoices
from app.db.database import engine
from app.models import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Contractor App API",
    description="A SaaS web application for general contractors",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(clients.router, prefix="/api/clients", tags=["clients"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])

@app.get("/")
async def root():
    return {"message": "Contractor App API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 