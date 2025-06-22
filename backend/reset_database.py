#!/usr/bin/env python3
"""
Database Reset Script

This script drops all tables and recreates them with the updated schema.
Use this when you need a clean database with schema changes.

Usage:
    python reset_database.py [--confirm]
"""

import os
import sys
import argparse
from sqlalchemy import text
from app.db.database import engine, Base
from app.models.models import User, Client, Project, Task, Invoice

def reset_database(confirm=False):
    """Drop all tables and recreate them."""
    
    database_url = os.getenv("DATABASE_URL", "sqlite:///./buildcraftpro.db")
    
    if not confirm:
        print(f"🚨 WARNING: This will DELETE ALL DATA in database: {database_url}")
        print("\nThis action cannot be undone!")
        response = input("\nAre you sure you want to continue? (yes/no): ")
        if response.lower() not in ['yes', 'y']:
            print("❌ Database reset cancelled.")
            return False
    
    try:
        print(f"🔄 Resetting database: {database_url}")
        
        # Drop all tables
        print("🗑️  Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        # Create all tables with new schema
        print("🏗️  Creating tables with updated schema...")
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database reset completed successfully!")
        print("\n📊 Tables created:")
        print("   - users (with updated_at field)")
        print("   - clients")
        print("   - projects") 
        print("   - tasks")
        print("   - invoices")
        
        return True
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Reset the database')
    parser.add_argument('--confirm', action='store_true', 
                       help='Skip confirmation prompt')
    args = parser.parse_args()
    
    success = reset_database(confirm=args.confirm)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 