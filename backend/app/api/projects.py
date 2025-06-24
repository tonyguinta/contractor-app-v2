from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from app.db.database import get_db
from app.models.models import Project, User, Client
from app.schemas.schemas import Project as ProjectSchema, ProjectCreate, ProjectUpdate, ProjectWithClient
from app.core.deps import get_current_active_user
from app.core.constants import DEFAULT_SKIP, DEFAULT_LIMIT

router = APIRouter()

@router.post("/", response_model=ProjectSchema)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify client belongs to current user
    client = db.query(Client).filter(Client.id == project.client_id, Client.owner_id == current_user.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db_project = Project(**project.dict(), owner_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/", response_model=List[ProjectWithClient])
def read_projects(
    skip: int = DEFAULT_SKIP,
    limit: int = DEFAULT_LIMIT,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    projects = db.query(Project).filter(Project.owner_id == current_user.id).offset(skip).limit(limit).all()
    return projects

@router.get("/{project_id}", response_model=ProjectWithClient)
def read_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

def calculate_project_totals(project: Project):
    """Calculate sales tax and total project cost"""
    # Ensure all values are Decimal for precise calculations
    labor_cost = Decimal(str(project.labor_cost or 0))
    material_cost = Decimal(str(project.material_cost or 0))
    permit_cost = Decimal(str(project.permit_cost or 0))
    other_cost = Decimal(str(project.other_cost or 0))
    tax_rate = Decimal(str(project.sales_tax_rate or 0))
    
    # Calculate subtotal (sum of all cost categories)
    subtotal = labor_cost + material_cost + permit_cost + other_cost
    
    # Calculate sales tax amount
    project.sales_tax_amount = subtotal * tax_rate
    
    # Calculate total with tax
    project.total_with_tax = subtotal + project.sales_tax_amount
    
    # Update actual_cost to reflect subtotal
    project.actual_cost = subtotal

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # If client_id is being updated, verify it belongs to current user
    if project_update.client_id:
        client = db.query(Client).filter(Client.id == project_update.client_id, Client.owner_id == current_user.id).first()
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
    
    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    # Recalculate totals if cost fields or tax rate changed
    cost_fields = ['labor_cost', 'material_cost', 'permit_cost', 'other_cost', 'sales_tax_rate']
    if any(field in update_data for field in cost_fields):
        calculate_project_totals(project)
    
    db.commit()
    db.refresh(project)
    return project

@router.post("/{project_id}/calculate-tax", response_model=ProjectSchema)
def calculate_tax(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Recalculate sales tax and totals for a project"""
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    calculate_project_totals(project)
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"} 