from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import Project, User, Client, CompanySettings
from app.schemas.schemas import Project as ProjectSchema, ProjectCreate, ProjectUpdate, ProjectWithClient
from app.core.deps import get_current_active_user
from app.core.constants import DEFAULT_SKIP, DEFAULT_LIMIT
from app.utils.calculations import calculate_project_totals, get_company_default_tax_rate

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
    
    # Create project with user data
    project_data = project.dict()
    project_data['owner_id'] = current_user.id
    
    # Set default tax rate if not provided
    if project_data.get('sales_tax_rate') is None:
        default_tax_rate = get_company_default_tax_rate(current_user.id, db)
        project_data['sales_tax_rate'] = default_tax_rate
    
    db_project = Project(**project_data)
    
    # Calculate tax totals
    tax_calculations = calculate_project_totals(db_project, db)
    db_project.sales_tax_amount = tax_calculations['sales_tax_amount']
    db_project.total_with_tax = tax_calculations['total_with_tax']
    
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
    
    # Recalculate tax totals after any update
    tax_calculations = calculate_project_totals(project, db)
    project.sales_tax_amount = tax_calculations['sales_tax_amount']
    project.total_with_tax = tax_calculations['total_with_tax']
    
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