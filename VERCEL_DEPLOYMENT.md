# Vercel Deployment Guide - CAPD Platform

## Overview

This guide explains how to deploy the CAPD Communications platform to Vercel, including both the frontend (HTML pages) and the API server (serverless functions).

---

## What Gets Deployed

### Frontend
- `index.html` - Landing page
- `tv.html` - Digital TV page
- `admin/dashboard.html` - Admin panel
- `admin/cms.js` - Admin logic
- `news.html`, `projects.html`, `videos.html`, etc.
- All CSS, images, and static assets

### Backend (Serverless Functions)
- `api/channels.js` - Channel CRUD operations
- `api/streams.js` - Stream management
- `api/health.js` - Health check endpoint

### Database
- Connected to Supabase PostgreSQL
- No separate hosting needed for database

---

## Prerequisites

### Required
1. **GitHub Account** - For version control and Vercel integration
2. **Supabase Account** - For PostgreSQL database
3. **Vercel Account** - For deployment (free tier available)
4. **Git Installed** - For pushing code

### Not Required on Vercel
- RTMP Server (local only)
- HLS Transcoder (local only)
- Node.js (Vercel handles it)

---

## Step 1: Prepare Your Repository

### 1.1 Commit Changes
```bash
cd C:\Users\Tech Oracle\Documents\GitHub\CAPD

git add .
git commit -m "Add Vercel deployment configuration and serverless API functions"
```

### 1.2 Push to GitHub
```bash
git push origin main
```

Make sure your GitHub repository is up to date with all changes:
- ✅ Updated `vercel.json`
- ✅ New `api/` directory with serverless functions
- ✅ Updated admin CMS and TV page
- ✅ All documentation files

---

## Step 2: Connect Vercel to GitHub

### 2.1 Link Your Repository
1. Go to https://vercel.com
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Search for `CAPD` or your repository name
5. Select your repository
6. Click **"Import"**

### 2.2 Configure Project Settings
1. **Framework Preset**: Leave as "Other" (Vercel auto-detects)
2. **Build Command**: `npm install`
3. **Install Command**: `npm install`
4. **Output Directory**: `.` (current directory)

Click **"Deploy"**

---

## Step 3: Set Environment Variables

### 3.1 Add Supabase Credentials

After deploying, you need to set environment variables:

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add the following variables:

**Variable 1: SUPABASE_URL**
- Name: `SUPABASE_URL`
- Value: `https://yuzqfrybmpxeqqxtewyl.supabase.co`
- Environments: Production, Preview, Development
- Click **"Add"**

**Variable 2: SUPABASE_ANON_KEY**
- Name: `SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enFmcnlibXB4ZXFxeHRld3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjE1NzYsImV4cCI6MjA3OTg5NzU3Nn0.m_vwoLx449WZoRWzZsYIUf0MD8G_EMpwUDIpIGZ-Z-8`
- Environments: Production, Preview, Development
- Click **"Add"**

### 3.2 Redeploy After Adding Variables

1. Go to **"Deployments"** tab
2. Find the latest deployment
3. Click **"..."** menu
4. Select **"Redeploy"**
5. Confirm redeployment

The API will now have access to the Supabase database.

---

## Step 4: Verify Deployment

### 4.1 Check Frontend
Visit your Vercel domain in browser:
```
https://your-project-name.vercel.app/
```

You should see:
- ✅ Landing page loads
- ✅ TV page works
- ✅ Admin panel accessible
- ✅ No 404 errors

### 4.2 Check API Health
Test the API health endpoint:
```bash
curl https://your-project-name.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "CAPD API Server (Vercel)",
  "database": "Supabase",
  "environment": "production",
  "timestamp": "2024-11-28T...",
  "uptime": 123.456
}
```

### 4.3 Check Channels Endpoint
```bash
curl https://your-project-name.vercel.app/api/channels
```

Should return:
```json
{
  "channels": [...]
}
```

### 4.4 Test TV Page Data Loading
1. Go to TV page on Vercel domain
2. Open browser DevTools (F12)
3. Go to Console
4. Should see: "Loaded channels from database API"
5. Channels should display

---

## Step 5: Configure Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to Vercel project **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `capd.ng`)
4. Add DNS records (Vercel will show instructions)
5. Wait for DNS propagation (can take 24-48 hours)

### 5.2 Update API URLs in Code
If using custom domain, update TV page and admin panel:

**tv.html** (line ~401):
```javascript
const apiUrl = 'https://capd.ng/api/channels';
```

**admin/cms.js** (line ~208):
```javascript
const apiUrl = 'https://capd.ng/api/channels';
```

---

## Step 6: Set Up Continuous Deployment

### 6.1 Automatic Deployments
By default, every push to main branch triggers auto-deployment:

```bash
# Make changes locally
git add .
git commit -m "Update channels"
git push origin main

# Vercel automatically deploys
# Check status at vercel.com dashboard
```

### 6.2 Disable Auto-Deployment (if needed)
1. Go to **"Settings"** → **"Git"**
2. Toggle **"Deploy on push"**

---

## Step 7: Supabase Database Setup

### Important: Set Up Database Table

Before deploying, ensure your Supabase has the channels table:

1. Go to Supabase dashboard
2. Click **"SQL Editor"**
3. Run this SQL:

```sql
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  description TEXT,
  streamUrl TEXT NOT NULL,
  status TEXT DEFAULT 'offline',
  viewers INTEGER DEFAULT 0,
  type TEXT,
  poster TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

✅ Table created

---

## API Endpoints on Vercel

### GET /api/channels
```bash
curl https://your-project.vercel.app/api/channels
```

### POST /api/channels
```bash
curl -X POST https://your-project.vercel.app/api/channels \
  -H "Content-Type: application/json" \
  -d '{"channels": [...]}'
```

### GET /api/streams
```bash
curl https://your-project.vercel.app/api/streams
```

### POST /api/streams
```bash
curl -X POST https://your-project.vercel.app/api/streams \
  -H "Content-Type: application/json" \
  -d '{"name": "Channel", "streamUrl": "..."}'
```

### GET /api/health
```bash
curl https://your-project.vercel.app/api/health
```

---

## Monitoring & Logs

### 1. Check Deployment Status
1. Go to Vercel project dashboard
2. Click **"Deployments"** tab
3. See all deployments and their status

### 2. View Function Logs
1. Click on a deployment
2. Click **"Functions"** tab
3. Select API function to see logs

### 3. Monitor Performance
1. Go to **"Analytics"** tab
2. See:
   - Request rate
   - Response time
   - Bandwidth usage
   - Error rate

---

## Troubleshooting

### Issue: API Returns 500 Error

**Solution:**
1. Check Supabase credentials in environment variables
2. Verify table exists in Supabase
3. Check API logs in Vercel dashboard
4. Redeploy after adding/fixing environment variables

### Issue: Channels Not Loading on TV Page

**Solution:**
1. Check API health: `curl https://domain/api/health`
2. Check channels endpoint: `curl https://domain/api/channels`
3. Check browser console for CORS errors
4. Verify TV page is pointing to correct API URL

### Issue: Admin Panel Can't Save

**Solution:**
1. Check API is accessible
2. Verify POST to `/api/channels` works
3. Check database has write permissions
4. Look at Vercel function logs

### Issue: 404 Not Found for API

**Solution:**
1. Verify `vercel.json` rewrites are correct
2. Check `api/` directory exists with `.js` files
3. Ensure file names match URLs:
   - `api/channels.js` → `/api/channels`
   - `api/health.js` → `/api/health`
3. Redeploy

---

## Environment-Specific URLs

### Local Development
```
Frontend: http://localhost:3000
API: http://localhost:3001/api/channels
```

### Vercel Preview (Pull Requests)
```
Frontend: https://capd-git-feature.vercel.app
API: https://capd-git-feature.vercel.app/api/channels
```

### Vercel Production
```
Frontend: https://capd.vercel.app (or custom domain)
API: https://capd.vercel.app/api/channels (or custom domain)
```

### Update API URLs
TV page and admin panel automatically detect the environment:

```javascript
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api/channels'
  : `${window.location.origin}/api/channels`;
```

---

## Limitations & Considerations

### Vercel Functions
- ✅ 10GB bandwidth/month (free tier)
- ✅ 100 concurrent executions
- ✅ 30-second timeout per request
- ✅ 1GB execution memory

### What's NOT on Vercel
- ❌ RTMP Server (run locally)
- ❌ HLS Transcoder (run locally)
- ❌ Database (using Supabase)

### For Streaming Features
Use Vercel for frontend + API, but run RTMP/HLS locally:

```bash
# Local development
npm run both  # Starts API, RTMP, HLS

# Production
# Frontend on Vercel
# API on Vercel
# RTMP/HLS on separate server (AWS EC2, DigitalOcean, etc.)
```

---

## Performance Tips

### 1. Caching
- API responses cached in localStorage
- TV page uses offline cache
- Admin panel syncs with database

### 2. Code Splitting
- Separate API functions for each endpoint
- Frontend loads only needed files

### 3. Database Queries
- Indexed by `number` and `status`
- Ordered by channel number
- Minimal data transfer

### 4. CDN
- Vercel auto-CDNs static files
- Static assets served from edge locations
- API requests go to origin

---

## Security Best Practices

### 1. Environment Variables
✅ Store all secrets in Vercel dashboard
❌ Never commit `.env` to GitHub

### 2. CORS
- API allows requests from any origin
- Update for production if needed

### 3. Database Access
- Use Supabase Row Level Security (RLS)
- Restrict table access in Supabase

### 4. Authentication
- Add auth layer for admin panel
- Use JWT tokens or similar

---

## Backup & Recovery

### Backup Database
1. Go to Supabase dashboard
2. Click **"Backups"** (if available)
3. Create manual backup

### Export Data
```bash
curl https://your-project.vercel.app/api/channels \
  > channels-backup.json
```

### Restore Data
```bash
curl -X POST https://your-project.vercel.app/api/channels \
  -H "Content-Type: application/json" \
  -d @channels-backup.json
```

---

## Next Steps

1. ✅ Commit code to GitHub
2. ✅ Connect Vercel to GitHub
3. ✅ Deploy
4. ✅ Set environment variables
5. ✅ Redeploy after env vars
6. ✅ Test all endpoints
7. ✅ Set up custom domain (optional)
8. ✅ Monitor performance

---

## Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Check Logs**: Vercel Dashboard → Deployments → Logs
- **Health Check**: `https://your-domain/api/health`

---

## Deployment Status

- Frontend: ✅ Deployed on Vercel
- API: ✅ Serverless functions on Vercel
- Database: ✅ Supabase PostgreSQL
- RTMP/HLS: 🔄 Run locally or on separate server

---

**Last Updated**: 2024-11-28
**Status**: Production Ready
