#!/usr/bin/env python3
"""
One-time database cleanup script to remove sales tax columns
This will run as part of the app startup and then exit
"""
import os
import sys
from sqlalchemy import create_engine, text

def cleanup_database():
    """Remove sales tax columns if they exist"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("No DATABASE_URL found, skipping cleanup")
        return
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            print("Removing sales tax columns from projects table...")
            conn.execute(text("""
                ALTER TABLE projects 
                DROP COLUMN IF EXISTS sales_tax_rate,
                DROP COLUMN IF EXISTS sales_tax_amount,
                DROP COLUMN IF EXISTS total_with_tax;
            """))
            conn.commit()
            print("Successfully removed sales tax columns!")
            
    except Exception as e:
        print(f"Error during database cleanup: {e}")
        # Don't fail the app startup if this fails
        pass

if __name__ == "__main__":
    cleanup_database()
    print("Database cleanup complete, exiting...")