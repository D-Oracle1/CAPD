# CAPD Platform - Complete Setup & Deployment Guide

## Table of Contents

1. **Overview** - What you have
2. **Architecture** - How it works
3. **Quick Start** - Get running in 5 minutes
4. **Deployment** - Deploy to Vercel
5. **Operations** - Run & manage

---

## Overview

### What is CAPD?

CAPD Communications is a complete digital TV platform with:
- 📺 Multi-channel TV streaming
- 👨‍💼 Professional admin panel
- 🎬 Live streaming support (RTMP/HLS)
- 📱 Responsive design
- ☁️ Cloud database
- 🔄 Real-time sync

### What You Have Now

✅ **Frontend** - Landing, TV, Admin pages
✅ **Backend** - Express API with Supabase
✅ **Database** - Supabase PostgreSQL
✅ **Deployment Ready** - Vercel configuration
✅ **Documentation** - Complete guides

---

## Architecture

### Production Architecture

```
Users → Vercel CDN → Frontend (HTML/CSS/JS)
Users → Vercel API → Serverless Functions → Supabase
Admin → Vercel API → Database Updates
```

### Components

| Component | Provider | Purpose |
|-----------|----------|---------|
| **Frontend** | Vercel | Landing, TV, Admin pages |
| **API Server** | Vercel Functions | Channel management |
| **Database** | Supabase | Data persistence |
| **RTMP Server** | Local/Separate | Live streaming input |
| **HLS Transcoder** | Local/Separate | Video transcoding |

### Data Flow

```
Admin Panel
    ↓
Vercel API
    ↓
Supabase Database ← → TV Page
    ↓
LocalStorage Cache
```

---

## Quick Start (Local)

### 1. Install Dependencies
```bash
cd CAPD
npm install
```

### 2. Start Services
```bash
npm run both
```

This starts:
- API Server (port 3001)
- RTMP Server (port 1935)
- HLS Transcoder

### 3. Access Platform

| Component | URL | Credentials |
|-----------|-----|-------------|
| **Landing** | http://localhost/ | None |
| **TV Page** | http://localhost/tv.html | None |
| **Admin Panel** | http://localhost/admin/dashboard.html | admin/capd2025 |
| **API** | http://localhost:3001/api/channels | None |

### 4. Test Full Flow

1. Open admin panel
2. Add a channel
3. Go to TV page
4. See channel appear ✅

---

## Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account
- Supabase account

### Step-by-Step

#### 1. Prepare Repository
```bash
git status           # Check all files committed
git push origin main # Push to GitHub
```

#### 2. Import to Vercel
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Click "Deploy"

#### 3. Set Environment Variables
In Vercel Settings → Environment Variables:

```
SUPABASE_URL = https://yuzqfrybmpxeqqxtewyl.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4. Redeploy
Go to Deployments and click "Redeploy" to use new env vars.

#### 5. Test Live
Visit your Vercel domain and test:
- Frontend loads
- API responds
- Admin panel works
- TV page syncs

### Result

- Frontend: `https://your-project.vercel.app`
- API: `https://your-project.vercel.app/api/channels`
- Admin: `https://your-project.vercel.app/admin/dashboard.html`

---

## Operations Guide

### Local Development

#### Start All Services
```bash
npm run both
```

#### Start Individual Services
```bash
npm run api-server      # API only
npm run rtmp-server     # RTMP only
npm run hls-transcoder  # HLS only
```

#### Develop & Deploy
```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel auto-deploys in 2-3 minutes
```

### Production (Vercel)

#### Monitor
1. Go to Vercel dashboard
2. Check "Deployments" tab
3. View logs and analytics

#### Update
```bash
# Local development
git push origin main

# Automatic deployment on Vercel
```

#### Rollback (if needed)
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Database (Supabase)

#### Backup
1. Go to Supabase dashboard
2. Click "Backups"
3. Create manual backup

#### Monitor
1. Check table stats
2. Monitor query performance
3. View API usage

---

## File Structure

```
CAPD/
├── api/                          # Vercel serverless functions
│   ├── channels.js              # Channel CRUD
│   ├── streams.js               # Stream management
│   └── health.js                # Health check
├── admin/
│   ├── dashboard.html           # Admin panel
│   ├── cms.js                   # Admin logic (uses API)
│   └── index.html               # Login page
├── tv.html                      # TV page (loads from API)
├── index.html                   # Landing page
├── vercel.json                  # Vercel config
├── api-server.js                # Local API (development)
├── rtmp-server.js               # RTMP server (local)
├── hls-transcoder.js            # HLS transcoding (local)
├── package.json                 # Dependencies
├── data/                        # Default channel data (fallback)
└── DOCUMENTATION/
    ├── DEPLOY_NOW.md            # Quick deployment guide
    ├── VERCEL_DEPLOYMENT.md     # Full Vercel guide
    ├── DEPLOYMENT_CHECKLIST.md  # Pre/post deployment
    ├── DATABASE_MIGRATION.md    # Database setup
    ├── QUICK_START.md           # Quick reference
    └── MIGRATION_SUMMARY.md     # Changes summary
```

---

## API Reference

### Channels Endpoint

#### GET /api/channels
```bash
curl https://domain/api/channels
```
Response:
```json
{
  "channels": [
    {
      "id": "ch-123",
      "name": "Channel 1",
      "number": 1,
      "streamUrl": "https://...",
      "status": "live",
      "viewers": 250
    }
  ]
}
```

#### POST /api/channels
```bash
curl -X POST https://domain/api/channels \
  -H "Content-Type: application/json" \
  -d '{"channels": [...]}'
```

### Streams Endpoint

#### GET /api/streams
```bash
curl https://domain/api/streams
```

#### POST /api/streams
```bash
curl -X POST https://domain/api/streams \
  -H "Content-Type: application/json" \
  -d '{"name": "Channel", "streamUrl": "..."}'
```

### Health Endpoint

#### GET /api/health
```bash
curl https://domain/api/health
```

---

## Troubleshooting

### Local Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process: `lsof -i :3001` |
| API not responding | Start: `npm run api-server` |
| Database error | Check Supabase connection |
| Admin won't save | Check API is running |

### Deployment Issues

| Issue | Solution |
|-------|----------|
| API 502 error | Check env vars, redeploy |
| Channels not loading | Check `/api/health` |
| Admin can't save | Check POST to API |
| 404 on API | Check vercel.json rewrites |

### Database Issues

| Issue | Solution |
|-------|----------|
| No data | Check table exists |
| Can't connect | Check credentials |
| Slow queries | Add indexes |
| Out of space | Upgrade plan |

---

## Deployment Checklist

### Before Deploying
- [ ] Code committed to GitHub
- [ ] All tests pass locally
- [ ] API responses correct
- [ ] Admin panel works
- [ ] TV page loads
- [ ] No console errors

### Deployment Steps
- [ ] Import to Vercel
- [ ] Set environment variables
- [ ] Redeploy
- [ ] Test all features
- [ ] Monitor logs

### Post-Deployment
- [ ] Test frontend
- [ ] Test API endpoints
- [ ] Test admin panel
- [ ] Test TV page
- [ ] Monitor analytics
- [ ] Set up alerts

---

## Performance Tips

### Frontend
- Static files cached globally
- CSS/JS optimized
- Images compressed

### API
- Response cached locally
- Database indexed
- Minimal data transfer

### Database
- Tables indexed by common queries
- Data normalized
- Automatic backups

---

## Security Best Practices

1. **Environment Variables**
   - Store all secrets in Vercel
   - Never commit to GitHub
   - Rotate regularly

2. **Database Access**
   - Use Row Level Security (RLS)
   - Restrict table access
   - Audit queries

3. **API Security**
   - CORS configured
   - Input validation
   - Error handling

4. **Admin Panel**
   - Change default password
   - Enable 2FA (if available)
   - Regular backups

---

## Support

### Documentation
- `DEPLOY_NOW.md` - Quick deployment
- `VERCEL_DEPLOYMENT.md` - Detailed guide
- `DEPLOYMENT_CHECKLIST.md` - Checklist
- `DATABASE_MIGRATION.md` - Database
- `QUICK_START.md` - Quick reference

### Help
1. Check documentation
2. Check API health: `/api/health`
3. Check Vercel logs
4. Check browser console
5. Check Supabase logs

### Resources
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
- GitHub: https://docs.github.com

---

## Next Steps

1. ✅ Read **DEPLOY_NOW.md** for quick deployment
2. ✅ Deploy to Vercel (5 minutes)
3. ✅ Test all features
4. ✅ Monitor performance
5. ✅ Keep documentation updated

---

## Version History

| Date | Version | Status |
|------|---------|--------|
| 2024-11-28 | 2.0 | Production Ready |
| 2024-11-28 | 1.5 | Database Migration |
| 2024-11-28 | 1.0 | Initial Release |

---

## License

CAPD Communications Platform - All Rights Reserved

---

## Contact

📧 info@capd.ng
📱 +234 801 234 5678
🕐 24/7 Support

---

**You're all set for production!** 🚀

Start with **DEPLOY_NOW.md** for a quick 5-minute deployment.
