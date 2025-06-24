#!/usr/bin/env python3
"""
PostgreSQL Migration Script - Add sales tax columns and convert to Numeric types
Run this against staging first, then production
"""

import os
import sys
import psycopg2
from urllib.parse import urlparse

def get_database_url():
    """Get DATABASE_URL from environment or Railway"""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        print("Run: railway variables --environment staging")
        print("Copy the DATABASE_URL and run: DATABASE_URL='...' python migrate_postgresql.py")
        sys.exit(1)
    return database_url

def migrate_postgresql(database_url):
    """Run the PostgreSQL migration"""
    print(f"Migrating PostgreSQL database...")
    
    # Parse the database URL
    parsed = urlparse(database_url)
    
    try:
        # Connect to PostgreSQL
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port,
            database=parsed.path[1:],  # Remove leading slash
            user=parsed.username,
            password=parsed.password
        )
        
        cursor = conn.cursor()
        
        # Check if sales_tax_rate column already exists
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'sales_tax_rate'
        """)
        
        if cursor.fetchone():
            print("Sales tax columns already exist. Migration already completed.")
            return
        
        print("Adding sales tax columns...")
        
        # Add new sales tax columns
        cursor.execute("ALTER TABLE projects ADD COLUMN sales_tax_rate NUMERIC(8,6) DEFAULT 0.0")
        cursor.execute("ALTER TABLE projects ADD COLUMN sales_tax_amount NUMERIC(10,2) DEFAULT 0.0") 
        cursor.execute("ALTER TABLE projects ADD COLUMN total_with_tax NUMERIC(10,2) DEFAULT 0.0")
        
        print("Converting existing columns to Numeric types...")
        
        # Convert existing Float columns to Numeric
        # PostgreSQL allows this conversion since the data is compatible
        financial_columns = [
            ('estimated_cost', 'NUMERIC(10,2)'),
            ('actual_cost', 'NUMERIC(10,2)'),
            ('labor_cost', 'NUMERIC(10,2)'),
            ('material_cost', 'NUMERIC(10,2)'),
            ('permit_cost', 'NUMERIC(10,2)'),
            ('other_cost', 'NUMERIC(10,2)')
        ]
        
        for column_name, new_type in financial_columns:
            cursor.execute(f"""
                ALTER TABLE projects 
                ALTER COLUMN {column_name} TYPE {new_type} 
                USING {column_name}::{new_type}
            """)
            print(f"  ✓ Converted {column_name} to {new_type}")
        
        # Convert task hours columns
        cursor.execute("ALTER TABLE tasks ALTER COLUMN estimated_hours TYPE NUMERIC(8,2) USING estimated_hours::NUMERIC(8,2)")
        cursor.execute("ALTER TABLE tasks ALTER COLUMN actual_hours TYPE NUMERIC(8,2) USING actual_hours::NUMERIC(8,2)")
        print("  ✓ Converted task hours columns")
        
        # Convert invoice columns
        cursor.execute("ALTER TABLE invoices ALTER COLUMN amount TYPE NUMERIC(10,2) USING amount::NUMERIC(10,2)")
        cursor.execute("ALTER TABLE invoices ALTER COLUMN tax_rate TYPE NUMERIC(8,6) USING tax_rate::NUMERIC(8,6)")
        cursor.execute("ALTER TABLE invoices ALTER COLUMN tax_amount TYPE NUMERIC(10,2) USING tax_amount::NUMERIC(10,2)")
        cursor.execute("ALTER TABLE invoices ALTER COLUMN total_amount TYPE NUMERIC(10,2) USING total_amount::NUMERIC(10,2)")
        print("  ✓ Converted invoice columns")
        
        # Convert material and cost item columns
        cursor.execute("ALTER TABLE material_entries ALTER COLUMN unit_price TYPE NUMERIC(10,2) USING unit_price::NUMERIC(10,2)")
        cursor.execute("ALTER TABLE material_items ALTER COLUMN quantity TYPE NUMERIC(10,3) USING quantity::NUMERIC(10,3)")
        cursor.execute("ALTER TABLE material_items ALTER COLUMN unit_cost TYPE NUMERIC(10,2) USING unit_cost::NUMERIC(10,2)")
        cursor.execute("ALTER TABLE labor_items ALTER COLUMN hourly_rate TYPE NUMERIC(8,2) USING hourly_rate::NUMERIC(8,2)")
        cursor.execute("ALTER TABLE labor_items ALTER COLUMN hours TYPE NUMERIC(8,2) USING hours::NUMERIC(8,2)")
        cursor.execute("ALTER TABLE permit_items ALTER COLUMN cost TYPE NUMERIC(10,2) USING cost::NUMERIC(10,2)")
        cursor.execute("ALTER TABLE other_cost_items ALTER COLUMN cost TYPE NUMERIC(10,2) USING cost::NUMERIC(10,2)")
        print("  ✓ Converted cost tracking columns")
        
        # Commit the transaction
        conn.commit()
        
        print("\n✅ Migration completed successfully!")
        print("All Float columns converted to Numeric for precise financial calculations")
        print("Sales tax columns added with default values")
        
        # Verify the changes
        cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'projects' ORDER BY column_name")
        columns = cursor.fetchall()
        print(f"\nProjects table now has {len(columns)} columns:")
        for col_name, col_type in columns:
            print(f"  {col_name}: {col_type}")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        if 'conn' in locals():
            conn.rollback()
        raise
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    database_url = get_database_url()
    migrate_postgresql(database_url)