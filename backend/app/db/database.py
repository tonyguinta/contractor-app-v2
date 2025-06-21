import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get database URL from environment variable or use default
database_url = os.getenv("DATABASE_URL")
if not database_url:
    # Default to SQLite for development
    database_url = "sqlite:///./buildcraftpro.db"

# Handle SQLite-specific connection arguments
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

SQLALCHEMY_DATABASE_URL = database_url

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 