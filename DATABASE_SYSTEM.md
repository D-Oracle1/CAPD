# CAPD Database & Settings System Documentation

## Overview

The CAPD system uses a **file-based database** with JSON persistence and a RESTful API layer for managing channels and application settings.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├──────────────────────────────────┬──────────────────────────┤
│  Admin Panel (admin/cms.js)      │  TV Page (tv.html)       │
│  - Manage channels               │  - Display channels      │
│  - Configure settings            │  - Load settings         │
│  - Real-time sync via storage    │  - Real-time updates     │
└──────────────────────────────────┴──────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                     API Layer (server.js)                    │
├───────────────────────────────────────────────────────────┤
│  Endpoints:                                                 │
│  - GET  /api/channels        → Load all channels           │
│  - POST /api/channels        → Save channels to JSON       │
│  - GET  /api/settings        → Load all settings           │
│  - POST /api/settings        → Save settings to JSON       │
│  - GET  /api/health          → Server health check         │
└───────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (JSON Files)                    │
├───────────────────────────────────────────────────────────┤
│  /data/channels.json       → 5+ streaming channels         │
│  /data/settings.json       → App configuration             │
│  /data/announcements.json  → News & announcements          │
│  /data/articles.json       → Article content               │
│  /data/schedule.json       → Program schedule              │
└───────────────────────────────────────────────────────────┘
```

## Data Files

### 1. channels.json
**Location:** `/data/channels.json`

**Structure:**
```json
{
  "channels": [
    {
      "id": "ch-1",
      "name": "CAPD Main",
      "number": 1,
      "description": "Main broadcast channel",
      "streamUrl": "rtmp://localhost:1935/live/main",
      "status": "offline",
      "viewers": 0
    }
  ]
}
```

**Managed By:**
- GET `/api/channels` - Read all channels
- POST `/api/channels` - Save updated channels
- Admin Panel saves here when user adds/edits channels

---

### 2. settings.json
**Location:** `/data/settings.json`

**Structure:**
```json
{
  "streaming": {
    "rtmpServer": {
      "address": "rtmp://localhost:1935/live",
      "port": 1935,
      "status": "online"
    },
    "hlsServer": {
      "address": "http://localhost:8000",
      "port": 8000,
      "status": "online"
    }
  },
  "ui": {
    "theme": "dark",
    "language": "en"
  },
  "broadcast": {
    "autoStart": false,
    "recordStreams": true,
    "maxConcurrentStreams": 5
  },
  "security": {
    "adminUsername": "admin",
    "requireAuth": true
  }
}
```

**Managed By:**
- GET `/api/settings` - Read all settings
- POST `/api/settings` - Save updated settings
- Admin Panel saves here when user configures streaming servers

---

## API Endpoints

### GET /api/channels
**Purpose:** Load all channels from database

**Request:**
```bash
curl http://localhost:3000/api/channels
```

**Response:**
```json
{
  "channels": [
    {
      "id": "ch-1",
      "name": "CAPD Main",
      "number": 1,
      "streamUrl": "rtmp://localhost:1935/live/main",
      ...
    }
  ]
}
```

**Used By:** TV page, Admin panel (channel list)

---

### POST /api/channels
**Purpose:** Save/update all channels to database

**Request:**
```bash
curl -X POST http://localhost:3000/api/channels \
  -H "Content-Type: application/json" \
  -d '{"channels": [...]}'
```

**Response:**
```json
{
  "message": "Channels updated successfully",
  "channels": [...]
}
```

**Used By:** Admin panel (save after editing channels)

**Process Flow:**
1. User edits channel in admin panel
2. Admin saves to localStorage immediately (offline support)
3. Admin sends POST to `/api/channels`
4. Server saves to `/data/channels.json`
5. TV page detects change via storage events
6. TV page reloads channels from API

---

### GET /api/settings
**Purpose:** Load application settings from database

**Request:**
```bash
curl http://localhost:3000/api/settings
```

**Response:**
```json
{
  "settings": {
    "streaming": {...},
    "ui": {...},
    "broadcast": {...},
    "security": {...}
  }
}
```

**Used By:** Admin panel (on load), TV page (on load)

---

### POST /api/settings
**Purpose:** Save/update application settings to database

**Request:**
```bash
curl -X POST http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"settings": {...}}'
```

**Response:**
```json
{
  "message": "Settings updated successfully",
  "settings": {...}
}
```

**Used By:** Admin panel (save streaming server config)

**Process Flow:**
1. User configures RTMP/HLS servers in admin panel
2. Admin saves to localStorage immediately
3. Admin sends POST to `/api/settings`
4. Server saves to `/data/settings.json`
5. Settings persist across server restarts

---

## Frontend Integration

### Admin Panel (admin/cms.js)

**Load Channels:**
```javascript
async function loadChannels() {
  try {
    // Try API with 3-second timeout
    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api/channels'
      : '/api/channels';

    const response = await fetch(apiUrl, { signal: controller.signal });
    return response.json();
  } catch (error) {
    // Fallback to JSON file or localStorage
  }
}
```

**Save Channels:**
```javascript
async function saveChannel(channel) {
  // Save to localStorage immediately
  localStorage.setItem('channels', JSON.stringify(channels));

  // Sync with API (with 3-second timeout)
  fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({ channels }),
    signal: AbortSignal.timeout(3000)
  });
}
```

**Load Settings:**
```javascript
function loadSettingsFromServer() {
  fetch(apiUrl, {
    method: 'GET',
    signal: AbortSignal.timeout(3000)
  })
    .then(res => {
      if (res.ok) return res.json();
      throw new Error('Failed to load settings');
    })
    .then(data => {
      localStorage.setItem('appSettings', JSON.stringify(data.settings));
    })
    .catch(err => {
      // Use cached settings from localStorage
    });
}
```

**Save Settings:**
```javascript
function saveStreamingSettings() {
  const settings = {
    streaming: {
      rtmpServer: { address, port },
      hlsServer: { address, port }
    },
    ...
  };

  // Save to localStorage first (offline)
  localStorage.setItem('appSettings', JSON.stringify(settings));

  // Sync with API
  fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({ settings }),
    signal: AbortSignal.timeout(3000)
  });
}
```

---

### TV Page (tv.html)

**Load Channels:**
```javascript
async function loadChannels() {
  const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api/channels'
    : '/api/channels';

  const response = await fetch(apiUrl, { signal: controller.signal });
  const data = await response.json();
  return data.channels;
}
```

**Load Settings:**
```javascript
async function loadSettings() {
  const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api/settings'
    : '/api/settings';

  const response = await fetch(apiUrl, { signal: controller.signal });
  const data = await response.json();
  return data.settings;
}
```

**Listen for Updates:**
```javascript
function listenForChannelUpdates() {
  // Listen to localStorage changes from admin panel
  window.addEventListener('storage', (event) => {
    if (event.key === 'channels' && event.newValue) {
      loadChannels(); // Reload channels
    }
  });

  // Listen for page visibility (same window updates)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loadChannels(); // Reload when tab becomes visible
    }
  });
}
```

---

## Real-Time Sync Pattern

### Admin Panel → TV Page Sync

```
1. User edits channel in admin panel
   ↓
2. saveChannel() called
   ↓
3. Save to localStorage immediately (offline-first)
   ↓
4. POST to /api/channels with 3-second timeout
   ↓
5. Server saves to /data/channels.json
   ↓
6. Storage event triggers in TV page
   ↓
7. TV page reloads channels from API
   ↓
8. TV page renders updated channels
```

### Cross-Tab Sync

When admin panel is in one tab and TV page in another:

```
Admin Tab (5500)          Server               TV Tab (3000)
    ↓                        ↓                      ↓
User edits channel           ↓                      ↓
    ↓                        ↓                      ↓
Save to localStorage         ↓                      ↓
    ↓                        ↓                      ↓
POST /api/channels →→→ Save to /data/channels.json
    ↓                        ↓                      ↓
                             ↓                      ↓
                             ↓ ← listenForChannelUpdates()
                             ↓                      ↓
                             ←←← GET /api/channels
                             ↓                      ↓
                             ←←←←← respond with new data
                             ↓                      ↓
                             ↓              Render updated
                             ↓              channels
```

---

## Offline-First Pattern

All endpoints follow this fallback hierarchy:

```
Try API with 3-second timeout
    ↓
If timeout or error:
    ↓
Check localStorage cache
    ↓
If cache empty:
    ↓
Show error or default
```

**Benefits:**
- ✅ Works with or without server
- ✅ Never hangs (3-second max wait)
- ✅ Seamless fallback to cached data
- ✅ Responsive UI in all conditions

---

## Testing the System

### Test 1: Load Channels
```bash
curl http://localhost:3000/api/channels
```

Expected: JSON with channel list

### Test 2: Load Settings
```bash
curl http://localhost:3000/api/settings
```

Expected: JSON with settings object

### Test 3: Save Channels
```bash
curl -X POST http://localhost:3000/api/channels \
  -H "Content-Type: application/json" \
  -d '{"channels": []}'
```

Expected: Success message

### Test 4: Save Settings
```bash
curl -X POST http://localhost:3000/api/settings \
  -H "Content-Type: application/json" \
  -d '{"settings": {"streaming": {...}}}'
```

Expected: Success message and persisted data in /data/settings.json

---

## Troubleshooting

### Issue: "Cannot GET /api/settings"
**Cause:** Old server instance running, hasn't loaded new code

**Solution:** Kill node processes and restart
```bash
taskkill /IM node.exe /F
npm start
```

### Issue: 404 errors from Live Server
**Cause:** Hostname check only looked for 'localhost', not '127.0.0.1'

**Solution:** Already fixed! Code now checks:
```javascript
(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
```

### Issue: POST returns without saving
**Cause:** Missing JSON body parser middleware

**Solution:** Already fixed! Added `app.use(express.json());` to server.js

### Issue: Settings not syncing between admin and TV
**Cause:** Listener not active or API timeout too short

**Solution:**
- Verify 3-second timeout is set (default in code)
- Check browser console for "Loading from API" messages
- Fallback to localStorage working correctly

---

## Files Modified in This System

| File | Changes | Purpose |
|------|---------|---------|
| `/data/settings.json` | Created | Store app configuration |
| `/data/channels.json` | Modified | Enhanced with complete structure |
| `server.js` | Added middleware + 4 endpoints | API layer for persistence |
| `admin/cms.js` | Updated 9 functions | Admin panel integration |
| `tv.html` | Added 2 async functions | TV page integration |

---

## Summary

The CAPD database system is **production-ready** with:

✅ **File-based persistence** - JSON files as database
✅ **REST API** - 4 endpoints for channels & settings
✅ **Offline-first** - Works with or without server
✅ **Real-time sync** - Cross-tab updates via storage events
✅ **Timeout protection** - Never hangs, always responsive
✅ **Fallback chain** - API → localStorage → defaults
✅ **Error handling** - Graceful degradation in all scenarios

The system is ready for production deployment or migration to a real database like PostgreSQL/MongoDB without changing the API contract.
