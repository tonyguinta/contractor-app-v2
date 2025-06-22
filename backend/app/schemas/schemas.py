from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime
from app.core.constants import (
    PROJECT_STATUSES, PROJECT_STATUS_PLANNING,
    TASK_STATUSES, TASK_STATUS_PENDING,
    TASK_PRIORITIES, TASK_PRIORITY_MEDIUM,
    INVOICE_STATUSES, INVOICE_STATUS_DRAFT
)

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
    updated_at: datetime

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
    updated_at: Optional[datetime]
    owner_id: int

    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[Literal["planning", "in_progress", "completed", "on_hold"]] = PROJECT_STATUS_PLANNING
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
    status: Optional[Literal["pending", "in_progress", "completed"]] = TASK_STATUS_PENDING
    priority: Optional[Literal["low", "medium", "high"]] = TASK_PRIORITY_MEDIUM
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
    updated_at: Optional[datetime]
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
    status: Optional[Literal["draft", "sent", "paid", "overdue"]] = None
    paid_date: Optional[datetime] = None

class Invoice(InvoiceBase):
    id: int
    invoice_number: str
    tax_amount: float
    total_amount: float
    status: Literal["draft", "sent", "paid", "overdue"]
    paid_date: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
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

# Subproject schemas

class SubprojectBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[Literal["planning", "in_progress", "completed"]] = "planning"

class SubprojectCreate(SubprojectBase):
    project_id: int

class SubprojectUpdate(SubprojectBase):
    title: Optional[str] = None

class Subproject(SubprojectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    project_id: int

    class Config:
        from_attributes = True

# Material Entry schemas (for autocomplete)

class MaterialEntryBase(BaseModel):
    description: str
    unit: str
    category: Optional[str] = None
    unit_price: Optional[float] = None

class MaterialEntryCreate(MaterialEntryBase):
    pass

class MaterialEntry(MaterialEntryBase):
    id: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

# Material Item schemas

class MaterialItemBase(BaseModel):
    description: str
    unit: str
    quantity: float
    unit_cost: float
    category: Optional[str] = None

class MaterialItemCreate(MaterialItemBase):
    subproject_id: int

class MaterialItemUpdate(MaterialItemBase):
    description: Optional[str] = None
    unit: Optional[str] = None
    quantity: Optional[float] = None
    unit_cost: Optional[float] = None

class MaterialItem(MaterialItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    subproject_id: int

    class Config:
        from_attributes = True

# Labor Item schemas

class LaborItemBase(BaseModel):
    role: str
    number_of_workers: int
    hourly_rate: float
    hours: float

class LaborItemCreate(LaborItemBase):
    subproject_id: int

class LaborItemUpdate(LaborItemBase):
    role: Optional[str] = None
    number_of_workers: Optional[int] = None
    hourly_rate: Optional[float] = None
    hours: Optional[float] = None

class LaborItem(LaborItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    subproject_id: int

    class Config:
        from_attributes = True

# Permit Item schemas

class PermitItemBase(BaseModel):
    description: str
    cost: float
    issued_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    notes: Optional[str] = None

class PermitItemCreate(PermitItemBase):
    subproject_id: int

class PermitItemUpdate(PermitItemBase):
    description: Optional[str] = None
    cost: Optional[float] = None

class PermitItem(PermitItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    subproject_id: int

    class Config:
        from_attributes = True

# Other Cost Item schemas

class OtherCostItemBase(BaseModel):
    description: str
    cost: float
    notes: Optional[str] = None

class OtherCostItemCreate(OtherCostItemBase):
    subproject_id: int

class OtherCostItemUpdate(OtherCostItemBase):
    description: Optional[str] = None
    cost: Optional[float] = None

class OtherCostItem(OtherCostItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    subproject_id: int

    class Config:
        from_attributes = True

# Detailed response schemas with nested data

class SubprojectWithItems(Subproject):
    material_items: List[MaterialItem] = []
    labor_items: List[LaborItem] = []
    permit_items: List[PermitItem] = []
    other_cost_items: List[OtherCostItem] = []

class ProjectWithSubprojects(Project):
    client: Client
    subprojects: List[SubprojectWithItems] = []

# Cost summary schemas

class CostSummary(BaseModel):
    total_materials: float
    total_labor: float
    total_permits: float
    total_other: float
    estimated_total: float 