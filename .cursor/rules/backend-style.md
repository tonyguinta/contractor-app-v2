# Backend Code Style

## Core Principles

- Use **FastAPI** for all route handling
- Group routes by feature (`auth.py`, `clients.py`, `projects.py`, `invoices.py`)
- Use **Pydantic** for all request/response models
- Use **SQLAlchemy ORM**, not raw SQL
- Inject DB sessions using FastAPI's dependency system (`Depends(get_db)`)
- Always validate user input using Pydantic schemas
- Protect routes with JWT authentication (`Depends(get_current_user)`)

## Route Structure Pattern

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_user
from app.models.models import User, Client
from app.schemas.schemas import ClientCreate, ClientResponse

router = APIRouter()

@router.post("/clients/", response_model=ClientResponse)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Implementation here
    pass
```

## Database Model Patterns

- All models must include `id`, `created_at` fields
- Use proper foreign key relationships
- Include `updated_at` for mutable entities
- Use timezone-aware datetime fields

```python
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    owner = relationship("User", back_populates="projects")
```

## Schema Patterns

- Create separate schemas for Create, Update, and Response
- Use proper validation and field types
- Include examples for API documentation

```python
class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class ClientResponse(BaseModel):
    id: int
    name: str
    email: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## Error Handling

- Use HTTPException for API errors
- Return appropriate HTTP status codes
- Provide clear error messages

```python
if not client:
    raise HTTPException(status_code=404, detail="Client not found")
```

## Authentication Pattern

- All protected routes must use `get_current_user` dependency
- JWT tokens are validated automatically
- User ownership is enforced in route handlers

```python
@router.get("/clients/", response_model=List[ClientResponse])
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Client).filter(Client.owner_id == current_user.id).all()
```
