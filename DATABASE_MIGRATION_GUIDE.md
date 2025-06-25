# Database Migration Guide

This guide covers how to handle database schema changes in BuildCraftPro, including data type conversions and adding new columns.

## Migration Philosophy

### Local Development (SQLite)
- **Manual migrations** for schema changes
- **Backup before migration** to prevent data loss
- **Test migrations** thoroughly before production

### Production (PostgreSQL)
- **Railway automatic migrations** when possible
- **Manual migration scripts** for complex changes
- **Blue-green deployment** for zero-downtime migrations

## Float to Numeric Migration (Completed)

### Problem
- Float data types cause precision errors in financial calculations
- Rounding errors compound over time
- Legal compliance requires exact monetary calculations

### Solution
Converted all financial fields from `Float` to `Numeric`:
- Currency: `Numeric(10, 2)` - up to $99,999,999.99
- Tax rates: `Numeric(8, 6)` - precise percentages
- Hours: `Numeric(8, 2)` - precise time tracking
- Quantities: `Numeric(10, 3)` - precise measurements

### Migration Process

1. **Backup Database**
   ```bash
   cp backend/buildcraftpro.db backend/buildcraftpro.db.backup
   ```

2. **Update Models**
   - Changed all `Column(Float)` to `Column(Numeric(precision, scale))`
   - Added `from decimal import Decimal` imports
   - Updated calculation functions to use `Decimal` arithmetic

3. **Add New Columns** (SQLite)
   ```sql
   ALTER TABLE projects ADD COLUMN sales_tax_rate NUMERIC(8,6) DEFAULT 0.0;
   ALTER TABLE projects ADD COLUMN sales_tax_amount NUMERIC(10,2) DEFAULT 0.0;
   ALTER TABLE projects ADD COLUMN total_with_tax NUMERIC(10,2) DEFAULT 0.0;
   ```

4. **Data Preservation**
   - SQLite stores both Float and Numeric as REAL internally
   - Data is automatically preserved during column type changes
   - SQLAlchemy handles conversion to Python `Decimal` objects

### Results
- ✅ Existing data preserved (2 projects maintained their values)
- ✅ New columns added with proper defaults
- ✅ Financial calculations now use exact arithmetic
- ✅ Database backup created for safety

## Migration Best Practices

### Before Any Migration
1. **Stop the application** to prevent concurrent modifications
2. **Create database backup** with timestamp
3. **Test migration** on a copy of production data
4. **Prepare rollback plan** in case of issues

### Migration Script Template
```python
#!/usr/bin/env python3
"""
Migration: [Description of changes]
Date: [YYYY-MM-DD]
"""

import sqlite3
from pathlib import Path
import shutil

def migrate_database():
    db_path = Path(__file__).parent / "buildcraftpro.db"
    
    # Create backup
    backup_path = db_path.with_suffix(f'.db.backup.{datetime.now().strftime("%Y%m%d_%H%M%S")}')
    shutil.copy2(db_path, backup_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check current schema
        cursor.execute("PRAGMA table_info(table_name)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Perform migration
        # ... migration code here ...
        
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
```

### Production Migration (PostgreSQL)
```sql
-- Example: Adding new column with default
ALTER TABLE projects ADD COLUMN new_field NUMERIC(10,2) DEFAULT 0.0;

-- Example: Changing column type (requires careful planning)
ALTER TABLE projects ALTER COLUMN old_field TYPE NUMERIC(10,2) USING old_field::NUMERIC(10,2);
```

## Common Migration Scenarios

### Adding New Column
```python
cursor.execute("ALTER TABLE table_name ADD COLUMN new_column NUMERIC(10,2) DEFAULT 0.0")
```

### Creating New Table
```python
cursor.execute("""
CREATE TABLE new_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
```

### Data Migration
```python
# Update existing records with calculated values
cursor.execute("""
UPDATE projects 
SET total_with_tax = (labor_cost + material_cost + permit_cost + other_cost) * (1 + sales_tax_rate)
WHERE total_with_tax = 0.0
""")
```

## Rollback Procedures

### SQLite Rollback
```bash
# Stop application
# Restore from backup
cp backend/buildcraftpro.db.backup backend/buildcraftpro.db
# Restart application
```

### PostgreSQL Rollback
```sql
-- Begin transaction for safety
BEGIN;

-- Reverse the migration (example)
ALTER TABLE projects DROP COLUMN new_column;

-- Commit only if everything looks good
COMMIT;
```

## Testing Migrations

### Pre-Migration Checklist
- [ ] Database backup created
- [ ] Migration script tested on development data
- [ ] Rollback procedure verified
- [ ] Application compatibility confirmed

### Post-Migration Verification
- [ ] All existing data preserved
- [ ] New columns/tables created correctly
- [ ] Application starts without errors
- [ ] Sample queries return expected results
- [ ] Financial calculations produce correct results

## Future Migration Notes

**CRITICAL: Always use Numeric for financial data**
- Never use Float for money, percentages, or quantities
- Use appropriate precision for the data type
- Test calculations with edge cases (very small/large numbers)
- Verify tax calculations for legal compliance