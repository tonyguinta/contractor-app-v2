# Deployment Guide

This guide outlines the deployment process for BuildCraftPro across different environments.

## Environment Overview

### Local Development
- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend**: http://localhost:8000 (FastAPI with hot reload)
- **Database**: SQLite (`backend/buildcraftpro.db`)

### Staging Environment
- **Frontend**: https://staging.buildcraftpro.com (Vercel preview)
- **Backend**: https://staging-api.buildcraftpro.com (Railway staging)
- **Database**: PostgreSQL (Railway staging database)

### Production Environment
- **Frontend**: https://app.buildcraftpro.com (Vercel production)
- **Backend**: https://api.buildcraftpro.com (Railway production)
- **Database**: PostgreSQL (Railway production database)

## Deployment Pipeline

### 1. Local Development → Staging
```bash
# Make your changes locally
git add .
git commit -m "feat: your feature description"

# Push to staging branch for testing
git push origin staging
```

### 2. Staging → Production
```bash
# Create PR from staging to main
gh pr create --base main --head staging --title "Release: staging to production"

# After review and approval, merge to main
# This triggers automatic production deployment
```

## Environment Setup Instructions

### Railway Staging Environment Setup

1. **Create Staging Environment**
   - Log into Railway dashboard
   - Navigate to BuildCraftPro project
   - Create new environment called "staging"

2. **Add Services to Staging**
   - Add PostgreSQL database service
   - Add web service for backend
   - Configure custom domain: `staging-api.buildcraftpro.com`

3. **Configure Environment Variables**
   ```
   DATABASE_URL=postgresql://[staging-db-url]
   SECRET_KEY=[generate-new-secret]
   CORS_ORIGINS=https://staging.buildcraftpro.com
   ```

4. **Deploy Backend**
   - Connect to staging branch
   - Use `railway.staging.toml` configuration
   - Deploy with: `railway up`

### Vercel Staging Environment Setup

1. **Configure Preview Deployments**
   - Log into Vercel dashboard
   - Navigate to BuildCraftPro frontend project
   - Enable preview deployments for staging branch

2. **Set Environment Variables**
   ```
   VITE_API_URL=https://staging-api.buildcraftpro.com/api
   ```

3. **Configure Custom Domain**
   - Add custom domain: `staging.buildcraftpro.com`
   - Point to staging branch deployments

## DNS Configuration

Add these DNS records in Squarespace:

### Staging Environment
```
Type: CNAME
Host: staging
Value: cname.vercel-dns.com

Type: CNAME  
Host: staging-api
Value: [railway-staging-domain].railway.app
```

### Production Environment (existing)
```
Type: CNAME
Host: app
Value: cname.vercel-dns.com

Type: CNAME
Host: api  
Value: [railway-production-domain].railway.app
```

## Branch Protection Rules

Configure GitHub branch protection for `main`:
- Require pull request reviews
- Require status checks to pass (CI/CD)
- Require branches to be up to date
- Restrict pushes to main branch

## Deployment Checklist

### Before Deploying to Staging
- [ ] All tests pass locally
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint:strict`)
- [ ] Database migrations tested locally

### Before Deploying to Production
- [ ] Feature tested thoroughly in staging
- [ ] Performance verified in staging
- [ ] Database backup created
- [ ] Stakeholder approval obtained

## Emergency Rollback

### Frontend (Vercel)
```bash
# Rollback to previous deployment via Vercel dashboard
# Or redeploy previous commit
vercel --prod
```

### Backend (Railway)
```bash
# Rollback to previous deployment
railway redeploy [PREVIOUS_DEPLOYMENT_ID]
```

## Monitoring

- **Frontend**: Monitor via Vercel dashboard and browser console
- **Backend**: Monitor via Railway logs and health checks
- **Database**: Monitor via Railway PostgreSQL metrics
- **Uptime**: Consider adding Uptime Robot or similar service

## Common Issues

### HTTPS/HTTP Mixed Content
- Ensure all API endpoints use HTTPS in production/staging
- Avoid trailing slashes on resource-specific endpoints
- Check CORS_ORIGINS environment variable

### Database Connection Issues
- Verify DATABASE_URL environment variable
- Check Railway database service status
- Ensure proper connection pooling

### Build Failures
- Check environment variables are set correctly
- Verify all dependencies are in package.json
- Check for TypeScript compilation errors