# Data Modeling

Use SQLAlchemy models in `models/`, Pydantic schemas in `schemas/`.

Each table model has:
- `id` (int, primary key)
- `created_at`, `updated_at` (datetime)
- Relevant relationships (e.g., one user → many projects)

All datetime fields must use timezone-aware UTC format (`datetime.utcnow()` with `timezone=True`)

Foreign keys must be explicitly defined using:
```python
Column(Integer, ForeignKey("user.id"), nullable=False)
