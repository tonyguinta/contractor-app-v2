# Railway CLI Reference

This is a comprehensive reference for Railway CLI commands, extracted from [Railway CLI Documentation](https://docs.railway.com/reference/cli-api).

## Installation & Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link project (run in project directory)
railway link
```

## Logs & Debugging

```bash
# View logs
railway logs                    # Most recent deployment logs
railway logs --deployment       # Deployment logs specifically
railway logs --build           # Build process logs
railway logs [DEPLOYMENT_ID]   # Logs for specific deployment

# Project status
railway status                  # View project and deployment status
```

## Database Management

```bash
# Connect to database shell
railway connect                 # Opens appropriate database client
                                # Postgres: psql
                                # Redis: redis-cli  
                                # MongoDB: mongosh
                                # MySQL: mysql

# Note: Requires database client installed in system PATH
```

## Deployment Management

```bash
# Deploy and redeploy
railway up                      # Deploy current directory
railway redeploy               # Redeploy latest version of service
railway down                   # Remove most recent deployment

# Service management
railway service                # Manage services in project
```

## Environment & Variables

```bash
# Environment management
railway environment            # Manage environments
railway environment use [ENV]  # Switch to specific environment

# Variable management  
railway variables              # View environment variables
railway variables set KEY=VALUE # Set environment variable
railway variables unset KEY    # Remove environment variable

# Run commands with project environment
railway run [COMMAND]          # Execute command with project env vars
```

## Project Management

```bash
# Project operations
railway link                   # Link local directory to Railway project
railway unlink                 # Unlink local directory
railway open                   # Open project in Railway dashboard
railway logout                 # Logout from Railway CLI
```

## Database-Specific Commands (via railway connect)

### PostgreSQL Commands
```sql
-- Table inspection
\d                             -- List all tables
\d [table_name]                -- Describe table structure
\dt                            -- List tables only
\l                             -- List databases

-- Migration history
SELECT * FROM alembic_version;  -- Check current migration version
SELECT version_num FROM alembic_version; -- Get just the version

-- Column inspection
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'projects';

-- Check if specific columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name LIKE '%markup%';
```

### Common Debugging Queries
```sql
-- Check table existence
SELECT tablename FROM pg_tables WHERE tablename = 'markup_changes';

-- Check database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- List all schemas
SELECT schema_name FROM information_schema.schemata;

-- Check active connections
SELECT pid, usename, application_name, client_addr, state 
FROM pg_stat_activity;
```

## Troubleshooting Workflows

### Database Migration Issues
1. **Check deployment logs**: `railway logs --deployment`
2. **Connect to database**: `railway connect`
3. **Verify migration state**: `SELECT * FROM alembic_version;`
4. **Check table structure**: `\d projects` and `\d company_settings`
5. **Force redeploy if needed**: `railway redeploy`

### Build/Deployment Failures
1. **Check build logs**: `railway logs --build`
2. **Check deployment logs**: `railway logs --deployment`
3. **Verify environment**: `railway variables`
4. **Check project status**: `railway status`

### Environment Variable Issues
1. **List all variables**: `railway variables`
2. **Check specific variable**: Look for DATABASE_URL, SECRET_KEY, etc.
3. **Update if needed**: `railway variables set KEY=VALUE`

### Database Connection Problems
1. **Test connection**: `railway connect`
2. **Check DATABASE_URL**: `railway variables | grep DATABASE`
3. **Verify database service**: `railway status`

## Best Practices

### Security
- Never commit Railway tokens or credentials
- Use `railway variables` for sensitive configuration
- Regularly rotate database passwords

### Development Workflow
- Use `railway environment` to separate staging/production
- Test migrations in staging before production
- Keep deployment logs for debugging
- Use `railway run` for one-off commands with proper environment

### Debugging Tips
- Always check build logs before deployment logs
- Use `railway connect` for direct database inspection
- Environment variables take precedence over .env files
- Database clients must be installed locally for `railway connect`

## Environment-Specific Commands

```bash
# Staging environment
railway environment use staging
railway logs --deployment
railway connect

# Production environment  
railway environment use production
railway variables
railway status
```

## Integration with BuildCraftPro

### Common Commands for This Project
```bash
# Check Alembic migration status
railway connect
SELECT * FROM alembic_version;

# Verify markup columns exist
\d projects
\d company_settings

# Check for markup_changes table
\d markup_changes

# Force migration rerun (if needed)
railway redeploy

# Check environment variables
railway variables | grep -E "(DATABASE_URL|SECRET_KEY|VITE_API_URL)"
```

### Deployment Debugging
```bash
# Full debugging sequence
railway status                 # Overall health
railway logs --build          # Build issues
railway logs --deployment     # Runtime issues  
railway variables             # Environment check
railway connect               # Database inspection
```

## Notes

- **Database Client Requirements**: `railway connect` requires the appropriate database client (psql, redis-cli, etc.) to be installed and available in your system PATH
- **Environment Context**: Most commands operate in the context of your currently linked project and environment
- **Deployment IDs**: Can be found in Railway dashboard or via `railway status`
- **Logs Retention**: Railway retains logs for a limited time period