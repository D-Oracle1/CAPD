# CAPD Platform - Database Migration Guide

## Overview

The CAPD Communications platform has been successfully migrated from localStorage and JSON file storage to **Supabase PostgreSQL database**. All data now persists in a remote database, ensuring better reliability, scalability, and data consistency across all users and devices.

---

## Architecture Changes

### Before (Legacy)
- **Channel Data**: Stored in localStorage and `data/channels.json`
- **Admin Panel**: Saved to localStorage and JSON files
- **TV Page**: Loaded from localStorage with fallback to JSON
- **Sync Issues**: Manual sync required between admin and TV pages

### After (Database Mode)
- **Single Source of Truth**: Supabase PostgreSQL database
- **Real-time Sync**: All changes immediately reflected everywhere
- **Offline Fallback**: LocalStorage used as cache for offline access
- **Production Ready**: Centralized database with backup capabilities

---

## Data Flow

### Admin Panel → Database
```
Admin Panel (dashboard.html)
    ↓ Save Channel
API Server (api-server.js)
    ↓ POST /api/channels
Supabase Database (channels table)
```

### Database → TV Page
```
Supabase Database (channels table)
    ↓ GET /api/channels
API Server (api-server.js)
    ↓ Fetch & Format
TV Page (tv.html)
    ↓ Display Channels
Browser LocalStorage (cache)
```

---

## Database Setup

### Required Supabase Tables

Your Supabase project needs the following table:

#### Table: `channels`
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
```

### Supabase Configuration

The following credentials are already configured in:
- `supabase-client.js`
- `api-server.js`

```javascript
const SUPABASE_URL = 'https://yuzqfrybmpxeqqxtewyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## API Endpoints

All endpoints now use the database as the primary data source:

### Get All Channels
```bash
GET /api/channels
Response: { channels: [...] }
```

### Save All Channels
```bash
POST /api/channels
Body: { channels: [...] }
Response: { message: "...", channels: [...] }
```

### Get Channel by ID/Name
```bash
GET /api/streams/:id
Response: { id, name, status, viewers, ... }
```

### Create New Stream
```bash
POST /api/streams
Body: { name, number, description, streamUrl, status }
Response: { message: "...", stream: {...} }
```

### Delete Stream
```bash
DELETE /api/streams/:id
Response: { message: "Stream deleted successfully" }
```

---

## Running the Application

### Start All Services
```bash
npm run both
```

This starts:
- **API Server** (port 3001) - Database API
- **RTMP Server** (port 1935) - Live streaming
- **HLS Transcoder** - Video processing

### Individual Services
```bash
npm run api-server      # API + Database
npm run rtmp-server     # RTMP streaming
npm run hls-transcoder  # HLS transcoding
```

---

## Admin Panel

### Location
```
http://localhost/admin/dashboard.html
```

### Login
- **Username**: admin
- **Password**: capd2025

### Features
1. **Channel Management**
   - Add new channels
   - Edit existing channels
   - Delete channels
   - All changes saved to Supabase database

2. **Data Sync**
   - Real-time sync with database
   - Changes visible immediately on TV page
   - Works across all browsers and devices

3. **Fallback Caching**
   - Local storage backup if database is offline
   - Automatic cache update when database is available

---

## TV Page

### Location
```
http://localhost/tv.html
```

### Data Loading Priority
1. **Database API** (primary)
   - Fetches from Supabase via API server
   - Guaranteed latest data

2. **LocalStorage Cache** (fallback)
   - Used if API is unavailable
   - Automatically updated with API data

3. **JSON File** (emergency fallback)
   - Last resort if database and cache fail
   - Contains default placeholder channels

---

## Migration From Old System

### For Existing Data

If you have data in `data/channels.json`:

1. Open the admin panel
2. The system will load existing channels from JSON
3. Edit any channel and save
4. Data will be migrated to Supabase

### Bulk Import

To import channels programmatically:
```javascript
// Get channels from JSON
const channels = await fetch('data/channels.json').then(r => r.json());

// Save to database
await fetch('/api/channels', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ channels: channels.channels })
});
```

---

## Troubleshooting

### API Server Not Responding

```bash
# Check if server is running
npm run api-server

# Verify API is accessible
curl http://localhost:3001/api/health
```

### Database Connection Issues

1. Check Supabase credentials in `api-server.js`
2. Verify internet connection
3. Check Supabase project status
4. Review browser console for errors

### No Channels Appearing on TV Page

1. **Check Database**: Verify channels exist in Supabase
2. **Check API**: Test `/api/channels` endpoint
3. **Check Cache**: Clear localStorage
   ```javascript
   localStorage.clear();
   location.reload();
   ```
4. **Check Fallback**: If API unavailable, it uses localStorage

### Admin Changes Not Visible on TV

1. **Wait a moment** - Data syncs automatically
2. **Refresh TV page** - Force reload from API
3. **Check API status** - Ensure API server is running
4. **Check database** - Verify data was saved to Supabase

---

## Performance Optimizations

### Caching Strategy
- **Database** (primary) - Always up-to-date
- **LocalStorage** (cache) - Fast offline access
- **JSON file** (fallback) - Emergency backup

### Data Updates
- TV page automatically caches data from API
- Admin panel updates database directly
- Changes propagate instantly

### Network Efficiency
- Single API call to fetch all channels
- Data cached locally to reduce API calls
- Automatic retry on network errors

---

## Security Notes

### Production Deployment

Before going to production:

1. **Environment Variables**
   - Store Supabase keys in `.env` file
   - Never commit keys to version control
   - Use different keys for dev/prod

2. **Database Security**
   - Enable Row Level Security (RLS) in Supabase
   - Set up proper authentication
   - Restrict API access

3. **CORS Configuration**
   - Update CORS settings for your domain
   - Restrict API endpoints as needed

### Example .env
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
API_PORT=3001
```

---

## Development Workflow

### Adding a New Field to Channels

1. **Update Supabase Schema**
   ```sql
   ALTER TABLE channels ADD COLUMN newField TEXT;
   ```

2. **Update API Handler** (api-server.js)
   ```javascript
   // Already mapped in POST /api/channels
   ```

3. **Update Admin Panel** (cms.js)
   ```javascript
   // Add form field for new property
   ```

4. **Update TV Page** (tv.html)
   ```javascript
   // Use new field in display logic
   ```

---

## Backup & Recovery

### Database Backups
Supabase automatically backs up your data. Access backups in:
1. Supabase Dashboard
2. Project Settings
3. Backups section

### Manual Export
```bash
# Export channels from API
curl http://localhost:3001/api/channels > channels-backup.json
```

### Manual Import
```bash
# Import channels to API
curl -X POST http://localhost:3001/api/channels \
  -H "Content-Type: application/json" \
  -d @channels-backup.json
```

---

## Monitoring

### Health Check
```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "rtmpServer": "rtmp://localhost:1935",
  "hlsServer": "http://localhost:8000",
  "apiServer": "http://localhost:3001",
  "timestamp": "2024-11-28T..."
}
```

### Database Monitoring
- Monitor in Supabase Dashboard
- Check API logs for errors
- Monitor network requests in browser DevTools

---

## Support & Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- Express.js: https://expressjs.com
- API Reference: See `/api/health` endpoint

### Troubleshooting Checklist
- [ ] API server running on port 3001
- [ ] Supabase credentials valid
- [ ] Database table `channels` exists
- [ ] CORS enabled for your domain
- [ ] Browser cache cleared
- [ ] Network tab shows successful requests

---

## FAQ

**Q: Where is my data stored?**
A: All channel data is stored in Supabase PostgreSQL database. Local storage is used only as a cache.

**Q: Can I still use the system offline?**
A: Yes. The TV page will use cached data from localStorage if the API is unavailable.

**Q: How do I migrate from the old JSON system?**
A: Simply edit and save a channel in the admin panel. It will automatically be saved to the database.

**Q: Is the data secure?**
A: Data is encrypted in transit (HTTPS/TLS). Set up Row Level Security in Supabase for additional security.

**Q: Can I backup my data?**
A: Yes. Export channels via the API or use Supabase's built-in backup feature.

---

## Version Info
- **CAPD Platform**: 2.0 (Database Mode)
- **Database**: Supabase PostgreSQL
- **API Server**: Express.js 4.18.2
- **Date**: 2024-11-28

---

For more information or support, contact: info@capd.ng
