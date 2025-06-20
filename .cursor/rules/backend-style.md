# Backend Code Style

- Use **FastAPI** for all route handling.
- Group routes by feature (`projects.py`, `auth.py`, `estimates.py`, etc.).
- Use **Pydantic** for request/response models.
- Use **SQLAlchemy ORM**, not raw SQL.
- Inject DB sessions using FastAPI's dependency system.
- Always validate user input using Pydantic.

Example route structure:
```python
@router.post("/projects/")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
