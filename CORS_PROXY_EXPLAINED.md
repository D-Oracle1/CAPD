# How the CORS Proxy Works (Technical Explanation)

## The Problem: CORS Restrictions

### Browser Security Model
```
Your Website                    Streaming Server
(localhost:3000)    ❌ Direct     (stream.example.com)
                      Access
```

Browsers **block** cross-origin requests for security. When `tv.html` tries to fetch from `stream.example.com`, the browser blocks it:

```
Error: Access to XMLHttpRequest at 'https://stream.example.com/live.m3u8'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

## The Solution: CORS Proxy

### Proxy Architecture
```
Your Website        CORS Proxy Server       Streaming Server
(localhost:3000) ─► (localhost:3000) ────► (stream.example.com)
   ✅ Same Origin      Add CORS Headers        Original Stream
```

### How It Works

1. **Browser makes request to proxy:**
   ```
   GET /api/stream?url=https%3A%2F%2Fstream.example.com%2Flive.m3u8
   ```

2. **Proxy server:**
   - Decodes the URL
   - Validates it's a real streaming URL
   - Fetches the stream from the real server
   - Adds CORS headers to the response

3. **Response goes back to browser:**
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET, HEAD, OPTIONS
   (stream data here)
   ```

4. **Browser accepts it** because now it has CORS headers ✅

## Code Walkthrough

### Client Side (tv.html)

**Before (didn't work):**
```javascript
// This gets blocked by CORS policy
fetch('https://stream.example.com/live.m3u8')
```

**After (works):**
```javascript
// This goes to YOUR server (same origin = no CORS problem)
fetch('/api/stream?url=' + encodeURIComponent('https://stream.example.com/live.m3u8'))
```

### Server Side (server.js)

```javascript
// User's request comes in with encoded URL
app.get('/api/stream', (req, res) => {
  const streamUrl = req.query.url;  // https://stream.example.com/live.m3u8

  // Create a proxy that:
  // 1. Fetches from the real streaming server
  // 2. Adds CORS headers automatically
  // 3. Streams response back to client
  const proxy = createProxyMiddleware({
    target: decodeURIComponent(streamUrl),
    changeOrigin: true,  // ← This adds CORS headers
    // ... more config
  });

  proxy(req, res);  // Handle the request
});
```

## Stream Format Support

### HLS Streams (.m3u8)

**Flow:**
```
Browser
   ↓
GET /api/stream?url=stream.m3u8
   ↓
Server fetches manifest
   ↓
Adds CORS headers
   ↓
Returns to browser
   ↓
HLS.js player handles it
```

**Code in tv.html:**
```javascript
if (streamUrl.includes('.m3u8')) {
  // Use proxy but HLS.js handles the manifest
  loadHLSStream(streamUrl);  // Still works with proxy
}
```

### RTMP Streams

**Problem:** RTMP is not HTTP, browsers can't play it directly

**Solution:** Proxy converts RTMP to HTTP
```
RTMP Stream                Proxy converts              Browser sees
rtmp://server/live    ──►  to HTTP protocol      ──►  HTTP stream
```

**Code in tv.html:**
```javascript
if (streamUrl.startsWith('rtmp')) {
  // Route through proxy to convert RTMP to HTTP
  loadProxyStream(streamUrl);
}
```

### Direct MP4/WebM Files

**Browser tries to fetch:**
```javascript
// CORS blocked without proxy
GET https://stream.example.com/video.mp4
```

**With proxy:**
```javascript
// Goes through proxy instead
GET /api/stream?url=https%3A%2F%2Fstream.example.com%2Fvideo.mp4
```

## Security Considerations

### What the Proxy Does (Good ✅)
- Allows legitimate streaming
- Adds CORS headers only for streaming
- Validates URL format
- Error handling for bad streams

### What the Proxy Doesn't Do (Know This ⚠️)

```javascript
// Current code accepts ANY URL
const decodedUrl = decodeURIComponent(streamUrl);
// Proxy will try to fetch from anywhere!
```

**For Production, you should:**

```javascript
// Option 1: Whitelist domains
const ALLOWED_DOMAINS = [
  'stream.example.com',
  'live.youtube.com',
  'twitch.tv'
];

if (!ALLOWED_DOMAINS.some(domain => decodedUrl.includes(domain))) {
  return res.status(403).json({ error: 'Domain not allowed' });
}

// Option 2: Whitelist patterns
if (!decodedUrl.match(/^https?:\/\/(stream\.example\.com|live\..*\.com)/)) {
  return res.status(403).json({ error: 'Invalid stream domain' });
}
```

## Performance Implications

### Bandwidth Usage
```
Old way (YouTube embedded):
  YouTube handles streaming ✅

New way (CORS proxy):
  Stream → Proxy → Your browser
  Uses YOUR server bandwidth ⚠️
```

**For many users:**
- Each stream goes through your server
- Can impact bandwidth/costs
- Consider load balancing if needed

### Latency
```
Before: Browser ──► Streaming Server (fast, direct)
After:  Browser ──► Your Server ──► Streaming Server (one extra hop)
```

**Impact:**
- Small delay increase (usually <100ms)
- Acceptable for live TV
- Consider for ultra-low-latency needs

## Monitoring the Proxy

### Logs
```
npm start
# Shows every request:
[GET /api/stream] - Streaming to client
[GET /api/health] - Health check OK
```

### Debug Mode
```javascript
// In server.js, change logLevel:
logLevel: 'debug'  // More verbose
logLevel: 'warn'   // Less verbose
```

## Upgrades to Consider

### 1. Add Caching
```javascript
// Cache HLS manifests for better performance
const cacheMiddleware = require('express-cache-middleware');
app.use(cacheMiddleware(3600)); // 1 hour cache
```

### 2. Add Rate Limiting
```javascript
// Prevent abuse
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);
```

### 3. Add Authentication
```javascript
// Only allow authenticated users
app.use((req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
});
```

### 4. Stream to Multiple Users
```javascript
// Currently: One stream fetched per user
// Upgrade: Fetch once, stream to many users
const stream = require('stream');
app.get('/api/stream/:id', streamCache.getOrFetch);
```

## Limitations & Workarounds

### Limitation 1: RTMP Conversion
RTMP is not HTTP, so conversion happens:
```
rtmp://server/live  ──► Proxy ──► HTTP stream for browser
```
**Workaround:** Use HLS instead of RTMP when possible

### Limitation 2: Streaming Server Must Be Online
If streaming server is down, proxy can't help:
```
Browser ──► Proxy ──► Streaming Server ❌
```
**Workaround:** Add fallback streams or health checks

### Limitation 3: Requires Server Bandwidth
All streams go through your server:
```
User 1 ──┐
User 2 ──┤──► Your Server ──► Streaming Server
User 3 ──┘
```
**Workaround:** Consider CDN or load balancing for scale

## Debugging Streams

### Test with cURL
```bash
# Test if stream is accessible
curl -v "http://localhost:3000/api/stream?url=https%3A%2F%2Flive.example.com%2Fstream.m3u8"

# Should return manifest with CORS headers
Access-Control-Allow-Origin: *
```

### Browser Console (F12)
```javascript
// Test proxy endpoint
fetch('/api/stream?url=' + encodeURIComponent('YOUR_STREAM_URL'))
  .then(r => r.text())
  .then(data => console.log(data))
  .catch(e => console.error(e))
```

### Server Logs
```bash
npm start
# Watch for errors in terminal output
```

## Conclusion

The CORS proxy solves the fundamental browser security limitation that prevented direct streaming. It:

1. ✅ Allows any HTTP stream format
2. ✅ Converts RTMP to HTTP
3. ✅ Handles CORS automatically
4. ✅ Simple to deploy
5. ⚠️ Uses your server bandwidth
6. ⚠️ One extra network hop

Perfect for:
- Small to medium deployments
- Testing and development
- Internal use cases

Consider alternatives for:
- Massive scale (CDN)
- Ultra-low latency (direct streaming)
- Heavy bandwidth usage (dedicated infrastructure)
