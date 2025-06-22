# Database Reset Guide

This guide explains how to reset your database with the new schema changes (required `updated_at` field for User model).

## Changes Made

- **User model**: Added required `updated_at` field with `server_default=func.now()`
- **User schema**: Made `updated_at` field required instead of optional
- **Clean start**: All tables will be recreated with the updated schema

## Local Development (SQLite)

### Option 1: Using the Reset Script (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run the reset script (will prompt for confirmation)
python3 reset_database.py

# Or skip confirmation prompt
python3 reset_database.py --confirm
```

### Option 2: Manual Reset

```bash
# Navigate to backend directory
cd backend

# Remove the SQLite database file
rm buildcraftpro.db

# Start your FastAPI server - tables will be recreated automatically
python3 main.py
# or
uvicorn main:app --reload
```

## Production (PostgreSQL)

### Option 1: Using the Reset Script (Recommended)

```bash
# Set your production DATABASE_URL environment variable
export DATABASE_URL="postgresql://username:password@host:port/database"

# Run the reset script
python3 reset_database.py --confirm
```

### Option 2: Manual PostgreSQL Reset

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL

# Drop all tables (be careful!)
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

# Exit psql
\q

# Deploy your application - tables will be recreated
```

### Option 3: Railway/Heroku Deployment

If you're using Railway or Heroku:

```bash
# For Railway
railway run python3 reset_database.py --confirm

# For Heroku
heroku run python3 reset_database.py --confirm -a your-app-name
```

## Verification

After resetting, verify the new schema:

### SQLite
```bash
# Check the schema
sqlite3 buildcraftpro.db ".schema users"
```

### PostgreSQL
```sql
-- Connect to database
psql $DATABASE_URL

-- Check the users table structure
\d users

-- Verify updated_at field exists and is not nullable
SELECT column_name, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'updated_at';
```

## What Happens Next

1. **All existing data will be lost** (as intended for test data cleanup)
2. **New User records** will have both `created_at` and `updated_at` set to current timestamp
3. **User updates** will automatically update the `updated_at` field
4. **API responses** will include the `updated_at` field as required (not optional)

## Rollback (Emergency)

If you need to rollback the changes:

1. **Revert the model changes** in `backend/app/models/models.py`
2. **Revert the schema changes** in `backend/app/schemas/schemas.py`
3. **Run the reset script again** to apply the old schema

## Testing the Changes

After reset, test that the `updated_at` field works:

```python
# Create a user
user = User(email="test@example.com", full_name="Test User")
db.add(user)
db.commit()

# Check that both created_at and updated_at are set
print(f"Created: {user.created_at}")
print(f"Updated: {user.updated_at}")

# Update the user
user.full_name = "Updated Name"
db.commit()

# Check that updated_at changed
print(f"New Updated: {user.updated_at}")
``` 