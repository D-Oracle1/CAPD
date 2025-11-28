# Deployment Checklist

## Pre-Deployment (Local)

### Code Preparation
- [ ] All changes committed: `git status` shows nothing
- [ ] Latest code pushed to GitHub: `git log --oneline`
- [ ] No `.env` files committed
- [ ] `api/` directory with 3 files:
  - [ ] `api/channels.js`
  - [ ] `api/streams.js`
  - [ ] `api/health.js`
- [ ] `vercel.json` updated with API rewrites

### Testing Locally
- [ ] API server runs: `npm run api-server`
- [ ] Health check works: `curl http://localhost:3001/api/health`
- [ ] Channels endpoint works: `curl http://localhost:3001/api/channels`
- [ ] Admin panel saves to database
- [ ] TV page loads channels from API
- [ ] No console errors in browser

### Supabase Ready
- [ ] Supabase project created
- [ ] `channels` table exists
- [ ] Table has correct schema
- [ ] Can access table from Supabase dashboard
- [ ] Have SUPABASE_URL ready
- [ ] Have SUPABASE_ANON_KEY ready

### Repository Ready
- [ ] Repository on GitHub
- [ ] Main branch is default branch
- [ ] All files pushed to GitHub

---

## Deployment Process

### Step 1: Create Vercel Project
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import from GitHub
- [ ] Select CAPD repository
- [ ] Configure build settings (should auto-detect)
- [ ] Click "Deploy"
- [ ] Wait for initial deployment (usually 1-2 minutes)

### Step 2: Get Vercel Domain
- [ ] Check deployments
- [ ] Find deployment URL (e.g., capd-git-main-xxx.vercel.app)
- [ ] Visit URL in browser
- [ ] Frontend loads (landing page visible)
- [ ] Note: API won't work yet (no env vars)

### Step 3: Set Environment Variables
- [ ] Go to project "Settings"
- [ ] Click "Environment Variables"
- [ ] Add `SUPABASE_URL`:
  - Name: `SUPABASE_URL`
  - Value: `https://yuzqfrybmpxeqqxtewyl.supabase.co`
  - Environments: Production, Preview, Development
  - Click "Save"
- [ ] Add `SUPABASE_ANON_KEY`:
  - Name: `SUPABASE_ANON_KEY`
  - Value: (get from Supabase dashboard)
  - Environments: Production, Preview, Development
  - Click "Save"

### Step 4: Redeploy with Env Vars
- [ ] Go to "Deployments" tab
- [ ] Find latest deployment
- [ ] Click "..." menu → "Redeploy"
- [ ] Confirm "Redeploy"
- [ ] Wait for redeployment (2-3 minutes)

---

## Post-Deployment Tests

### Frontend Tests
- [ ] Landing page loads: `/`
- [ ] TV page loads: `/tv.html`
- [ ] Admin page accessible: `/admin/dashboard.html`
- [ ] All pages load without 404 errors
- [ ] Images and styles load correctly

### API Tests
- [ ] Health check works: `/api/health`
  - [ ] Returns status: "ok"
  - [ ] Shows database: "Supabase"
  - [ ] Shows timestamp

- [ ] Channels endpoint works: `/api/channels`
  - [ ] Returns JSON with channels array
  - [ ] Empty array is OK if no channels yet

### Admin Panel Tests
- [ ] Can access admin: `/admin/dashboard.html`
- [ ] Can add channel:
  - [ ] Fill form
  - [ ] Click "Save Channel"
  - [ ] See success message
  - [ ] Channel appears in list
- [ ] Can edit channel:
  - [ ] Click "Edit"
  - [ ] Change name
  - [ ] Save
  - [ ] See updated name
- [ ] Can delete channel:
  - [ ] Click "Delete"
  - [ ] Confirm
  - [ ] Channel removed

### TV Page Tests
- [ ] TV page loads: `/tv.html`
- [ ] Channels appear in list
- [ ] Click channel to watch
- [ ] Player shows video

### Real-Time Sync Test
- [ ] Open admin in one window
- [ ] Open TV page in another window
- [ ] Add channel in admin
- [ ] Refresh TV page
- [ ] New channel appears
- [ ] Admin and TV show same channels

### Browser Console Tests
- [ ] No JavaScript errors
- [ ] No CORS errors
- [ ] TV page console shows: "Loaded channels from database API"
- [ ] Admin panel successfully saves to API

---

## Verification Checklist

### Functionality
- [ ] Frontend pages load
- [ ] API responds to requests
- [ ] Database connection works
- [ ] Admin panel CRUD operations work
- [ ] TV page syncs with database
- [ ] Real-time sync between admin and TV

### Performance
- [ ] Pages load within 2 seconds
- [ ] API responses within 1 second
- [ ] No timeouts or errors

### Security
- [ ] No sensitive data in error messages
- [ ] Supabase keys in environment variables only
- [ ] CORS headers set correctly
- [ ] No `.env` file in deployment

### Monitoring
- [ ] Can view deployment logs
- [ ] Can see function logs
- [ ] Can monitor analytics

---

## Common Issues & Fixes

### Issue: API returns 502 Bad Gateway
**Fix:**
1. Check environment variables set
2. Redeploy after setting env vars
3. Wait 5 minutes for propagation
4. Check Vercel logs for errors

### Issue: Channels not loading on TV page
**Fix:**
1. Check `/api/health` endpoint
2. Verify Supabase table exists
3. Clear browser cache
4. Check browser console for errors
5. Try: `fetch('https://domain/api/channels')`

### Issue: Admin can't save channels
**Fix:**
1. Check API is responding: `/api/health`
2. Verify POST works: Test with curl/Postman
3. Check Supabase has write permissions
4. Check for CORS errors in console

### Issue: 404 errors on API endpoints
**Fix:**
1. Verify `vercel.json` has rewrites
2. Check `api/` files exist
3. Check file names match URLs
4. Redeploy

---

## Rollback Plan

If something goes wrong:

### Option 1: Revert Last Commit
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys previous version
```

### Option 2: Redeploy Previous Commit
1. Go to Vercel Deployments
2. Find working deployment
3. Click "..."
4. Select "Redeploy"

### Option 3: Disable Auto-Deploy
1. Settings → Git
2. Toggle "Deploy on push"
3. Manually deploy when ready

---

## Post-Deployment Cleanup

- [ ] Test all features
- [ ] Document any issues
- [ ] Update team on deployment
- [ ] Monitor error logs for 24 hours
- [ ] Set up alerting if available
- [ ] Back up database
- [ ] Document deployment date and version

---

## Deployment Timeline

- **Start**: X minutes
- **Vercel Setup**: ~5 minutes
- **Deployment**: ~2 minutes
- **Environment Variables**: ~2 minutes
- **Redeployment**: ~2 minutes
- **Testing**: ~10 minutes
- **Total**: ~20-30 minutes

---

## Support

If stuck on any step:
1. Check `VERCEL_DEPLOYMENT.md` for details
2. Check Vercel logs: Dashboard → Deployments → Logs
3. Check API logs: Dashboard → Deployments → Functions
4. Test health: `/api/health`

---

## Sign-Off

Deployment completed on: _______________

Tested by: _______________

Issues found: _______________

Status: [ ] Production Ready [ ] Ready with Issues [ ] Needs More Work

