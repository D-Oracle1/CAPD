# Supabase Integration Guide

## Overview
Your CAPD application now uses Supabase PostgreSQL database for persistent channel data storage. This replaces the ephemeral file-based storage.

## Setup Steps

### Step 1: Set Up Database Tables in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `SUPABASE_SETUP.sql` from your project
5. Paste it into the SQL editor
6. Click **Run** (or Cmd+Enter)
7. You should see ✅ success messages

**What this does:**
- Creates a `channels` table with all required fields
- Sets up indexes for performance
- Enables Row Level Security (RLS)
- Inserts 5 default channels
- Creates a view for easier access

### Step 2: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click **Settings**
3. Click **Environment Variables**
4. Add these variables:
   - Name: `SUPABASE_URL`
     Value: `https://yuzqfrybmpxeqqxtewyl.supabase.co`
   - Name: `SUPABASE_ANON_KEY`
     Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enFmcnlibXB4ZXFxeHRld3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjE1NzYsImV4cCI6MjA3OTg5NzU3Nn0.m_vwoLx449WZoRWzZsYIUf0MD8G_EMpwUDIpIGZ-Z-8`

5. Click **Save**

### Step 3: Install Supabase Package Locally

```bash
npm install @supabase/supabase-js
```

## How It Works

### Data Flow

```
Admin Panel (CMS)
    ↓
saves channel
    ↓
sends POST to /api/channels
    ↓
Supabase API
    ↓
Stores in PostgreSQL database
    ↓
TV Page loads data
    ↓
Fetches from /api/channels
    ↓
Supabase API returns data
    ↓
Displays on any browser!
```

### API Endpoints

**GET /api/channels**
- Returns all channels from Supabase database
- Used by TV page on page load
- Falls back to localStorage if unavailable

**POST /api/channels**
- Saves all channels to Supabase database
- Called when admin saves changes
- Replaces all existing channels with new ones

## Testing

### Local Testing

1. Start the API server:
```bash
npm run api-server
```

2. The server will connect to Supabase automatically

3. Test the API:
```bash
# Get channels
curl http://localhost:3001/api/channels

# Save channels
curl -X POST http://localhost:3001/api/channels \
  -H "Content-Type: application/json" \
  -d '{"channels": [{"id": "test", "name": "Test", "number": 1, "streamUrl": "https://example.com/stream.mp4"}]}'
```

### Production Testing

1. Deploy changes:
```bash
git push
vercel --prod
```

2. Test in browser:
- Open admin panel and save a channel
- Open TV page in new browser - should see your changes!
- Refresh page - data should persist

## Troubleshooting

### "Failed to fetch channels" error

**Cause:** Database table not set up
**Fix:** Run SUPABASE_SETUP.sql in Supabase dashboard

### "Cannot find module '@supabase/supabase-js'"

**Cause:** Package not installed
**Fix:** Run `npm install @supabase/supabase-js`

### Data not persisting on Vercel

**Cause:** Environment variables not set
**Fix:** Check Vercel Settings > Environment Variables

### Channels showing old data

**Cause:** Browser cache
**Fix:** Clear browser cache and refresh

## Database Schema

### channels table

```sql
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  type TEXT DEFAULT 'mp4',
  status TEXT DEFAULT 'offline',
  viewers INTEGER DEFAULT 0,
  poster TEXT,
  rtmp_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| id | TEXT | Unique channel ID |
| name | TEXT | Channel name |
| number | INTEGER | Channel number (1-5) |
| description | TEXT | Channel description |
| stream_url | TEXT | YouTube/MP4/HLS URL |
| type | TEXT | Stream type (youtube, mp4, hls, rtmp) |
| status | TEXT | live or offline |
| viewers | INTEGER | Current viewer count |
| poster | TEXT | Channel poster image URL |
| rtmp_url | TEXT | Optional RTMP server URL |
| created_at | TIMESTAMP | When channel was created |
| updated_at | TIMESTAMP | Last update timestamp |

## Advanced: Backing Up Data

### Export Data from Supabase

1. Go to Supabase Dashboard
2. Click on **SQL Editor**
3. Run:
```sql
SELECT * FROM channels;
```
4. Click the download icon to export as CSV

### Restore Data

If you ever need to restore data, you can re-run the INSERT statements in SUPABASE_SETUP.sql

## Security Notes

- The Anon Key allows public reads and authenticated writes
- Row Level Security (RLS) is enabled
- In production, you may want to restrict this further
- See Supabase documentation for more security options

## Next Steps

1. ✅ Run SUPABASE_SETUP.sql
2. ✅ Add environment variables to Vercel
3. ✅ Install Supabase package locally
4. ✅ Deploy to production
5. Test by saving channels in admin panel
6. Verify data persists across browsers

## Support

For issues with Supabase:
- Docs: https://supabase.com/docs
- Status: https://status.supabase.com

For issues with CAPD:
- Check browser console for errors
- Check Vercel logs: `vercel logs`
- Check Supabase logs: Supabase Dashboard > Logs
