from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    company_name: Optional[str] = None
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Client schemas
class ClientBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    company: Optional[str] = None
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(ClientBase):
    name: Optional[str] = None

class Client(ClientBase):
    id: int
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "planning"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_cost: Optional[float] = 0.0
    labor_cost: Optional[float] = 0.0
    material_cost: Optional[float] = 0.0
    permit_cost: Optional[float] = 0.0
    other_cost: Optional[float] = 0.0

class ProjectCreate(ProjectBase):
    client_id: int

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    client_id: Optional[int] = None
    actual_cost: Optional[float] = None

class Project(ProjectBase):
    id: int
    actual_cost: float
    created_at: datetime
    updated_at: Optional[datetime]
    owner_id: int
    client_id: int

    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    estimated_hours: Optional[float] = 0.0
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    project_id: int

class TaskUpdate(TaskBase):
    title: Optional[str] = None
    actual_hours: Optional[float] = None
    completed_at: Optional[datetime] = None

class Task(TaskBase):
    id: int
    actual_hours: float
    completed_at: Optional[datetime]
    created_at: datetime
    project_id: int

    class Config:
        from_attributes = True

# Invoice schemas
class InvoiceBase(BaseModel):
    title: str
    description: Optional[str] = None
    amount: float
    tax_rate: Optional[float] = 0.0
    issue_date: datetime
    due_date: datetime

class InvoiceCreate(InvoiceBase):
    client_id: int
    project_id: Optional[int] = None

class InvoiceUpdate(InvoiceBase):
    title: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    paid_date: Optional[datetime] = None

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    tax_amount: float
    total_amount: float
    status: str
    paid_date: Optional[datetime]
    created_at: datetime
    owner_id: int
    client_id: int
    project_id: Optional[int]

    class Config:
        from_attributes = True

# Response schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectWithClient(Project):
    client: Client

class InvoiceWithClient(Invoice):
    client: Client
    project: Optional[Project] = None 