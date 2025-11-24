# 🎬 CAPD Streaming with CORS Proxy - START HERE

## Your Problem (SOLVED ✅)

You couldn't stream directly from the website without converting URLs to "embed" format.

**Why?** Browser security policies blocked direct access to streaming servers (CORS).

**Solution?** A CORS proxy server that acts as a middleman.

## Your Solution (READY ✅)

```
Before:
  Direct URL ❌ Blocked by CORS
  YouTube embedded ✅ Only option

After:
  Direct URL ✅ Works (via proxy)
  YouTube embedded ✅ Still works
  RTMP streams ✅ Now works
  Any HTTP stream ✅ Works
```

## What Was Created

### 1. **server.js** - Your CORS Proxy
   - Runs a web server with proxy capabilities
   - Handles all streaming requests
   - Adds CORS headers automatically
   - Serves your website files

### 2. **package.json** - Dependencies
   - Lists all required libraries
   - Simple `npm install` to set up

### 3. **tv.html** - Updated Player
   - Now supports proxy streaming
   - Auto-detects stream format
   - Routes through proxy when needed

### 4. **Documentation** (5 guides)
   - START_HERE.md (this file)
   - CORS_PROXY_QUICKSTART.md (2-minute setup)
   - CORS_PROXY_SETUP.md (complete guide)
   - CORS_PROXY_EXPLAINED.md (how it works)
   - CORS_PROXY_SUMMARY.md (overview)

## Getting Started (Right Now)

### Step 1: Install Node.js (if not already)
- Go to https://nodejs.org/
- Download LTS version
- Install and verify:
  ```bash
  node --version
  npm --version
  ```

### Step 2: Install Dependencies (1 command)
```bash
npm install
```

### Step 3: Start Server (1 command)
```bash
npm start
```

You'll see:
```
🚀 CAPD Streaming Proxy Server running on http://localhost:3000
📺 Serve your TV page at http://localhost:3000/tv.html
```

### Step 4: Use It
1. Open: http://localhost:3000/tv.html
2. Go to Admin (http://localhost:3000/admin/index.html)
3. Login (admin / capd2025)
4. Go to "My Tasks" (Channels)
5. Add a channel with ANY direct stream URL:
   ```
   https://stream.example.com/live.m3u8
   https://videos.example.com/stream.mp4
   rtmp://streaming.example.com/live
   ```
6. Click "Watch Live" on TV page

**That's it!** 🎉

## Common Stream URLs to Test

### Free Public Test Streams

**HLS Test Stream:**
```
https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8
```

**MP4 Test Stream:**
```
https://www.w3schools.com/html/mov_bbb.mp4
```

### Your Own Streams

Once you have your streaming server:
- HLS: `https://YOUR_SERVER/stream.m3u8`
- MP4: `https://YOUR_SERVER/video.mp4`
- RTMP: `rtmp://YOUR_SERVER/live`

## How to Use Different Stream Types

### YouTube (Still Works!)
**In Admin Panel:**
```
https://www.youtube.com/watch?v=VIDEO_ID
```
✅ Still uses embedded player (no proxy needed)

### Twitch (Still Works!)
**In Admin Panel:**
```
https://www.twitch.tv/CHANNEL_NAME
```
✅ Still uses embedded player (no proxy needed)

### HLS Streams (NEW - Now Works!)
**In Admin Panel:**
```
https://streaming.example.com/live.m3u8
```
✅ Routes through proxy automatically

### Direct MP4 Files (NEW - Now Works!)
**In Admin Panel:**
```
https://storage.example.com/video.mp4
https://cdn.example.com/stream.webm
```
✅ Routes through proxy automatically

### RTMP Streams (NEW - Now Works!)
**In Admin Panel:**
```
rtmp://streaming.example.com/live/stream
```
✅ Proxy converts RTMP to HTTP

### Local Files (Still Works!)
**In Admin Panel:**
```
/videos/myvideo.mp4
assets/streams/live.m3u8
```
✅ Direct access (no proxy needed)

## Troubleshooting

### Server won't start?
```bash
# Make sure Node.js is installed
node --version

# Make sure you're in the CAPD folder
cd path/to/CAPD

# Install dependencies
npm install

# Try again
npm start
```

### Can't access http://localhost:3000?
- Make sure server is running (see above)
- Check port 3000 is available:
  - Windows: `netstat -ano | findstr :3000`
  - Mac/Linux: `lsof -i :3000`
- If taken, use different port:
  ```bash
  PORT=8080 npm start
  ```

### Stream won't play?
1. Verify URL works in browser directly
2. Check browser console (F12) for errors
3. Make sure streaming server is online
4. Try a public test stream first

### "Cannot GET /tv.html"?
- Make sure you're accessing: `http://localhost:3000/tv.html`
- Not: `http://localhost:3000/` (root won't work)

## Next Steps

### Immediate (Now)
1. ✅ Run `npm install`
2. ✅ Run `npm start`
3. ✅ Open http://localhost:3000/tv.html
4. ✅ Add a test stream

### Short Term (This Week)
1. Test with your actual streaming server
2. Configure all your channels in admin panel
3. Add announcements and schedule
4. Customize the look and feel

### Medium Term (This Month)
1. Deploy to production (Heroku, DigitalOcean, etc.)
2. Add security features (if needed)
3. Set up domain/DNS
4. Get SSL certificate

### Long Term (Future)
1. Monitor performance
2. Optimize for more users
3. Add advanced features
4. Scale infrastructure

## Documentation Guide

| Need | Read |
|------|------|
| Quick setup (2 min) | CORS_PROXY_QUICKSTART.md |
| Complete setup | CORS_PROXY_SETUP.md |
| How it works | CORS_PROXY_EXPLAINED.md |
| Overview | CORS_PROXY_SUMMARY.md |
| To deploy online | CORS_PROXY_SETUP.md → Deployment section |
| Security setup | CORS_PROXY_SETUP.md → Security section |

## Testing Checklist

- [ ] Node.js installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Server running (`npm start`)
- [ ] Can access http://localhost:3000/tv.html
- [ ] Admin login works (admin / capd2025)
- [ ] Can add a channel
- [ ] Can add a stream URL
- [ ] Stream plays on TV page

## Architecture Reminder

```
┌─────────────────────────────────────────┐
│      Your CAPD Website Folder           │
├─────────────────────────────────────────┤
│ ┌──────────────────────────────────┐   │
│ │      Node.js Server (3000)       │   │
│ │  ┌──────────────────────────┐    │   │
│ │  │  Express Web Server      │    │   │
│ │  │  + CORS Proxy            │    │   │
│ │  │  + Static Files          │    │   │
│ │  └──────────────────────────┘    │   │
│ └──────────────────────────────────┘   │
│  tv.html, admin/dashboard.html, etc.   │
└─────────────────────────────────────────┘
         ↕ (Request/Response)
┌─────────────────────────────────────────┐
│   Streaming Servers (Anywhere)          │
│  stream.example.com, live.yoursite.com  │
│  youtube.com, twitch.tv, etc.          │
└─────────────────────────────────────────┘
```

## Key Concepts

### What is CORS?
Cross-Origin Resource Sharing - browser security feature that prevents websites from accessing data from different domains without permission.

### What does the proxy do?
Acts as a middleman. Your website requests from YOUR proxy (same domain = allowed). Your proxy requests from the streaming server and returns the data with proper headers (allowed).

### Why this works?
Browsers don't block requests within the same domain. The proxy is on your domain, so it's allowed.

### Is it secure?
For local/internal use: Yes. For public production: Add security features (whitelist, rate limit, auth).

## Support

### Issues?
1. Check browser console (F12) for error messages
2. Check terminal output for server errors
3. Verify streaming server URL is correct
4. Try public test stream first

### Questions?
Read the documentation files in order:
1. CORS_PROXY_QUICKSTART.md
2. CORS_PROXY_SETUP.md
3. CORS_PROXY_EXPLAINED.md

### Want to deploy online?
See CORS_PROXY_SETUP.md → "Deployment" section

## You're Ready! 🚀

Everything you need is installed and configured. Just:

```bash
npm start
```

Then visit: http://localhost:3000/tv.html

**Enjoy your streaming platform!** 📺
