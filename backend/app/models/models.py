from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Numeric
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
    company_settings = relationship("CompanySettings", back_populates="user")

class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    default_sales_tax_rate = Column(Numeric(6, 6), default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Foreign key
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    user = relationship("User", back_populates="company_settings")

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
    estimated_cost = Column(Numeric(10,2), default=0.0)
    actual_cost = Column(Numeric(10,2), default=0.0)
    labor_cost = Column(Numeric(10,2), default=0.0)
    material_cost = Column(Numeric(10,2), default=0.0)
    permit_cost = Column(Numeric(10,2), default=0.0)
    other_cost = Column(Numeric(10,2), default=0.0)
    sales_tax_rate = Column(Numeric(6, 6), default=0.0)
    sales_tax_amount = Column(Numeric(10, 2), default=0.0)
    is_tax_exempt = Column(Boolean, default=False)
    total_with_tax = Column(Numeric(10, 2), default=0.0)
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
    subprojects = relationship("Subproject", back_populates="project")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    status = Column(String, default=TASK_STATUS_PENDING)  # pending, in_progress, completed
    priority = Column(String, default=TASK_PRIORITY_MEDIUM)  # low, medium, high
    estimated_hours = Column(Numeric(8,2), default=0.0)
    actual_hours = Column(Numeric(8,2), default=0.0)
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
    amount = Column(Numeric(10,2))
    tax_rate = Column(Numeric(6,6), default=0.0)
    tax_amount = Column(Numeric(10,2), default=0.0)
    total_amount = Column(Numeric(10,2))
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


# New models for subproject cost tracking

class Subproject(Base):
    __tablename__ = "subprojects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(String, default="planning")  # planning, in_progress, completed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key
    project_id = Column(Integer, ForeignKey("projects.id"))

    # Relationships
    project = relationship("Project", back_populates="subprojects")
    material_items = relationship("MaterialItem", back_populates="subproject", cascade="all, delete-orphan")
    labor_items = relationship("LaborItem", back_populates="subproject", cascade="all, delete-orphan")
    permit_items = relationship("PermitItem", back_populates="subproject", cascade="all, delete-orphan")
    other_cost_items = relationship("OtherCostItem", back_populates="subproject", cascade="all, delete-orphan")


class MaterialEntry(Base):
    """Global material entries for autocomplete"""
    __tablename__ = "material_entries"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    unit = Column(String)
    category = Column(String)
    unit_price = Column(Numeric(10,2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    user = relationship("User")


class MaterialItem(Base):
    __tablename__ = "material_items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    unit = Column(String)
    quantity = Column(Numeric(8,2))
    unit_cost = Column(Numeric(10,2))
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key
    subproject_id = Column(Integer, ForeignKey("subprojects.id"))

    # Relationships
    subproject = relationship("Subproject", back_populates="material_items")


class LaborItem(Base):
    __tablename__ = "labor_items"

    id = Column(Integer, primary_key=True, index=True)
    role = Column(String)
    number_of_workers = Column(Integer)
    hourly_rate = Column(Numeric(8,2))
    hours = Column(Numeric(8,2))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key
    subproject_id = Column(Integer, ForeignKey("subprojects.id"))

    # Relationships
    subproject = relationship("Subproject", back_populates="labor_items")


class PermitItem(Base):
    __tablename__ = "permit_items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    cost = Column(Numeric(10,2))
    issued_date = Column(DateTime)
    expiration_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key
    subproject_id = Column(Integer, ForeignKey("subprojects.id"))

    # Relationships
    subproject = relationship("Subproject", back_populates="permit_items")


class OtherCostItem(Base):
    __tablename__ = "other_cost_items"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    cost = Column(Numeric(10,2))
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Foreign key
    subproject_id = Column(Integer, ForeignKey("subprojects.id"))

    # Relationships
    subproject = relationship("Subproject", back_populates="other_cost_items") 