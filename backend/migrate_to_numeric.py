#!/usr/bin/env python3
"""
Migration script to convert Float columns to Numeric and add sales tax fields.
This handles the schema migration for existing SQLite databases.
"""

import sqlite3
import os
from pathlib import Path

def migrate_database():
    """Migrate the SQLite database to use Numeric types and add sales tax fields"""
    
    # Find the database file
    db_path = Path(__file__).parent / "buildcraftpro.db"
    
    if not db_path.exists():
        print("No existing database found. Creating fresh database with correct schema.")
        return
    
    print(f"Migrating database at: {db_path}")
    
    # Backup the original database
    backup_path = db_path.with_suffix('.db.backup')
    import shutil
    shutil.copy2(db_path, backup_path)
    print(f"Backup created at: {backup_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if sales_tax_rate column already exists
        cursor.execute("PRAGMA table_info(projects)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'sales_tax_rate' in columns:
            print("Sales tax columns already exist. Skipping migration.")
            return
        
        print("Adding sales tax columns to projects table...")
        
        # Add the new sales tax columns
        cursor.execute("ALTER TABLE projects ADD COLUMN sales_tax_rate NUMERIC(8,6) DEFAULT 0.0")
        cursor.execute("ALTER TABLE projects ADD COLUMN sales_tax_amount NUMERIC(10,2) DEFAULT 0.0") 
        cursor.execute("ALTER TABLE projects ADD COLUMN total_with_tax NUMERIC(10,2) DEFAULT 0.0")
        
        # Note: SQLite doesn't support changing column types directly
        # The Float->Numeric conversion will happen at the SQLAlchemy level
        # SQLite stores both as REAL internally, so data is preserved
        
        conn.commit()
        print("Migration completed successfully!")
        
        # Verify the new columns exist
        cursor.execute("PRAGMA table_info(projects)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Projects table now has columns: {columns}")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()