/**
 * HLS Transcoder for CAPD RTMP Server
 *
 * This script watches for RTMP streams and automatically converts them to HLS
 * It monitors active RTMP connections and starts FFmpeg transcoding when needed
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const HLS_DIR = path.join(__dirname, 'hls');
const RTMP_SERVER = 'rtmp://localhost:1935';
const STREAMS = new Map();

// Ensure HLS directory exists
if (!fs.existsSync(HLS_DIR)) {
  fs.mkdirSync(HLS_DIR, { recursive: true });
}

console.log(`
╔════════════════════════════════════════════════════════════════╗
║        🎬 HLS Transcoder Started (Monitoring RTMP)            ║
╚════════════════════════════════════════════════════════════════╝

📡 RTMP Monitor: ${RTMP_SERVER}
📁 HLS Output: ${HLS_DIR}
🎥 FFmpeg: Ready to transcode

Waiting for RTMP streams...
`);

/**
 * Start transcoding an RTMP stream to HLS
 */
function startTranscoding(streamName) {
  if (STREAMS.has(streamName)) {
    console.log(`[HLS] Stream "${streamName}" already transcoding`);
    return;
  }

  const streamPath = `${RTMP_SERVER}/live/${streamName}`;
  const hlsDir = path.join(HLS_DIR, 'live', streamName);
  const hlsPlaylist = path.join(hlsDir, 'index.m3u8');

  // Create directory
  if (!fs.existsSync(hlsDir)) {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  console.log(`\n[HLS] Starting transcoding for: ${streamName}`);
  console.log(`[HLS] Input: ${streamPath}`);
  console.log(`[HLS] Output: ${hlsPlaylist}`);

  // FFmpeg command for HLS transcoding - optimized for smooth playback
  const ffmpegArgs = [
    '-rtsp_transport', 'tcp',             // Use TCP for RTMP stability
    '-fflags', '+nobuffer',               // No buffering for low latency
    '-flags', 'low_delay',                // Low delay mode
    '-rw_timeout', '5000000',             // 5 second timeout for RTMP connection
    '-connect_timeout', '5000000',        // 5 second timeout for connection
    '-i', streamPath,
    '-c:v', 'copy',                       // Copy video (no re-encoding) for speed
    '-c:a', 'copy',                       // Copy audio as-is
    '-f', 'hls',                          // HLS format
    '-hls_time', '2',                     // 2 second segments (more stable)
    '-hls_list_size', '8',                // Keep 8 segments (16 second buffer)
    '-hls_flags', 'delete_segments+independent_segments',
    '-start_number', '0',
    '-hls_allow_cache', '0',              // Prevent caching issues
    '-fflags', '+genpts',                 // Generate presentation timestamps
    hlsPlaylist
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  const streamData = {
    process: ffmpeg,
    name: streamName,
    startTime: new Date(),
    segmentCount: 0
  };

  STREAMS.set(streamName, streamData);

  let errorOutput = '';
  let isTranscoding = false;
  let connectionAttempted = false;

  // Handle FFmpeg output
  ffmpeg.stderr.on('data', (data) => {
    const output = data.toString();
    errorOutput += output;

    // Check for connection attempt
    if (output.includes('Opening') || output.includes(streamPath)) {
      connectionAttempted = true;
      console.log(`[HLS] Attempting to connect to: ${streamPath}`);
    }

    // Check for successful connection (look for frame/audio output, not just Opening)
    if (output.includes('frame=') || output.includes('time=')) {
      isTranscoding = true;
      if (!connectionAttempted) {
        console.log(`[HLS] ✓ Connected to RTMP stream: ${streamName}`);
      } else {
        console.log(`[HLS] ✓ Actively transcoding: ${streamName}`);
      }
    }

    // Log important FFmpeg messages
    if (output.includes('Opening') || output.includes('segment') || output.includes('muxing') || output.includes('frame=')) {
      console.log(`[HLS] FFmpeg: ${output.substring(0, 150).trim()}`);
    }

    // Check for connection errors
    if (output.includes('Connection refused') || output.includes('Connection timed out') || output.includes('End of stream') || output.includes('No such file')) {
      console.log(`[HLS] ⚠️  Stream info: ${output.substring(0, 200)}`);
    }
  });

  // Handle FFmpeg errors
  ffmpeg.on('error', (err) => {
    console.error(`[HLS] FFmpeg error for "${streamName}":`, err.message);
    STREAMS.delete(streamName);
  });

  // Handle FFmpeg exit
  ffmpeg.on('close', (code) => {
    const status = isTranscoding ? 'stopped normally' : 'failed to connect/transcoding';
    console.log(`[HLS] FFmpeg ${status} for "${streamName}" (exit code: ${code})`);

    if (code !== 0 || !isTranscoding) {
      // Log comprehensive error details
      console.log(`[HLS] ⚠️  Stream: ${streamName}`);
      console.log(`[HLS] ⚠️  Connection attempted: ${connectionAttempted}`);
      console.log(`[HLS] ⚠️  Is transcoding: ${isTranscoding}`);
      console.log(`[HLS] ⚠️  Exit code: ${code}`);

      // Log last 500 chars of error output for debugging
      const lastError = errorOutput.slice(-500);
      if (lastError.trim()) {
        console.log(`[HLS] FFmpeg stderr output:\n${lastError}`);
      }
    }

    STREAMS.delete(streamName);

    // Clean up directory if still exists
    if (fs.existsSync(hlsDir)) {
      console.log(`[HLS] Cleaning up: ${hlsDir}`);
      try {
        fs.rmSync(hlsDir, { recursive: true });
      } catch (e) {
        console.log(`[HLS] Cleanup warning: ${e.message}`);
      }
    }
  });

  console.log(`[HLS] ✅ Transcoding started for: ${streamName}`);
}

/**
 * Stop transcoding a stream
 */
function stopTranscoding(streamName) {
  const stream = STREAMS.get(streamName);
  if (stream) {
    console.log(`[HLS] Stopping transcoding for: ${streamName}`);
    stream.process.kill('SIGTERM');
    STREAMS.delete(streamName);
  }
}

/**
 * Monitor RTMP streams - DISABLED in favor of direct API calls
 * The RTMP server now directly calls /start and /stop on stream lifecycle events
 * This function is kept for backward compatibility but is not actively used
 */
function monitorStreams() {
  // Monitoring via .streams.json file is disabled
  // Instead, use the HTTP API endpoints: /start?stream=name and /stop?stream=name
}

/**
 * Alternatively, use command-line to trigger transcoding
 * Start server on port 3002 to listen for stream start/stop events
 */
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const params = Object.fromEntries(url.searchParams);

  if (pathname === '/start' && params.stream) {
    const streamName = params.stream.replace(/[^a-zA-Z0-9_-]/g, '');
    startTranscoding(streamName);
    res.end(JSON.stringify({ status: 'ok', message: `Started transcoding: ${streamName}` }));
  } else if (pathname === '/stop' && params.stream) {
    const streamName = params.stream.replace(/[^a-zA-Z0-9_-]/g, '');
    stopTranscoding(streamName);
    res.end(JSON.stringify({ status: 'ok', message: `Stopped transcoding: ${streamName}` }));
  } else if (pathname === '/status') {
    const status = {
      activeStreams: Array.from(STREAMS.keys()),
      streamCount: STREAMS.size,
      uptime: process.uptime()
    };
    res.end(JSON.stringify(status));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[HLS] Port 3002 already in use, retrying in 5 seconds...`);
    setTimeout(() => {
      server.close();
      server.listen(3002);
    }, 5000);
  } else {
    console.error(`[HLS] Server error:`, err);
  }
});

server.listen(3002, '127.0.0.1', () => {
  console.log(`[HLS] Control server listening on http://localhost:3002`);
  console.log(`[HLS] API Endpoints:`);
  console.log(`     GET /start?stream=name       - Start transcoding`);
  console.log(`     GET /stop?stream=name        - Stop transcoding`);
  console.log(`     GET /status                  - Check active streams\n`);
});

// Monitoring via file polling is DISABLED
// The RTMP server now directly triggers transcoding via HTTP API
// This prevents premature transcoding attempts and race conditions

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[HLS] Shutting down...');
  STREAMS.forEach((stream, name) => {
    console.log(`[HLS] Stopping: ${name}`);
    stream.process.kill('SIGTERM');
  });
  setTimeout(() => process.exit(0), 1000);
});
