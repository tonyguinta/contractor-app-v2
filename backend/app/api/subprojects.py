from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.models import (
    Subproject, Project, User, MaterialEntry, MaterialItem, 
    LaborItem, PermitItem, OtherCostItem
)
from app.schemas.schemas import (
    Subproject as SubprojectSchema, SubprojectCreate, SubprojectUpdate, SubprojectWithItems,
    MaterialEntry as MaterialEntrySchema, MaterialEntryCreate,
    MaterialItem as MaterialItemSchema, MaterialItemCreate, MaterialItemUpdate,
    LaborItem as LaborItemSchema, LaborItemCreate, LaborItemUpdate,
    PermitItem as PermitItemSchema, PermitItemCreate, PermitItemUpdate,
    OtherCostItem as OtherCostItemSchema, OtherCostItemCreate, OtherCostItemUpdate,
    CostSummary
)
from app.core.deps import get_current_active_user
from app.core.constants import DEFAULT_SKIP, DEFAULT_LIMIT

router = APIRouter()

# Subproject CRUD

@router.post("/", response_model=SubprojectSchema)
def create_subproject(
    subproject: SubprojectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify project belongs to current user
    project = db.query(Project).filter(
        Project.id == subproject.project_id, 
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_subproject = Subproject(**subproject.dict())
    db.add(db_subproject)
    db.commit()
    db.refresh(db_subproject)
    return db_subproject

@router.get("/project/{project_id}", response_model=List[SubprojectWithItems])
def get_project_subprojects(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify project belongs to current user
    project = db.query(Project).filter(
        Project.id == project_id, 
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    subprojects = db.query(Subproject).filter(Subproject.project_id == project_id).all()
    return subprojects

@router.get("/{subproject_id}", response_model=SubprojectWithItems)
def get_subproject(
    subproject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    subproject = db.query(Subproject).filter(Subproject.id == subproject_id).first()
    if not subproject:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    # Verify user owns the parent project
    if subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return subproject

@router.put("/{subproject_id}", response_model=SubprojectSchema)
def update_subproject(
    subproject_id: int,
    subproject_update: SubprojectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    subproject = db.query(Subproject).filter(Subproject.id == subproject_id).first()
    if not subproject:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    # Verify user owns the parent project
    if subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = subproject_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(subproject, field, value)
    
    db.commit()
    db.refresh(subproject)
    return subproject

@router.delete("/{subproject_id}")
def delete_subproject(
    subproject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    subproject = db.query(Subproject).filter(Subproject.id == subproject_id).first()
    if not subproject:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    # Verify user owns the parent project
    if subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(subproject)
    db.commit()
    return {"message": "Subproject deleted successfully"}

# Material Entry autocomplete

@router.get("/materials/search", response_model=List[MaterialEntrySchema])
def search_material_entries(
    q: str,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Search material entries for autocomplete"""
    materials = db.query(MaterialEntry).filter(
        MaterialEntry.user_id == current_user.id,
        MaterialEntry.description.ilike(f"%{q}%")
    ).limit(limit).all()
    return materials

@router.post("/materials/entries", response_model=MaterialEntrySchema)
def create_material_entry(
    material: MaterialEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new material entry for autocomplete"""
    # Check if already exists for this user
    existing = db.query(MaterialEntry).filter(
        MaterialEntry.user_id == current_user.id,
        MaterialEntry.description.ilike(material.description)
    ).first()
    
    if existing:
        return existing
    
    db_material = MaterialEntry(**material.dict(), user_id=current_user.id)
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

# Material Items CRUD

@router.post("/{subproject_id}/materials", response_model=MaterialItemSchema)
def create_material_item(
    subproject_id: int,
    material: MaterialItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify subproject access
    subproject = db.query(Subproject).filter(Subproject.id == subproject_id).first()
    if not subproject or subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    material.subproject_id = subproject_id
    db_material = MaterialItem(**material.dict())
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    
    # Save to material entries for future autocomplete
    material_entry = MaterialEntryCreate(
        description=material.description,
        unit=material.unit,
        category=material.category,
        unit_price=material.unit_cost
    )
    try:
        create_material_entry(material_entry, db, current_user)
    except Exception:
        # Ignore if material entry creation fails (e.g., duplicate)
        pass
    
    return db_material

@router.put("/materials/{material_id}", response_model=MaterialItemSchema)
def update_material_item(
    material_id: int,
    material_update: MaterialItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    material = db.query(MaterialItem).filter(MaterialItem.id == material_id).first()
    if not material or material.subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Material item not found")
    
    update_data = material_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(material, field, value)
    
    db.commit()
    db.refresh(material)
    return material

@router.delete("/materials/{material_id}")
def delete_material_item(
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    material = db.query(MaterialItem).filter(MaterialItem.id == material_id).first()
    if not material or material.subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Material item not found")
    
    db.delete(material)
    db.commit()
    return {"message": "Material item deleted successfully"}

# Labor Items CRUD

@router.post("/{subproject_id}/labor", response_model=LaborItemSchema)
def create_labor_item(
    subproject_id: int,
    labor: LaborItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify subproject access
    subproject = db.query(Subproject).filter(Subproject.id == subproject_id).first()
    if not subproject or subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    labor.subproject_id = subproject_id
    db_labor = LaborItem(**labor.dict())
    db.add(db_labor)
    db.commit()
    db.refresh(db_labor)
    return db_labor

@router.put("/labor/{labor_id}", response_model=LaborItemSchema)
def update_labor_item(
    labor_id: int,
    labor_update: LaborItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    labor = db.query(LaborItem).filter(LaborItem.id == labor_id).first()
    if not labor or labor.subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Labor item not found")
    
    update_data = labor_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(labor, field, value)
    
    db.commit()
    db.refresh(labor)
    return labor

@router.delete("/labor/{labor_id}")
def delete_labor_item(
    labor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    labor = db.query(LaborItem).filter(LaborItem.id == labor_id).first()
    if not labor or labor.subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Labor item not found")
    
    db.delete(labor)
    db.commit()
    return {"message": "Labor item deleted successfully"}

# Permit Items CRUD

@router.post("/{subproject_id}/permits", response_model=PermitItemSchema)
def create_permit_item(
    subproject_id: int,
    permit: PermitItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify subproject access
    subproject = db.query(Subproject).filter(Subproject.id == subproject_id).first()
    if not subproject or subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    permit.subproject_id = subproject_id
    db_permit = PermitItem(**permit.dict())
    db.add(db_permit)
    db.commit()
    db.refresh(db_permit)
    return db_permit

@router.put("/permits/{permit_id}", response_model=PermitItemSchema)
def update_permit_item(
    permit_id: int,
    permit_update: PermitItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    permit = db.query(PermitItem).filter(PermitItem.id == permit_id).first()
    if not permit or permit.subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Permit item not found")
    
    update_data = permit_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(permit, field, value)
    
    db.commit()
    db.refresh(permit)
    return permit

@router.delete("/permits/{permit_id}")
def delete_permit_item(
    permit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    permit = db.query(PermitItem).filter(PermitItem.id == permit_id).first()
    if not permit or permit.subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Permit item not found")
    
    db.delete(permit)
    db.commit()
    return {"message": "Permit item deleted successfully"}

# Other Cost Items CRUD

@router.post("/{subproject_id}/other-costs", response_model=OtherCostItemSchema)
def create_other_cost_item(
    subproject_id: int,
    other_cost: OtherCostItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify subproject access
    subproject = db.query(Subproject).filter(Subproject.id == subproject_id).first()
    if not subproject or subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    other_cost.subproject_id = subproject_id
    db_other_cost = OtherCostItem(**other_cost.dict())
    db.add(db_other_cost)
    db.commit()
    db.refresh(db_other_cost)
    return db_other_cost

@router.put("/other-costs/{other_cost_id}", response_model=OtherCostItemSchema)
def update_other_cost_item(
    other_cost_id: int,
    other_cost_update: OtherCostItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    other_cost = db.query(OtherCostItem).filter(OtherCostItem.id == other_cost_id).first()
    if not other_cost or other_cost.subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Other cost item not found")
    
    update_data = other_cost_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(other_cost, field, value)
    
    db.commit()
    db.refresh(other_cost)
    return other_cost

@router.delete("/other-costs/{other_cost_id}")
def delete_other_cost_item(
    other_cost_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    other_cost = db.query(OtherCostItem).filter(OtherCostItem.id == other_cost_id).first()
    if not other_cost or other_cost.subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Other cost item not found")
    
    db.delete(other_cost)
    db.commit()
    return {"message": "Other cost item deleted successfully"}

# Cost Summary

@router.get("/{subproject_id}/cost-summary", response_model=CostSummary)
def get_subproject_cost_summary(
    subproject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    subproject = db.query(Subproject).filter(Subproject.id == subproject_id).first()
    if not subproject or subproject.project.owner_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subproject not found")
    
    # Calculate totals
    total_materials = sum(
        item.quantity * item.unit_cost for item in subproject.material_items
    )
    total_labor = sum(
        item.number_of_workers * item.hourly_rate * item.hours 
        for item in subproject.labor_items
    )
    total_permits = sum(item.cost for item in subproject.permit_items)
    total_other = sum(item.cost for item in subproject.other_cost_items)
    
    return CostSummary(
        total_materials=total_materials,
        total_labor=total_labor,
        total_permits=total_permits,
        total_other=total_other,
        estimated_total=total_materials + total_labor + total_permits + total_other
    ) 