# Quick Start - Database Mode

## TL;DR

Everything loads from **Supabase Database** now. Admin saves to database. TV page loads from database.

---

## 30-Second Setup

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Start everything
npm run both

# 3. Open admin panel
# http://localhost/admin/dashboard.html
# Login: admin / capd2025

# 4. Open TV page
# http://localhost/tv.html
```

✅ **Done!** Everything syncs automatically from the database.

---

## What Works Now

| Action | Before | Now |
|--------|--------|-----|
| Add Channel | Saved to localStorage | Saved to Supabase database |
| Edit Channel | Updated localStorage | Updated database |
| Delete Channel | Removed from localStorage | Deleted from database |
| Watch on TV | Loaded from localStorage | Loaded from database |
| Sync Between Pages | Manual refresh needed | Automatic & instant |
| Works Offline | Yes (localStorage only) | Yes (cached data) |

---

## Running the Platform

### Start Everything at Once
```bash
npm run both
```

Starts:
- API Server (port 3001) → Database access
- RTMP Server (port 1935) → Live streaming
- HLS Transcoder → Video processing

### Start Individual Components
```bash
npm run api-server      # Database API only
npm run rtmp-server     # RTMP server only
npm run hls-transcoder  # Video transcoding
```

---

## Admin Panel

### Access
```
http://localhost/admin/dashboard.html
```

### Default Login
```
Username: admin
Password: capd2025
```

### Add Channel
1. Click **Channels** section
2. Click **+ Add Channel** button
3. Fill in details:
   - **Name**: Channel name
   - **Number**: Channel number
   - **Description**: Short description
   - **Stream URL**: RTMP, HLS, YouTube, or MP4 URL
   - **Status**: live or offline
   - **Viewers**: Current viewer count
4. Click **Save Channel**

✅ Automatically saved to database

---

## TV Page

### Access
```
http://localhost/tv.html
```

### What Happens
1. Loads channels from **Supabase database**
2. Displays available channels
3. Select channel to watch
4. Stream plays in player

### Real-Time Sync
- Changes in admin panel appear **instantly**
- No refresh needed
- Works across all browsers/devices

---

## Quick API Tests

### Check Server Health
```bash
curl http://localhost:3001/api/health
```

### Get All Channels
```bash
curl http://localhost:3001/api/channels
```

### Add Channel (via API)
```bash
curl -X POST http://localhost:3001/api/channels \
  -H "Content-Type: application/json" \
  -d '{
    "channels": [
      {
        "id": "ch-test",
        "name": "Test Channel",
        "number": 1,
        "description": "Test",
        "streamUrl": "https://example.com/stream.m3u8",
        "status": "offline",
        "viewers": 0
      }
    ]
  }'
```

---

## Data Sources Priority

### TV Page Loads From:
1. **Database API** (primary) ← Latest data
2. **LocalStorage** (fallback) ← If API unavailable
3. **JSON File** (emergency) ← If all else fails

### Admin Panel Saves To:
1. **Database API** (always)
2. **LocalStorage** (cache)

---

## Common Tasks

### Add a New Channel
```
Admin Panel → Channels → + Add Channel → Fill details → Save
```

### Edit Existing Channel
```
Admin Panel → Channels → Edit button → Modify → Save
```

### Delete Channel
```
Admin Panel → Channels → Delete button → Confirm
```

### Watch Channel
```
TV Page → Select channel from list → Stream plays
```

### Check If Sync Works
```
Admin Panel: Add channel
TV Page: Refresh page → New channel appears ✅
```

---

## Troubleshooting (Quick Fixes)

### Channels Not Showing on TV
```bash
# Fix 1: Restart API server
npm run api-server

# Fix 2: Clear cache
# Open browser console (F12):
localStorage.clear()
location.reload()

# Fix 3: Check if channels exist in database
curl http://localhost:3001/api/channels
```

### Admin Not Saving
```bash
# Check API is running
curl http://localhost:3001/api/health

# If not running:
npm run api-server
```

### API Server Already Running
```bash
# Find process on port 3001
lsof -i :3001

# Kill it
kill -9 <PID>

# Restart
npm run api-server
```

---

## Key Points to Remember

✅ **Database Mode** - Everything goes to Supabase
✅ **Real-Time Sync** - Changes appear instantly
✅ **Offline Support** - Uses cached data if API down
✅ **Simple API** - Just add/edit/delete channels
✅ **Automatic Backup** - Supabase has built-in backups

---

## Useful Commands

```bash
# Install dependencies
npm install

# Start all servers
npm run both

# Start API server only
npm run api-server

# Start RTMP server only
npm run rtmp-server

# Start transcoder only
npm run hls-transcoder

# Check if process is running on port
lsof -i :3001    # API
lsof -i :1935    # RTMP
lsof -i :8000    # HLS
```

---

## File Locations

```
Project Root
├── admin/
│   ├── dashboard.html      ← Admin panel
│   └── cms.js              ← Admin logic (uses API now)
├── tv.html                 ← TV page (loads from API)
├── api-server.js           ← API + Database (Supabase)
├── data/
│   └── channels.json       ← Fallback only
├── DATABASE_MIGRATION.md   ← Full documentation
├── DATABASE_SETUP_CHECKLIST.md ← Setup guide
└── MIGRATION_SUMMARY.md    ← What changed
```

---

## Next Steps

1. **Run everything**: `npm run both`
2. **Add a channel**: Admin panel
3. **Watch it sync**: TV page
4. **Read docs**: `DATABASE_MIGRATION.md`

---

## Documentation Map

- **This file**: Quick start & common commands
- `DATABASE_MIGRATION.md`: Complete technical documentation
- `DATABASE_SETUP_CHECKLIST.md`: Step-by-step setup guide
- `MIGRATION_SUMMARY.md`: What changed and why

---

## Support

**Everything not working?**

1. Check API is running: `npm run api-server`
2. Check Supabase connection: `curl http://localhost:3001/api/health`
3. Clear cache: `localStorage.clear()` in browser console
4. Read full docs: `DATABASE_MIGRATION.md`

---

**You're all set!** 🚀
