# 🎬 CAPD Custom RTMP Server Guide

## Overview

The CAPD RTMP Server allows you to:
- ✅ Broadcast live streams using OBS, FFmpeg, or any RTMP-compatible encoder
- ✅ Convert RTMP streams to HLS for browser playback
- ✅ Run your own streaming infrastructure
- ✅ Stream without relying on YouTube/Twitch
- ✅ Full control over your broadcasting

## What is RTMP?

**RTMP** = Real Time Messaging Protocol
- Protocol for streaming audio/video over the internet
- Used by OBS, FFmpeg, and professional broadcasting software
- Server receives the stream and makes it available to viewers
- Requires conversion to HLS for web browsers

## System Requirements

### For Running RTMP Server
- Node.js 14+ (already installed for CORS proxy)
- FFmpeg (for stream encoding/conversion)
- 1GB RAM minimum
- Linux/Mac/Windows

### For Broadcasting to RTMP Server
- OBS Studio (free)
- FFmpeg (free)
- Another RTMP encoder

## Installation

### Step 1: Install FFmpeg

**Windows:**
```bash
# Using chocolatey (if installed)
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
# Add to PATH environment variable
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Step 2: Update Dependencies

Navigate to your CAPD folder and update npm packages:
```bash
npm install
```

This will install:
- `node-media-server` - RTMP server
- `concurrently` - Run multiple servers at once

## Running the Servers

### Option 1: CORS Proxy Only (for embedded streams)
```bash
npm start
# Runs on http://localhost:3000
```

### Option 2: RTMP Server Only
```bash
npm run rtmp-server
# RTMP: rtmp://localhost:1935/live
# HLS:  http://localhost:8000/live
```

### Option 3: Both Servers (Recommended)
```bash
npm run both
# CORS Proxy: http://localhost:3000
# RTMP:       rtmp://localhost:1935/live
# HLS:        http://localhost:8000/live
```

In separate terminals:
```bash
# Terminal 1
npm start

# Terminal 2
npm run rtmp-server
```

## Broadcasting with OBS Studio

### Step 1: Install OBS

Download from: https://obsproject.com/

### Step 2: Configure Stream Settings

1. **Open OBS Studio**
2. **Settings** → **Stream**
3. **Service:** Custom
4. **Server:** `rtmp://localhost:1935/live`
5. **Stream Key:** `mystream` (or any name you want)
6. **Click OK**

### Step 3: Configure Output

1. **Settings** → **Output**
2. Set these values:
   - **Bitrate:** 4000 kbps (for 1080p)
   - **Audio Bitrate:** 128 kbps
3. **Click OK**

### Step 4: Start Broadcasting

1. **Click "Start Streaming"**
2. You should see the stream starting in OBS
3. HLS will be available at:
   ```
   http://localhost:8000/live/mystream/index.m3u8
   ```

## Using RTMP Stream in CAPD Platform

### Method 1: Direct HLS (Easiest)

Once your RTMP stream is broadcasting:

1. **Go to Admin Panel** → http://localhost:3000/admin/index.html
2. **Login:** admin / capd2025
3. **Go to Channels** (My Tasks)
4. **Add Channel**
5. **Stream URL:**
   ```
   http://localhost:8000/live/mystream/index.m3u8
   ```
6. **Save**
7. **Go to TV page** → http://localhost:3000/tv.html
8. **Select channel** → **Watch Live**

### Method 2: Custom RTMP Configuration

You can also configure custom RTMP in admin panel:

1. **Go to Admin Panel** → Settings (⚙️)
2. **Streaming Setup** → **Custom RTMP**
3. **Fill in:**
   - **RTMP Server:** `rtmp://localhost:1935/live`
   - **Stream Key:** `mystream`
   - **HLS Stream URL:** `http://localhost:8000/live/mystream/index.m3u8`
4. **Save Custom Configuration**

## Broadcasting with FFmpeg

### Basic Example

```bash
# Broadcast a video file to RTMP
ffmpeg -i "video.mp4" -c:v libx264 -preset fast -b:v 4000k -c:a aac -b:a 128k -f flv "rtmp://localhost:1935/live/mystream"
```

### Broadcast Desktop Screen

**Windows:**
```bash
ffmpeg -f gdigrab -i desktop -c:v libx264 -preset fast -b:v 4000k -c:a aac -b:a 128k -f flv "rtmp://localhost:1935/live/desktop"
```

**Mac:**
```bash
ffmpeg -f avfoundation -i "1" -c:v libx264 -preset fast -b:v 4000k -c:a aac -b:a 128k -f flv "rtmp://localhost:1935/live/desktop"
```

**Linux:**
```bash
ffmpeg -f x11grab -i :0.0 -c:v libx264 -preset fast -b:v 4000k -c:a aac -b:a 128k -f flv "rtmp://localhost:1935/live/desktop"
```

### Broadcast Webcam

**Windows:**
```bash
ffmpeg -f dshow -i video="Integrated Webcam" -c:v libx264 -preset fast -b:v 2000k -f flv "rtmp://localhost:1935/live/webcam"
```

**Mac:**
```bash
ffmpeg -f avfoundation -i "0" -c:v libx264 -preset fast -b:v 2000k -f flv "rtmp://localhost:1935/live/webcam"
```

**Linux:**
```bash
ffmpeg -f v4l2 -i /dev/video0 -c:v libx264 -preset fast -b:v 2000k -f flv "rtmp://localhost:1935/live/webcam"
```

## Architecture

### How RTMP Server Works

```
┌────────────────────────────────────────────────────────────┐
│                   Your Broadcasting                         │
│  OBS / FFmpeg / Other RTMP Encoder                          │
└─────────────────────┬────────────────────────────────────────┘
                      │ RTMP Stream
                      ▼
┌────────────────────────────────────────────────────────────┐
│            RTMP Server (Port 1935)                          │
│  ├─ Receives RTMP stream                                   │
│  ├─ Validates connection                                   │
│  └─ Converts to HLS                                        │
└─────────────────────┬────────────────────────────────────────┘
                      │ HLS Segments
                      ▼
┌────────────────────────────────────────────────────────────┐
│         HLS HTTP Server (Port 8000)                         │
│  ├─ Serves .m3u8 manifests                                 │
│  └─ Serves .ts video segments                              │
└─────────────────────┬────────────────────────────────────────┘
                      │ HTTP Requests
                      ▼
┌────────────────────────────────────────────────────────────┐
│              Web Browsers                                   │
│  ├─ HTML5 Video Player                                     │
│  ├─ HLS.js Library                                         │
│  └─ Safari (native HLS)                                    │
└────────────────────────────────────────────────────────────┘
```

### With CORS Proxy

```
Broadcasting ──► RTMP Server ──► HLS Files
                      │
                      │
                      ▼
            CORS Proxy Server (Port 3000)
                      │
                      ├─► Serves TV page
                      ├─► Serves Admin panel
                      ├─► Proxies external streams
                      └─► Serves HLS files from RTMP
                      │
                      ▼
                 Web Browsers
```

## API Endpoints

### Get All Active Streams
```
GET /api/streams
```

Response:
```json
{
  "streams": {
    "mystream": {
      "status": "live",
      "name": "mystream",
      "hlsUrl": "http://localhost:8000/live/mystream/index.m3u8",
      "startTime": "2024-11-24T12:00:00.000Z"
    }
  },
  "count": 1
}
```

### Get Specific Stream Info
```
GET /api/streams/mystream
```

Response:
```json
{
  "status": "live",
  "name": "mystream",
  "hlsUrl": "http://localhost:8000/live/mystream/index.m3u8",
  "startTime": "2024-11-24T12:00:00.000Z"
}
```

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-24T12:00:00.000Z"
}
```

## Stream URLs

### HLS Manifest
```
http://localhost:8000/live/STREAM_NAME/index.m3u8
```

### Direct Stream Access
```
http://localhost:3000/hls/STREAM_NAME/index.m3u8
```

### RTMP Server
```
rtmp://localhost:1935/live/STREAM_NAME
```

## Configuration

### Environment Variables

Create `.env` file or set these:

```bash
# CORS Proxy
PORT=3000
NODE_ENV=production

# RTMP Server
RTMP_PORT=1935
HTTP_PORT=8000
FFMPEG_PATH=/usr/bin/ffmpeg  # Path to FFmpeg
LOG_LEVEL=warn
```

### Advanced RTMP Config

Edit `rtmp-server.js` to change:

```javascript
// Port configuration
rtmp: {
  port: 1935,           // RTMP listen port
  chunk_size: 60000,    // Chunk size for streaming
  gop_cache: true,      // Cache keyframes
  ping: 30,             // Ping interval
  ping_timeout: 60      // Ping timeout
}

// HLS settings
hlsFlags: '[hls_list_size=10:hls_time=10]'
// hls_list_size: Number of segments in playlist (10)
// hls_time: Duration of each segment (10 seconds)
```

## Bitrate Recommendations

### Quality vs Bandwidth

| Quality | Bitrate | Resolution | FPS | Bandwidth (per user) |
|---------|---------|-----------|-----|----------------------|
| 360p | 1000 kbps | 640x360 | 30 | 1 Mbps |
| 480p | 2000 kbps | 854x480 | 30 | 2 Mbps |
| 720p | 4000 kbps | 1280x720 | 30 | 4 Mbps |
| 1080p | 6000 kbps | 1920x1080 | 30 | 6 Mbps |

### For Broadcasting

**Recommended for CAPD:**
- **Bitrate:** 4000 kbps (720p quality)
- **Audio:** 128 kbps
- **FPS:** 30
- **Resolution:** 1280x720

This gives good quality without overwhelming the server.

## Troubleshooting

### Stream won't connect

**Problem:** "Connection refused" when trying to broadcast

**Solutions:**
1. Check RTMP server is running: `npm run rtmp-server`
2. Check firewall allows port 1935
3. Check FFmpeg/OBS is using correct server address
4. Try `rtmp://127.0.0.1:1935/live` instead of localhost

### Stream goes offline immediately

**Problem:** Stream starts but stops after 1-2 seconds

**Solutions:**
1. Check bitrate isn't too high (use 4000 kbps max)
2. Check network connection stability
3. Check CPU usage (streaming is CPU-intensive)
4. Try a lower resolution (720p instead of 1080p)

### HLS not playing in browser

**Problem:** Got HLS URL but video won't play

**Solutions:**
1. Check HLS URL is accessible: Visit in browser
2. Should see list of `.ts` files
3. Check CORS headers are set (server should have them)
4. Try in Chrome (best HLS support)
5. Check TV page has HLS.js loaded

### FFmpeg not found

**Problem:** "ffmpeg: command not found"

**Solutions:**
1. Install FFmpeg (see Installation section)
2. Add FFmpeg to PATH
3. Verify installation: `ffmpeg -version`
4. Specify full path in `.env`: `FFMPEG_PATH=/usr/local/bin/ffmpeg`

### Server crashes

**Problem:** RTMP server keeps crashing

**Solutions:**
1. Check error logs in terminal
2. Make sure FFmpeg is installed
3. Check port 1935 isn't already in use
4. Check port 8000 isn't already in use
5. Try stopping and restarting

## Performance Optimization

### For Low-Bandwidth Networks

```bash
# Lower bitrate
ffmpeg -i "video.mp4" -b:v 2000k -c:a aac -b:a 64k -f flv "rtmp://localhost:1935/live/stream"
```

### For High-Quality Streaming

```bash
# Higher bitrate
ffmpeg -i "video.mp4" -b:v 6000k -c:a aac -b:a 192k -f flv "rtmp://localhost:1935/live/stream"
```

### Monitor Stream Health

Check active streams:
```bash
curl http://localhost:3000/api/streams
```

## Deploying RTMP Server to Production

### Important Considerations

1. **Port Forwarding:** Open ports 1935 and 8000 on firewall
2. **SSL/TLS:** Use RTMPS (secure) for production
3. **Authentication:** Add stream key validation
4. **Bandwidth:** RTMP streams consume significant bandwidth
5. **Security:** Whitelist RTMP sources, rate limit

### On DigitalOcean Droplet

```bash
# 1. SSH into server
ssh root@your_server_ip

# 2. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install FFmpeg
sudo apt-get install ffmpeg

# 4. Clone and setup
git clone https://github.com/your-repo/capd.git
cd capd
npm install

# 5. Run with PM2
npm install -g pm2
pm2 start server.js --name "cors-proxy"
pm2 start rtmp-server.js --name "rtmp-server"
pm2 startup
pm2 save

# 6. Broadcast to
rtmp://your_server_ip:1935/live/stream
```

## Broadcasting to Production

Once deployed:

1. **In OBS Settings:**
   - Server: `rtmp://your_server_ip:1935/live`
   - Stream Key: `mystream`

2. **In CAPD Admin Panel:**
   - Stream URL: `http://your_server_ip:8000/live/mystream/index.m3u8`

3. **Public Share:**
   - TV URL: `http://your_server_ip/tv.html`

## Security

### For Production Setup

1. **Firewall Rules**
   ```bash
   # Only allow RTMP from your IPs
   ufw allow from YOUR_IP to any port 1935
   ufw allow 3000  # CORS proxy
   ufw allow 8000  # HLS server
   ```

2. **Stream Key Validation**
   ```javascript
   // Add to rtmp-server.js
   nms.on('prePublish', (id, StreamPath, args) => {
     const streamKey = StreamPath.split('/').pop();
     const validKeys = process.env.VALID_STREAM_KEYS?.split(',') || [];

     if (!validKeys.includes(streamKey)) {
       id.reject();  // Reject invalid streams
     }
   });
   ```

3. **Rate Limiting**
   ```javascript
   // Add to server.js
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   app.use('/hls', limiter);
   ```

## Quick Reference

### Start All Services
```bash
npm run both
```

### Broadcast from OBS
- Server: `rtmp://localhost:1935/live`
- Key: `mystream`

### Watch in Browser
- Direct: `http://localhost:8000/live/mystream/index.m3u8`
- Via Platform: Add to channels, watch on TV page

### Check Status
```bash
curl http://localhost:3000/api/streams
```

### Stop All Services
```bash
Ctrl + C (in both terminals)
```

## Support

### Debug Mode

Enable verbose logging:
```bash
LOG_LEVEL=debug npm run rtmp-server
```

### Check Ports

```bash
# Windows
netstat -ano | findstr :1935
netstat -ano | findstr :8000

# Mac/Linux
lsof -i :1935
lsof -i :8000
```

### Test FFmpeg

```bash
# List devices
ffmpeg -list_devices true -f dshow -i dummy  # Windows

# Test broadcast
ffmpeg -f lavfi -i testsrc=duration=10:size=1280x720:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=10 \
  -c:v libx264 -b:v 4000k -c:a aac -b:a 128k \
  -f flv rtmp://localhost:1935/live/test
```

## Next Steps

1. ✅ Install FFmpeg
2. ✅ Run `npm run both`
3. ✅ Configure OBS with RTMP settings
4. ✅ Start broadcasting
5. ✅ Add HLS URL to CAPD channels
6. ✅ Watch on TV page

**You're ready to broadcast!** 🎬
