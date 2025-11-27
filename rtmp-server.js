/**
 * CAPD RTMP Server
 *
 * A complete Node.js RTMP server for live streaming
 * Accepts RTMP streams from OBS, FFmpeg, etc.
 * Converts to HLS for browser playback
 *
 * Usage:
 *   npm run rtmp-server
 *
 * Stream to: rtmp://localhost:1935/live/STREAM_NAME
 * Watch HLS: http://localhost:3000/hls/STREAM_NAME/index.m3u8
 */

const NodeMediaServer = require('node-media-server');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create HLS output directory if it doesn't exist
const hlsDir = path.join(__dirname, 'hls');
if (!fs.existsSync(hlsDir)) {
  fs.mkdirSync(hlsDir, { recursive: true });
}

// Detect FFmpeg path
let ffmpegPath = 'ffmpeg';
try {
  // Try to find FFmpeg using 'where' command on Windows
  ffmpegPath = execSync('where ffmpeg', { encoding: 'utf8' }).trim().split('\n')[0];
  console.log(`[RTMP Server] Found FFmpeg at: ${ffmpegPath}`);
} catch (e) {
  console.log('[RTMP Server] FFmpeg not found in PATH, using default');
}

// RTMP Server Configuration
const config = {
  rtmp: {
    port: process.env.RTMP_PORT || 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: process.env.HTTP_PORT || 8000,
    mediaroot: path.join(__dirname, 'hls'),
    allow_origin: '*'
  },
  trans: {
    ffmpeg: process.env.FFMPEG_PATH || ffmpegPath,
    tasks: [
      {
        app: 'live',
        mp4: false,
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=6:hls_flags=delete_segments]'
      }
    ]
  },
  logger: {
    ffmpeg: 'debug',
    api: 'debug',
    app: 'debug'
  }
};

// Initialize RTMP Server
const nms = new NodeMediaServer(config);

// Stream events
nms.on('preConnect', (id, args) => {
  console.log(`[RTMP Server] New connection: ${id}`);
});

nms.on('postConnect', (id, args) => {
  console.log(`[RTMP Server] Connected: ${id}`);
});

nms.on('doneConnect', (id, args) => {
  console.log(`[RTMP Server] Disconnected: ${id}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log(`[RTMP Server] Publishing to: ${StreamPath}`);
  const streamName = StreamPath.split('/').pop();
  console.log(`[RTMP Server] Stream name: ${streamName}`);
});

nms.on('postPublish', (id, StreamPath, args) => {
  const streamName = StreamPath.split('/').pop();
  console.log(`[RTMP Server] ✅ Publishing: ${streamName}`);
  console.log(`[RTMP Server] HLS available at: http://localhost:${process.env.HTTP_PORT || 8000}/live/${streamName}/index.m3u8`);

  // Broadcast stream info
  broadcastStreamInfo({
    status: 'live',
    name: streamName,
    path: StreamPath,
    hlsUrl: `http://localhost:${process.env.HTTP_PORT || 8000}/live/${streamName}/index.m3u8`,
    startTime: new Date().toISOString()
  });

  // Trigger HLS transcoding via API
  try {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: `/start?stream=${encodeURIComponent(streamName)}`,
      method: 'GET'
    };
    const req = http.request(options, (res) => {
      res.on('data', () => {}); // Consume response
    });
    req.on('error', (e) => {
      console.log(`[RTMP Server] HLS transcoder may not be running: ${e.message}`);
    });
    req.end();
  } catch (e) {
    console.log(`[RTMP Server] Could not notify HLS transcoder: ${e.message}`);
  }
});

nms.on('donePublish', (id, StreamPath, args) => {
  const streamName = StreamPath.split('/').pop();
  console.log(`[RTMP Server] ⏹️ Stream ended: ${streamName}`);

  // Broadcast stream info
  broadcastStreamInfo({
    status: 'offline',
    name: streamName,
    path: StreamPath,
    endTime: new Date().toISOString()
  });

  // Stop HLS transcoding via API
  try {
    const http = require('http');
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: `/stop?stream=${encodeURIComponent(streamName)}`,
      method: 'GET'
    };
    const req = http.request(options, (res) => {
      res.on('data', () => {}); // Consume response
    });
    req.on('error', () => {}); // Silently ignore errors
    req.end();
  } catch (e) {
    // Silently ignore
  }
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log(`[RTMP Server] Play request: ${StreamPath}`);
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log(`[RTMP Server] Playing: ${StreamPath}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log(`[RTMP Server] Stopped playing: ${StreamPath}`);
});

// Start RTMP Server
nms.run();

console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🎬 CAPD RTMP Server Started                         ║
╚════════════════════════════════════════════════════════════════╝

📺 RTMP Server Configuration:
   ├─ RTMP Port:     ${config.rtmp.port}
   ├─ HTTP Port:     ${config.http.port}
   ├─ HLS Directory: ${hlsDir}
   └─ FFmpeg:        ${config.trans.ffmpeg}

🎙️ How to Stream (OBS/FFmpeg):
   Server:     rtmp://localhost:1935/live
   Stream Key: YOUR_STREAM_NAME

📺 Watch Stream in Browser:
   HLS: http://localhost:8000/live/YOUR_STREAM_NAME/index.m3u8

🔗 Use in CAPD Platform:
   Add to channels or custom RTMP config:
   ${`http://localhost:${process.env.HTTP_PORT || 8000}/live/STREAM_NAME/index.m3u8`}

💡 Testing with FFmpeg:
   ffmpeg -i "video.mp4" -c:v copy -c:a copy -f flv "rtmp://localhost:1935/live/test"

⚠️  To stop server: Press Ctrl+C

`);

/**
 * Broadcast stream information to connected clients
 * This allows real-time updates across the platform
 */
function broadcastStreamInfo(info) {
  // Store in a streams registry (could use Redis in production)
  const streamsFile = path.join(__dirname, '.streams.json');

  try {
    let streams = {};
    if (fs.existsSync(streamsFile)) {
      streams = JSON.parse(fs.readFileSync(streamsFile, 'utf8'));
    }

    if (info.status === 'live') {
      streams[info.name] = info;
    } else {
      delete streams[info.name];
    }

    fs.writeFileSync(streamsFile, JSON.stringify(streams, null, 2));
  } catch (e) {
    console.error('Error updating streams registry:', e);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[RTMP Server] Shutting down...');
  nms.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[RTMP Server] Shutting down...');
  nms.stop();
  process.exit(0);
});
