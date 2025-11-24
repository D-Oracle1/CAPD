# 📚 RTMP Server Reference Guide

## Quick Command Reference

### Start Services

```bash
# CORS Proxy only
npm start

# RTMP Server only
npm run rtmp-server

# Both servers
npm run both

# Development with auto-reload
npm run dev              # CORS Proxy
npm run rtmp-dev         # RTMP Server
```

### Stop Services

```bash
Ctrl + C (in terminal)
```

## Network Ports

| Service | Port | Purpose |
|---------|------|---------|
| CORS Proxy | 3000 | Web interface, admin panel, API |
| RTMP Server | 1935 | Receives RTMP broadcasts |
| HLS Server | 8000 | Serves HLS segments |

## Stream URLs

### Broadcasting (From OBS/FFmpeg)
```
rtmp://localhost:1935/live/STREAM_NAME
```

### Watching (In Browser/Player)
```
http://localhost:8000/live/STREAM_NAME/index.m3u8
http://localhost:3000/hls/STREAM_NAME/index.m3u8
```

## API Endpoints

### Core Streaming APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/streams` | GET | List all active streams |
| `/api/streams/:name` | GET | Get specific stream info |
| `/api/health` | GET | Server health check |
| `/api/stream?url=...` | GET | CORS proxy stream |

### Example Requests

**Get all streams:**
```bash
curl http://localhost:3000/api/streams
```

**Get specific stream:**
```bash
curl http://localhost:3000/api/streams/mystream
```

**Check health:**
```bash
curl http://localhost:3000/api/health
```

## OBS Configuration

### Step 1: Stream Settings

| Field | Value |
|-------|-------|
| Service | Custom |
| Server | `rtmp://localhost:1935/live` |
| Stream Key | Any name (e.g., `mystream`) |

### Step 2: Output Settings

| Setting | Value |
|---------|-------|
| Bitrate | 4000 kbps |
| Audio Bitrate | 128 kbps |
| FPS | 30 |
| Resolution | 1280x720 |

## FFmpeg Command Examples

### Broadcast Video File
```bash
ffmpeg -i "video.mp4" \
  -c:v libx264 -preset fast -b:v 4000k \
  -c:a aac -b:a 128k \
  -f flv "rtmp://localhost:1935/live/mystream"
```

### Broadcast Webcam (Windows)
```bash
ffmpeg -f dshow -i video="Integrated Webcam" \
  -c:v libx264 -preset fast -b:v 2000k \
  -f flv "rtmp://localhost:1935/live/webcam"
```

### Broadcast Webcam (Mac)
```bash
ffmpeg -f avfoundation -i "0" \
  -c:v libx264 -preset fast -b:v 2000k \
  -f flv "rtmp://localhost:1935/live/webcam"
```

### Broadcast Desktop (Windows)
```bash
ffmpeg -f gdigrab -i desktop \
  -c:v libx264 -preset fast -b:v 4000k \
  -f flv "rtmp://localhost:1935/live/desktop"
```

### Test Broadcast
```bash
ffmpeg -f lavfi -i testsrc=duration=30:size=1280x720:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=30 \
  -c:v libx264 -b:v 4000k -c:a aac -b:a 128k \
  -f flv "rtmp://localhost:1935/live/test"
```

## Admin Panel URLs

| Page | URL |
|------|-----|
| TV Page | http://localhost:3000/tv.html |
| Admin Login | http://localhost:3000/admin/index.html |
| Channels | Admin → My Tasks |
| Custom RTMP | Admin → Settings |
| Health Check | http://localhost:3000/api/health |

## Environment Variables

### Port Configuration
```bash
PORT=3000              # CORS Proxy port
RTMP_PORT=1935         # RTMP server port
HTTP_PORT=8000         # HLS server port
```

### Server Configuration
```bash
NODE_ENV=production    # or development
LOG_LEVEL=warn         # debug, info, warn, error
FFMPEG_PATH=/usr/bin/ffmpeg  # Path to FFmpeg
```

### Set Variables
```bash
# Linux/Mac
PORT=3000 npm start

# Windows PowerShell
$env:PORT=3000; npm start

# Windows CMD
set PORT=3000 && npm start
```

## Bitrate Recommendations

### By Quality Level

| Quality | Bitrate | Video Codec | Audio | Resolution |
|---------|---------|-------------|-------|------------|
| SD | 1000 kbps | H.264 | 64 kbps | 640x360 |
| HD | 2500 kbps | H.264 | 128 kbps | 854x480 |
| Full HD | 4000 kbps | H.264 | 128 kbps | 1280x720 |
| Ultra HD | 6000 kbps | H.264 | 192 kbps | 1920x1080 |

### By Use Case

| Use Case | Bitrate | FPS | Resolution |
|----------|---------|-----|------------|
| Mobile | 1500 kbps | 24 | 640x480 |
| Chat/Webcam | 2000 kbps | 30 | 854x480 |
| General Content | 4000 kbps | 30 | 1280x720 |
| Sports/Gaming | 5000 kbps | 60 | 1280x720 |
| High Quality | 6000 kbps | 30 | 1920x1080 |

## Directory Structure

```
CAPD/
├── server.js              # CORS Proxy server
├── rtmp-server.js         # RTMP server
├── package.json           # Dependencies
├── hls/                   # HLS segments (auto-created)
│   └── live/
│       └── STREAM_NAME/
│           ├── index.m3u8
│           └── *.ts files
├── admin/
│   ├── index.html         # Login page
│   ├── dashboard.html     # Admin panel
│   └── cms.js             # Admin logic
├── tv.html                # TV page
└── data/
    ├── channels.json
    ├── schedule.json
    └── announcements.json
```

## File Types Explained

### HLS Playlist (.m3u8)
- Text file listing video segments
- Points to .ts files
- Browser requests this first
- Updated every ~10 seconds

### MPEG-TS Segment (.ts)
- Video/audio data
- Usually 10 seconds of content
- Multiple segments form the stream
- Browser downloads these

### JSON Configuration
- Stores admin panel data
- localStorage in browser
- Exported for backup

## Troubleshooting Commands

### Check What's Running

**Port Status:**
```bash
# Windows
netstat -ano | findstr :1935
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Mac/Linux
lsof -i :1935
lsof -i :3000
lsof -i :8000
```

**Process List:**
```bash
# Windows
tasklist | findstr "node"

# Mac/Linux
ps aux | grep node
```

### Test Connectivity

**RTMP Port:**
```bash
# Windows
Test-NetConnection localhost -Port 1935

# Mac/Linux
nc -zv localhost 1935
```

**HTTP Ports:**
```bash
curl http://localhost:3000/api/health
curl http://localhost:8000/
```

### Check Logs

**View RTMP Server Logs:**
- Terminal where `npm run rtmp-server` runs
- Shows connection attempts, errors

**View Proxy Logs:**
- Terminal where `npm start` runs
- Shows requests, health checks

## Common Error Messages

### "Cannot find module 'node-media-server'"
```bash
npm install
```

### "Port 1935 already in use"
```bash
# Change port in rtmp-server.js or:
RTMP_PORT=1936 npm run rtmp-server
```

### "ffmpeg: command not found"
```bash
# Install FFmpeg (see installation steps)
# Or set full path in .env:
FFMPEG_PATH=/usr/local/bin/ffmpeg
```

### "ECONNREFUSED" when broadcasting
- RTMP server not running
- Check port is correct
- Verify firewall not blocking

### "HLS not playing"
- Check HLS URL is correct
- Verify browser supports HLS
- Check CORS headers present

## Performance Tuning

### Reduce CPU Usage

**Lower Quality Broadcast:**
```bash
ffmpeg -i input.mp4 \
  -preset fast -b:v 2000k \    # Lower bitrate
  -s 854x480 \                  # Lower resolution
  -f flv rtmp://localhost/live/stream
```

**Server Setting:**
```bash
# In rtmp-server.js, change:
hls_time: 5    # Shorter segments (less buffering)
```

### Improve Stream Quality

**Higher Bitrate:**
```bash
-b:v 6000k              # Higher bitrate
-preset slow            # Better compression
-profile:v main         # Better codec support
```

## Security Checklist

- [ ] Change default admin password
- [ ] Whitelist stream keys in production
- [ ] Use RTMPS (secure RTMP) for production
- [ ] Enable HTTPS for web interface
- [ ] Set up firewall rules
- [ ] Monitor active streams
- [ ] Rotate stream keys regularly
- [ ] Keep Node.js/FFmpeg updated

## Maintenance Tasks

### Regular
- [ ] Check disk space (HLS files grow)
- [ ] Monitor CPU usage
- [ ] Check error logs
- [ ] Test backup systems

### Monthly
- [ ] Update Node.js packages: `npm update`
- [ ] Review stream statistics
- [ ] Rotate stream keys
- [ ] Backup configuration

### Quarterly
- [ ] Update FFmpeg
- [ ] Security audit
- [ ] Performance optimization
- [ ] Disaster recovery drill

## Links

| Resource | URL |
|----------|-----|
| Node.js | https://nodejs.org/ |
| FFmpeg | https://ffmpeg.org/ |
| OBS Studio | https://obsproject.com/ |
| Node Media Server | https://github.com/illuspas/Node-Media-Server |
| HLS Specification | https://tools.ietf.org/html/rfc8216 |

## File Sizes

### Typical Stream Segment

```
Bitrate: 4000 kbps
Segment Duration: 10 seconds
Segment Size: 4000 × 10 / 8 = 5 MB

Multiple Segments Stored:
10 segments × 5 MB = 50 MB
```

### Daily Storage

```
4 hours streaming × 3600 = 14400 seconds
14400 / 10 = 1440 segments
1440 × 5 MB = 7.2 GB per day
```

## Quick Diagnostics

### Is everything working?

```bash
# 1. Servers running?
curl http://localhost:3000/api/health

# 2. RTMP port open?
netstat -ano | findstr :1935

# 3. Streams active?
curl http://localhost:3000/api/streams

# 4. HLS accessible?
curl http://localhost:8000/live/test/index.m3u8
```

All successful = System ready ✅

## Next Steps

1. **Setup:** Follow RTMP_QUICKSTART.md
2. **Broadcast:** Use OBS or FFmpeg
3. **Watch:** Add HLS URL to CAPD
4. **Monitor:** Check API endpoints
5. **Scale:** Adjust bitrate as needed

---

**Last Updated:** November 24, 2024
**Version:** 1.0.0
**License:** MIT
