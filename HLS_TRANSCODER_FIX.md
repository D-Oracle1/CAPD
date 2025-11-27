# HLS Transcoder Fix - Root Cause & Solution

## Problem
The HLS transcoder was in a continuous restart loop, repeatedly failing to connect to RTMP streams:
```
[HLS] Starting transcoding for: main
[HLS] FFmpeg stopped for "main" (code: 2880417800)
[HLS] Cleaning up: ...
[HLS] Starting transcoding for: main  <- Loops endlessly
```

## Root Cause
1. **Timing Mismatch**: The transcoder was trying to connect to RTMP streams before they were actually publishing
2. **No Coordination**: The HLS transcoder and RTMP server weren't communicating about stream lifecycle
3. **Premature Connection**: The 2-second monitoring interval started FFmpeg transcoding before any actual stream data was available
4. **No Connection Timeout**: FFmpeg had no timeout parameters, so it would hang or fail silently

## Solution

### 1. **Add FFmpeg Connection Timeouts** (hls-transcoder.js)
```javascript
'-rw_timeout', '5000000',        // 5 second timeout for RTMP connection
'-connect_timeout', '5000000',   // 5 second timeout for connection
```
These parameters allow FFmpeg to gracefully handle delayed connections.

### 2. **Implement Direct API Communication**
**RTMP Server** → (HTTP API) → **HLS Transcoder**

When a stream starts publishing:
```javascript
// rtmp-server.js - postPublish event
GET http://localhost:3002/start?stream=main
```

When a stream stops:
```javascript
// rtmp-server.js - donePublish event
GET http://localhost:3002/stop?stream=main
```

### 3. **Improve Error Logging** (hls-transcoder.js)
Track whether FFmpeg actually connected:
- `isTranscoding = true` when "Opening rtmp://" is seen in stderr
- Distinguish between "failed to connect" vs "stopped normally"
- Log actual error details when connection fails

### 4. **Better Connection State Tracking**
```javascript
let isTranscoding = false;

ffmpeg.stderr.on('data', (data) => {
  if (output.includes('Opening') || output.includes('rtmp://')) {
    isTranscoding = true;
    console.log(`✓ Connected to RTMP stream: ${streamName}`);
  }
});

ffmpeg.on('close', (code) => {
  const status = isTranscoding ? 'stopped' : 'failed to connect';
  console.log(`[HLS] FFmpeg ${status}...`);
});
```

## How It Works Now

### Stream Lifecycle
1. **OBS/FFmpeg publishes** → `rtmp://localhost:1935/live/mystream`
2. **RTMP Server detects** → `postPublish` event
3. **RTMP Server notifies** → HLS Transcoder API `GET /start?stream=mystream`
4. **HLS Transcoder starts** → FFmpeg connects with 5-second timeout
5. **FFmpeg connects successfully** → Begins HLS segmentation
6. **Stream continues** → HLS segments are served at `http://localhost:8000/live/mystream/index.m3u8`
7. **Publisher stops** → RTMP Server detects `donePublish` event
8. **RTMP Server notifies** → HLS Transcoder API `GET /stop?stream=mystream`
9. **HLS Transcoder stops** → Sends SIGTERM to FFmpeg
10. **Cleanup** → HLS directory is cleaned up

## Advantages

✅ **No Loop**: Transcoding starts only when stream is actively publishing
✅ **Proper Cleanup**: Streams stop cleanly when publisher disconnects
✅ **Better Visibility**: Clear logging of connection success/failure
✅ **Reliable**: 5-second timeout gives FFmpeg time to connect
✅ **Scalable**: API-based communication works for multiple streams

## Testing

To verify the fix:

1. **Start Services**
   ```bash
   npm run both
   ```

2. **Publish a Stream** (OBS or FFmpeg)
   ```bash
   ffmpeg -i video.mp4 -c:v copy -c:a copy -f flv rtmp://localhost:1935/live/test
   ```

3. **Verify Transcoding**
   ```
   [HLS] Starting transcoding for: test
   [HLS] ✓ Connected to RTMP stream: test
   [HLS] FFmpeg: Opening rtmp://localhost:1935/live/test
   [HLS] FFmpeg: segment... (continuous output)
   ```

4. **Watch Stream**
   - Open browser: `http://localhost:8000/live/test/index.m3u8`
   - Or in CAPD platform

5. **Stop Stream**
   - FFmpeg/OBS stops publishing
   - HLS Transcoder receives `donePublish` event
   - Transcoding stops cleanly
   - No loops or errors

## Files Modified
- `hls-transcoder.js` - Connection handling, logging, state tracking
- `rtmp-server.js` - API calls to coordinate with HLS transcoder

## Commit
```
bde9d36 - Fix HLS transcoder connection and stream lifecycle issues
```
