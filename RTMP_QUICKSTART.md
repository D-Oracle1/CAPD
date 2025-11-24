# 🚀 RTMP Server Quick Start (5 Minutes)

## What You're Setting Up

A complete RTMP streaming server that:
- ✅ Accepts broadcasts from OBS, FFmpeg, etc.
- ✅ Converts to HLS for web playback
- ✅ Works with CAPD platform
- ✅ Runs locally or in production

## Prerequisites

```bash
# Check you have Node.js
node --version

# You should already have npm packages installed
npm list
```

## Step 1: Install FFmpeg (2 minutes)

FFmpeg converts RTMP streams to HLS (required).

### Windows
```bash
# Option 1: Using Chocolatey
choco install ffmpeg

# Option 2: Manual download
# Go to: https://ffmpeg.org/download.html
# Download, extract, add to PATH
```

### Mac
```bash
brew install ffmpeg
```

### Linux (Ubuntu)
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Verify Installation
```bash
ffmpeg -version
# Should show version info
```

## Step 2: Update Dependencies (1 minute)

```bash
npm install
```

Installs `node-media-server` and `concurrently`.

## Step 3: Start Both Servers (1 minute)

```bash
npm run both
```

Or in separate terminals:

**Terminal 1:** CORS Proxy
```bash
npm start
```

**Terminal 2:** RTMP Server
```bash
npm run rtmp-server
```

You should see:
```
🚀 CAPD Streaming Proxy Server running on http://localhost:3000
🎬 CAPD RTMP Server Started
   RTMP: rtmp://localhost:1935/live
   HLS:  http://localhost:8000/live/STREAM_NAME/index.m3u8
```

## Step 4: Configure OBS Studio (1 minute)

### Install OBS

Download from: https://obsproject.com/

### Configure Streaming

1. **Settings** → **Stream**
2. **Service:** Custom
3. **Server:** `rtmp://localhost:1935/live`
4. **Stream Key:** `mystream` (any name)
5. **Click OK**

### Configure Output (Optional)

1. **Settings** → **Output**
2. Set **Bitrate** to `4000` (for 720p quality)
3. **Click OK**

## Step 5: Broadcast (1 minute)

1. **Click "Start Streaming"** in OBS
2. Wait 5-10 seconds for stream to start
3. Should see status "Streaming" in OBS

## Step 6: Watch in CAPD (1 minute)

### Add to Channels

1. Open: http://localhost:3000/admin/index.html
2. **Login:** admin / capd2025
3. Go to **Channels** (My Tasks)
4. **Add Channel**
5. **Stream URL:**
   ```
   http://localhost:8000/live/mystream/index.m3u8
   ```
6. **Save**

### Watch Stream

1. Open: http://localhost:3000/tv.html
2. Select your channel
3. Click **Watch Live**
4. **Stream plays!** 🎉

## That's It!

You're now broadcasting to your own RTMP server.

## Common Issues

| Issue | Fix |
|-------|-----|
| RTMP server won't start | Make sure FFmpeg is installed: `ffmpeg -version` |
| "Connection refused" in OBS | Check RTMP server is running (`npm run rtmp-server`) |
| HLS plays slowly | Lower bitrate in OBS (try 2000 kbps) |
| Stream keeps disconnecting | Check internet connection, try lower bitrate |

## Streaming with FFmpeg

Test without OBS:

```bash
# Broadcast test pattern for 30 seconds
ffmpeg -f lavfi -i testsrc=duration=30:size=1280x720:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=30 \
  -c:v libx264 -b:v 4000k -c:a aac -b:a 128k \
  -f flv rtmp://localhost:1935/live/test
```

Then watch at: `http://localhost:8000/live/test/index.m3u8`

## Broadcasting a File

```bash
ffmpeg -i "myvideo.mp4" -c:v libx264 -preset fast -b:v 4000k \
  -c:a aac -b:a 128k -f flv rtmp://localhost:1935/live/video
```

Then add to CAPD:
```
http://localhost:8000/live/video/index.m3u8
```

## Check Active Streams

```bash
curl http://localhost:3000/api/streams
```

Returns JSON with all active streams.

## Stop Broadcasting

1. **In OBS:** Click "Stop Streaming"
2. **In browser:** Stream will stop playing automatically

## Stop Server

```bash
Ctrl + C (in terminal)
```

## Next Steps

- Read **RTMP_SERVER_GUIDE.md** for complete details
- Deploy to production (see guide)
- Configure security (see guide)
- Monitor streams with API

## Reference

```
RTMP Address:     rtmp://localhost:1935/live/STREAM_NAME
HLS Address:      http://localhost:8000/live/STREAM_NAME/index.m3u8
CORS Proxy:       http://localhost:3000
Admin Panel:      http://localhost:3000/admin/index.html
TV Page:          http://localhost:3000/tv.html
API - Streams:    http://localhost:3000/api/streams
API - Health:     http://localhost:3000/api/health
```

## Troubleshooting Commands

```bash
# Check if servers are running
curl http://localhost:3000/api/health
curl http://localhost:8000/

# Check active streams
curl http://localhost:3000/api/streams

# Check ports
netstat -ano | findstr :1935     # Windows
lsof -i :1935                     # Mac/Linux

# Check FFmpeg
ffmpeg -version
```

**You're all set!** Start streaming now. 🎬
