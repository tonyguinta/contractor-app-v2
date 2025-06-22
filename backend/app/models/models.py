from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
from app.core.constants import (
    PROJECT_STATUS_PLANNING,
    TASK_STATUS_PENDING,
    TASK_PRIORITY_MEDIUM,
    INVOICE_STATUS_DRAFT
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    company_name = Column(String)
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    clients = relationship("Client", back_populates="owner")
    projects = relationship("Project", back_populates="owner")
    invoices = relationship("Invoice", back_populates="owner")

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    address = Column(Text)
    company = Column(String)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    owner = relationship("User", back_populates="clients")
    projects = relationship("Project", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    status = Column(String, default=PROJECT_STATUS_PLANNING)  # planning, in_progress, completed, on_hold
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    estimated_cost = Column(Float, default=0.0)
    actual_cost = Column(Float, default=0.0)
    labor_cost = Column(Float, default=0.0)
    material_cost = Column(Float, default=0.0)
    permit_cost = Column(Float, default=0.0)
    other_cost = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))

    # Relationships
    owner = relationship("User", back_populates="projects")
    client = relationship("Client", back_populates="projects")
    tasks = relationship("Task", back_populates="project")
    invoices = relationship("Invoice", back_populates="project")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    status = Column(String, default=TASK_STATUS_PENDING)  # pending, in_progress, completed
    priority = Column(String, default=TASK_PRIORITY_MEDIUM)  # low, medium, high
    estimated_hours = Column(Float, default=0.0)
    actual_hours = Column(Float, default=0.0)
    due_date = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key
    project_id = Column(Integer, ForeignKey("projects.id"))

    # Relationships
    project = relationship("Project", back_populates="tasks")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(Text)
    amount = Column(Float)
    tax_rate = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float)
    status = Column(String, default=INVOICE_STATUS_DRAFT)  # draft, sent, paid, overdue
    issue_date = Column(DateTime)
    due_date = Column(DateTime)
    paid_date = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"))
    client_id = Column(Integer, ForeignKey("clients.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))

    # Relationships
    owner = relationship("User", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    project = relationship("Project", back_populates="invoices") 