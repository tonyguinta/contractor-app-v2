#!/usr/bin/env python3
"""
Script to remove sales tax columns from PostgreSQL databases
"""
import os
import psycopg2
from urllib.parse import urlparse

def remove_sales_tax_columns(database_url):
    """Remove sales tax columns from projects table"""
    try:
        # Parse the database URL
        parsed = urlparse(database_url)
        
        # Connect to database
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port,
            database=parsed.path[1:],  # Remove leading slash
            user=parsed.username,
            password=parsed.password
        )
        
        cursor = conn.cursor()
        
        # Remove sales tax columns
        print("Removing sales tax columns from projects table...")
        cursor.execute("""
            ALTER TABLE projects 
            DROP COLUMN IF EXISTS sales_tax_rate,
            DROP COLUMN IF EXISTS sales_tax_amount,
            DROP COLUMN IF EXISTS total_with_tax;
        """)
        
        # Commit the changes
        conn.commit()
        print("Successfully removed sales tax columns!")
        
        # Close connection
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error removing sales tax columns: {e}")
        raise

if __name__ == "__main__":
    # Get database URL from environment or command line
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Please set DATABASE_URL environment variable")
        exit(1)
    
    remove_sales_tax_columns(database_url)