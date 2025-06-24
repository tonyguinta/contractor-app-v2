#!/usr/bin/env python3
"""
Simple staging migration using Railway run command
This uses the existing app dependencies
"""

import os
import sys

# Set the DATABASE_URL for staging
staging_db_url = "postgresql://postgres:aoaZQhTcwfvDgRgPGSClbaBXdRQYJwlj@postgres-xwia.railway.internal:5432/railway"

os.environ['DATABASE_URL'] = staging_db_url

# Now import our app components
from app.db.database import engine
from app.models.models import Base
from sqlalchemy import text

def run_migration():
    """Run the migration using SQLAlchemy"""
    
    print("🚀 Starting PostgreSQL migration for staging...")
    
    with engine.connect() as conn:
        # Start a transaction
        trans = conn.begin()
        
        try:
            # Check if sales_tax_rate column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'projects' AND column_name = 'sales_tax_rate'
            """))
            
            if result.fetchone():
                print("✅ Sales tax columns already exist. Migration already completed.")
                return
            
            print("📝 Adding sales tax columns...")
            
            # Add new sales tax columns
            conn.execute(text("ALTER TABLE projects ADD COLUMN sales_tax_rate NUMERIC(8,6) DEFAULT 0.0"))
            conn.execute(text("ALTER TABLE projects ADD COLUMN sales_tax_amount NUMERIC(10,2) DEFAULT 0.0"))
            conn.execute(text("ALTER TABLE projects ADD COLUMN total_with_tax NUMERIC(10,2) DEFAULT 0.0"))
            
            print("🔧 Converting Float columns to Numeric...")
            
            # Convert existing Float columns to Numeric for projects table
            financial_columns = [
                'estimated_cost', 'actual_cost', 'labor_cost', 
                'material_cost', 'permit_cost', 'other_cost'
            ]
            
            for column in financial_columns:
                conn.execute(text(f"""
                    ALTER TABLE projects 
                    ALTER COLUMN {column} TYPE NUMERIC(10,2) 
                    USING {column}::NUMERIC(10,2)
                """))
                print(f"  ✓ Converted {column}")
            
            # Convert task hours columns
            conn.execute(text("ALTER TABLE tasks ALTER COLUMN estimated_hours TYPE NUMERIC(8,2) USING estimated_hours::NUMERIC(8,2)"))
            conn.execute(text("ALTER TABLE tasks ALTER COLUMN actual_hours TYPE NUMERIC(8,2) USING actual_hours::NUMERIC(8,2)"))
            print("  ✓ Converted task hours")
            
            # Convert invoice columns
            conn.execute(text("ALTER TABLE invoices ALTER COLUMN amount TYPE NUMERIC(10,2) USING amount::NUMERIC(10,2)"))
            conn.execute(text("ALTER TABLE invoices ALTER COLUMN tax_rate TYPE NUMERIC(8,6) USING tax_rate::NUMERIC(8,6)"))
            conn.execute(text("ALTER TABLE invoices ALTER COLUMN tax_amount TYPE NUMERIC(10,2) USING tax_amount::NUMERIC(10,2)"))
            conn.execute(text("ALTER TABLE invoices ALTER COLUMN total_amount TYPE NUMERIC(10,2) USING total_amount::NUMERIC(10,2)"))
            print("  ✓ Converted invoice columns")
            
            # Convert material and cost item columns
            conn.execute(text("ALTER TABLE material_entries ALTER COLUMN unit_price TYPE NUMERIC(10,2) USING unit_price::NUMERIC(10,2)"))
            conn.execute(text("ALTER TABLE material_items ALTER COLUMN quantity TYPE NUMERIC(10,3) USING quantity::NUMERIC(10,3)"))
            conn.execute(text("ALTER TABLE material_items ALTER COLUMN unit_cost TYPE NUMERIC(10,2) USING unit_cost::NUMERIC(10,2)"))
            conn.execute(text("ALTER TABLE labor_items ALTER COLUMN hourly_rate TYPE NUMERIC(8,2) USING hourly_rate::NUMERIC(8,2)"))
            conn.execute(text("ALTER TABLE labor_items ALTER COLUMN hours TYPE NUMERIC(8,2) USING hours::NUMERIC(8,2)"))
            conn.execute(text("ALTER TABLE permit_items ALTER COLUMN cost TYPE NUMERIC(10,2) USING cost::NUMERIC(10,2)"))
            conn.execute(text("ALTER TABLE other_cost_items ALTER COLUMN cost TYPE NUMERIC(10,2) USING cost::NUMERIC(10,2)"))
            print("  ✓ Converted cost tracking columns")
            
            # Commit the transaction
            trans.commit()
            
            print("\n✅ Migration completed successfully!")
            print("All Float columns converted to Numeric for precise financial calculations")
            print("Sales tax columns added with default values")
            
            # Verify the changes
            result = conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'projects' 
                ORDER BY column_name
            """))
            
            columns = result.fetchall()
            print(f"\n📊 Projects table now has {len(columns)} columns:")
            for col_name, col_type in columns:
                print(f"  {col_name}: {col_type}")
                
        except Exception as e:
            print(f"❌ Migration failed: {e}")
            trans.rollback()
            raise

if __name__ == "__main__":
    run_migration()