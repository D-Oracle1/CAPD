# 🚀 CORS Proxy - Quick Start (2 Minutes)

## The Problem You Just Fixed

**Before:** You could only use embedded URLs (YouTube, Twitch)
```
❌ https://stream.example.com/live.m3u8  (didn't work)
❌ rtmp://stream.example.com/live        (didn't work)
✅ https://www.youtube.com/watch?v=...   (only option)
```

**Now:** You can use any direct stream URL
```
✅ https://stream.example.com/live.m3u8  (now works!)
✅ rtmp://stream.example.com/live        (now works!)
✅ https://www.youtube.com/watch?v=...   (still works)
```

## Installation (Literally 2 Commands)

### 1️⃣ Install Dependencies
Open your terminal in the CAPD folder and run:
```bash
npm install
```

### 2️⃣ Start the Server
```bash
npm start
```

You'll see:
```
🚀 CAPD Streaming Proxy Server running on http://localhost:3000
📺 Serve your TV page at http://localhost:3000/tv.html
```

**Done!** Your proxy server is running.

## Using Direct Stream URLs Now

### In Admin Panel:
1. Go to **Admin Dashboard** → **Channels**
2. Add or edit a channel
3. Paste any direct stream URL:
   ```
   https://stream.example.com/live.m3u8
   https://stream.example.com/stream.mp4
   rtmp://stream.example.com/live
   ```
4. Click **Save Channel**
5. Go to TV page → select channel → **watch live!**

### That's It!

The proxy handles CORS automatically. No more embedding required.

## Common Stream URLs

### HLS (Recommended)
- Streaming platform: `https://live.example.com/stream.m3u8`
- Works on all browsers
- Best for quality streaming

### MP4 Direct
- Video file: `https://videos.example.com/stream.mp4`
- Works for stored videos
- Good for on-demand content

### RTMP
- Broadcasting tool: `rtmp://streaming.example.com/live`
- For OBS/streaming software
- Proxy converts to HTTP

## Testing Your Setup

### 1. Check if server is running
Open browser: `http://localhost:3000/api/health`

Should see:
```json
{"status":"ok","timestamp":"2024-11-24T..."}
```

### 2. Visit TV page
Open: `http://localhost:3000/tv.html`

### 3. Add a test stream
Use a public test stream:
```
https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8
```

## Windows Users

If `npm start` doesn't work:

### Option 1: Use PowerShell
```powershell
npm start
```

### Option 2: Use Command Prompt as Admin
```cmd
npm start
```

### Option 3: Use Git Bash
```bash
npm start
```

## Mac Users

```bash
npm start
```

That's it!

## Linux Users

```bash
npm start
```

That's it!

## Stopping the Server

Press `Ctrl + C` in the terminal.

## Restarting the Server

```bash
npm start
```

## Next: Deploy to Production

When you're ready to deploy online, see **CORS_PROXY_SETUP.md** for:
- Heroku deployment
- DigitalOcean deployment
- Your own server deployment

## Common Issues?

| Issue | Solution |
|-------|----------|
| `Port 3000 already in use` | `PORT=8080 npm start` |
| `npm not found` | Install Node.js from nodejs.org |
| `Module not found` | Run `npm install` first |
| `Stream won't play` | Verify URL works in browser first |

## You're All Set! 🎉

Your streaming platform now supports:
- YouTube / Twitch (embedded)
- Direct HLS streams
- Direct MP4 files
- RTMP broadcasts
- Custom streaming servers

Any questions? Check **CORS_PROXY_SETUP.md** for detailed info.
