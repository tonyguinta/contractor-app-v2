-- PostgreSQL Migration for Staging: Add sales tax columns and convert to Numeric
-- Run this in Railway database console

-- First, check if sales_tax_rate column already exists
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'sales_tax_rate';

-- Add new sales tax columns
ALTER TABLE projects ADD COLUMN sales_tax_rate NUMERIC(8,6) DEFAULT 0.0;
ALTER TABLE projects ADD COLUMN sales_tax_amount NUMERIC(10,2) DEFAULT 0.0;
ALTER TABLE projects ADD COLUMN total_with_tax NUMERIC(10,2) DEFAULT 0.0;

-- Convert existing Float columns to Numeric for projects table
ALTER TABLE projects ALTER COLUMN estimated_cost TYPE NUMERIC(10,2) USING estimated_cost::NUMERIC(10,2);
ALTER TABLE projects ALTER COLUMN actual_cost TYPE NUMERIC(10,2) USING actual_cost::NUMERIC(10,2);
ALTER TABLE projects ALTER COLUMN labor_cost TYPE NUMERIC(10,2) USING labor_cost::NUMERIC(10,2);
ALTER TABLE projects ALTER COLUMN material_cost TYPE NUMERIC(10,2) USING material_cost::NUMERIC(10,2);
ALTER TABLE projects ALTER COLUMN permit_cost TYPE NUMERIC(10,2) USING permit_cost::NUMERIC(10,2);
ALTER TABLE projects ALTER COLUMN other_cost TYPE NUMERIC(10,2) USING other_cost::NUMERIC(10,2);

-- Convert task hours columns
ALTER TABLE tasks ALTER COLUMN estimated_hours TYPE NUMERIC(8,2) USING estimated_hours::NUMERIC(8,2);
ALTER TABLE tasks ALTER COLUMN actual_hours TYPE NUMERIC(8,2) USING actual_hours::NUMERIC(8,2);

-- Convert invoice columns
ALTER TABLE invoices ALTER COLUMN amount TYPE NUMERIC(10,2) USING amount::NUMERIC(10,2);
ALTER TABLE invoices ALTER COLUMN tax_rate TYPE NUMERIC(8,6) USING tax_rate::NUMERIC(8,6);
ALTER TABLE invoices ALTER COLUMN tax_amount TYPE NUMERIC(10,2) USING tax_amount::NUMERIC(10,2);
ALTER TABLE invoices ALTER COLUMN total_amount TYPE NUMERIC(10,2) USING total_amount::NUMERIC(10,2);

-- Convert material and cost item columns
ALTER TABLE material_entries ALTER COLUMN unit_price TYPE NUMERIC(10,2) USING unit_price::NUMERIC(10,2);
ALTER TABLE material_items ALTER COLUMN quantity TYPE NUMERIC(10,3) USING quantity::NUMERIC(10,3);
ALTER TABLE material_items ALTER COLUMN unit_cost TYPE NUMERIC(10,2) USING unit_cost::NUMERIC(10,2);
ALTER TABLE labor_items ALTER COLUMN hourly_rate TYPE NUMERIC(8,2) USING hourly_rate::NUMERIC(8,2);
ALTER TABLE labor_items ALTER COLUMN hours TYPE NUMERIC(8,2) USING hours::NUMERIC(8,2);
ALTER TABLE permit_items ALTER COLUMN cost TYPE NUMERIC(10,2) USING cost::NUMERIC(10,2);
ALTER TABLE other_cost_items ALTER COLUMN cost TYPE NUMERIC(10,2) USING cost::NUMERIC(10,2);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY column_name;