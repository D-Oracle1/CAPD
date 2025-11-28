# Database Setup Checklist

## Prerequisites
- [ ] Node.js and npm installed
- [ ] Supabase account created
- [ ] Git installed

## Supabase Configuration

### Step 1: Create Supabase Project
- [ ] Go to https://supabase.com
- [ ] Create new project
- [ ] Get Project URL and API Key

### Step 2: Create Database Table
- [ ] Open Supabase dashboard
- [ ] Go to SQL Editor
- [ ] Run this SQL:

```sql
CREATE TABLE channels (
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

-- Create index for faster queries
CREATE INDEX idx_channels_number ON channels(number);
CREATE INDEX idx_channels_status ON channels(status);
```

- [ ] Verify table was created

### Step 3: Update Configuration
- [ ] Open `api-server.js`
- [ ] Verify Supabase credentials (already configured)
- [ ] If using different project, update:
  ```javascript
  const SUPABASE_URL = 'your-supabase-url';
  const SUPABASE_ANON_KEY = 'your-anon-key';
  ```

## Local Setup

### Step 1: Install Dependencies
```bash
cd CAPD
npm install
```

- [ ] Dependencies installed successfully

### Step 2: Test Database Connection
```bash
npm run api-server
```

Expected output:
```
🎬 CAPD API Server Started (Database Mode)
💾 Database: Supabase PostgreSQL
```

- [ ] API server started without errors
- [ ] Check that server says "Database Mode"

### Step 3: Test API Endpoints
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{
  "status": "ok",
  "apiServer": "http://localhost:3001",
  ...
}
```

- [ ] Health check returned "ok"

### Step 4: Test Channels Endpoint
```bash
curl http://localhost:3001/api/channels
```

Should return:
```json
{
  "channels": []
}
```

- [ ] Channels endpoint working (empty array is ok)

## Admin Panel Setup

### Step 1: Access Admin Panel
- [ ] Navigate to `http://localhost/admin/dashboard.html`
- [ ] Login with default credentials:
  - Username: `admin`
  - Password: `capd2025`

- [ ] Admin dashboard loaded

### Step 2: Test Adding a Channel
- [ ] Click "Channels" section
- [ ] Click "+ Add Channel" button
- [ ] Fill in channel details:
  - Name: "Test Channel"
  - Number: 1
  - Description: "Test Description"
  - Stream URL: "https://www.youtube.com/live/dQw4w9WgXcQ"
  - Status: "live"
- [ ] Click "Save Channel"

- [ ] Channel saved successfully
- [ ] Message: "Channel saved successfully!"

### Step 3: Verify in Database
- [ ] Open Supabase dashboard
- [ ] Go to Table Editor
- [ ] Click "channels" table
- [ ] Verify test channel appears in table

- [ ] Test channel visible in database

### Step 4: Test Editing Channel
- [ ] Go back to admin panel
- [ ] Click "Edit" on test channel
- [ ] Change name to "Updated Test Channel"
- [ ] Click "Save Channel"

- [ ] Channel updated successfully

### Step 5: Test Deleting Channel
- [ ] Click "Delete" on test channel
- [ ] Confirm deletion
- [ ] Channel removed from list

- [ ] Channel deleted from database

## TV Page Setup

### Step 1: Access TV Page
- [ ] Navigate to `http://localhost/tv.html`
- [ ] Page loads without errors

- [ ] TV page loaded

### Step 2: Check Console Logs
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for message: "Loaded channels from database API"

- [ ] Correct data source confirmed

### Step 3: Add Channel via Admin
- [ ] Go back to admin panel
- [ ] Add a new channel:
  - Name: "Main Channel"
  - Number: 1
  - Stream URL: "https://www.youtube.com/live/dQw4w9WgXcQ"
- [ ] Save channel

### Step 4: Verify on TV Page
- [ ] Refresh TV page (F5)
- [ ] Check if new channel appears in channels list

- [ ] Channel immediately visible on TV page
- [ ] Real-time sync confirmed

## Production Checklist

### Before Deploying

#### Security
- [ ] Move Supabase keys to environment variables
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Set up authentication middleware
- [ ] Restrict CORS to production domain

#### Performance
- [ ] Test with 100+ channels
- [ ] Monitor API response times
- [ ] Check database query performance
- [ ] Set up caching strategy

#### Monitoring
- [ ] Set up error logging
- [ ] Enable database backups
- [ ] Test backup/restore process
- [ ] Document incident response

#### Documentation
- [ ] Update deployment guide
- [ ] Document team access procedures
- [ ] Create runbooks for common issues
- [ ] Archive old documentation

## Troubleshooting

### API Server Won't Start
```bash
# Check Node.js version
node --version  # Should be v14+

# Check port is available
netstat -an | grep 3001

# Kill process on port 3001 if needed
lsof -i :3001  # Get PID
kill -9 <PID>
```

- [ ] API server starting successfully

### Database Connection Fails
```bash
# Test Supabase credentials
curl -X GET \
  -H "apikey: YOUR_SUPABASE_KEY" \
  "https://your-project.supabase.co/rest/v1/channels?select=*"
```

- [ ] Database connection working

### Channels Not Syncing
1. [ ] Refresh TV page
2. [ ] Check API is running
3. [ ] Verify database has data
4. [ ] Clear browser cache
5. [ ] Check browser console for errors

### Missing Channels Table
```sql
-- Check if table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'channels';

-- If not, create it
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ...
);
```

- [ ] Table exists and is accessible

## Next Steps

- [ ] Set up continuous backups
- [ ] Configure monitoring alerts
- [ ] Train team on admin panel
- [ ] Set up production deployment
- [ ] Document custom configurations

## Support

If you encounter issues:

1. Check `DATABASE_MIGRATION.md` for detailed documentation
2. Review API logs: Check API server console output
3. Check database logs: Review Supabase dashboard
4. Check browser console: F12 → Console tab
5. Check network requests: F12 → Network tab

---

**Setup Status**: ✅ Complete when all items are checked
