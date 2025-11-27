# Testing HLS Transcoding

## Prerequisites
- All servers running: `npm run both`
- FFmpeg installed and in PATH
- A video file to stream

## Option 1: Stream with FFmpeg (Recommended)

### Test Video File
Create a simple test video or use an existing one. For quick testing, create a test pattern:

```bash
ffmpeg -f lavfi -i color=c=blue:s=1280x720:d=5 -f lavfi -i sine=f=1000:d=5 -pix_fmt yuv420p test-video.mp4
```

### Stream to RTMP

```bash
ffmpeg -re -i test-video.mp4 -c:v copy -c:a copy -f flv rtmp://localhost:1935/live/test
```

**Expected Output:**
```
[1] [RTMP Server] Publishing to: /live/test
[1] [RTMP Server] ✅ Publishing: test
[3] [HLS] Starting transcoding for: test
[3] [HLS] ✓ Actively transcoding: test
[3] [HLS] FFmpeg: ... frame output ...
```

## Option 2: Stream with OBS

1. Open OBS
2. Settings → Stream
3. Service: Custom RTMP Server
4. Server: `rtmp://localhost:1935/live`
5. Stream Key: `mystream`
6. Start Streaming

## View the Stream

Once streaming:

1. **Browser**: Open `http://localhost:3000/tv.html`
2. **URL to stream**: `http://localhost:8000/live/test/index.m3u8` (replace `test` with your stream name)

## Troubleshooting

### FFmpeg says "End of stream"
This means the input stream was too short or ended abruptly. The transcoder will clean up automatically.

### 404 Not Found for m3u8
FFmpeg didn't successfully create the HLS segments. Check the terminal for FFmpeg errors - they'll show in the console.

### Port Conflicts
If ports are held by old processes:
```bash
# Kill all Node processes
taskkill /IM node.exe /F

# Wait 3 seconds
timeout /t 3

# Restart
npm run both
```

## Monitoring

Watch the console output for:
- `[RTMP Server] ✅ Publishing:` - Stream started
- `[HLS] ✓ Actively transcoding:` - FFmpeg processing frames
- `[HLS] FFmpeg stopped normally` - Stream ended cleanly

## Advanced: Create Loop Stream

For continuous testing:

```bash
ffmpeg -loop 1 -i test-video.mp4 -c:v copy -c:a aac -f flv rtmp://localhost:1935/live/loop
```

This will repeat the video indefinitely.
