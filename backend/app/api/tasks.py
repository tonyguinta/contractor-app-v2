from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db
from app.models.models import Task, Project, User
from app.schemas.schemas import Task as TaskSchema, TaskCreate, TaskUpdate
from app.core.deps import get_current_active_user

router = APIRouter()

@router.post("/", response_model=TaskSchema)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify project belongs to current user
    project = db.query(Project).filter(
        Project.id == task.project_id, 
        Project.owner_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/", response_model=List[TaskSchema])
def get_tasks(
    project_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Base query - only tasks from projects owned by current user
    query = db.query(Task).join(Project).filter(Project.owner_id == current_user.id)
    
    # Apply filters
    if project_id:
        query = query.filter(Task.project_id == project_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    
    # Order by due date (nulls last), then created date
    query = query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
    
    return query.offset(skip).limit(limit).all()

@router.get("/{task_id}", response_model=TaskSchema)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    task = db.query(Task).join(Project).filter(
        Task.id == task_id,
        Project.owner_id == current_user.id
    ).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskSchema)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    task = db.query(Task).join(Project).filter(
        Task.id == task_id,
        Project.owner_id == current_user.id
    ).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    
    # Auto-set completed_at when status changes to completed
    if update_data.get('status') == 'completed' and task.status != 'completed':
        update_data['completed_at'] = datetime.utcnow()
    elif update_data.get('status') != 'completed' and task.status == 'completed':
        update_data['completed_at'] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    task = db.query(Task).join(Project).filter(
        Task.id == task_id,
        Project.owner_id == current_user.id
    ).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"} 