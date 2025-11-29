const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  credentials: false,
  maxAge: 86400
}));

// Serve static files (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    // Add CORS headers to all static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    // For streaming files, add range headers support
    if (filePath.match(/\.(m3u8|ts|mp4|mkv|webm)$/i)) {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Serve HLS streams from RTMP server
app.use('/hls', express.static(path.join(__dirname, 'hls'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Accept-Ranges', 'bytes');

    // Proper MIME types for HLS
    if (filePath.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (filePath.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/mp2t');
    }
  }
}));

// Proxy endpoint for streaming URLs
// Usage: /api/stream?url=<encoded-url>
app.get('/api/stream', (req, res) => {
  const streamUrl = req.query.url;

  if (!streamUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const decodedUrl = decodeURIComponent(streamUrl);

    // Validate URL format
    if (!decodedUrl.match(/^https?:\/\//i)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Create proxy middleware dynamically
    const proxy = createProxyMiddleware({
      target: decodedUrl,
      changeOrigin: true,
      ws: true,
      logLevel: 'warn',
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Streaming server error' });
      }
    });

    proxy(req, res);
  } catch (error) {
    console.error('Stream proxy error:', error);
    res.status(500).json({ error: 'Invalid request' });
  }
});

// Stream proxy for HLS/DASH manifests and segments
app.use('/api/proxy', createProxyMiddleware({
  router: (req) => {
    const streamUrl = req.query.url;
    if (streamUrl) {
      return decodeURIComponent(streamUrl);
    }
    return null;
  },
  changeOrigin: true,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Streaming server error' });
  }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all channels (from JSON file)
app.get('/api/channels', (req, res) => {
  try {
    const channelsPath = path.join(__dirname, 'data', 'channels.json');
    const channelsData = fs.readFileSync(channelsPath, 'utf8');
    const data = JSON.parse(channelsData);
    res.json({ channels: data.channels || [] });
  } catch (error) {
    console.error('Error loading channels:', error);
    res.status(500).json({ error: 'Failed to load channels', channels: [] });
  }
});

// Get active RTMP streams
app.get('/api/streams', (req, res) => {
  const fs = require('fs');
  const streamsFile = path.join(__dirname, '.streams.json');

  try {
    if (fs.existsSync(streamsFile)) {
      const streams = JSON.parse(fs.readFileSync(streamsFile, 'utf8'));
      res.json({ streams: streams, count: Object.keys(streams).length });
    } else {
      res.json({ streams: {}, count: 0 });
    }
  } catch (error) {
    res.json({ streams: {}, count: 0, error: error.message });
  }
});

// Get specific stream info
app.get('/api/streams/:name', (req, res) => {
  const fs = require('fs');
  const streamsFile = path.join(__dirname, '.streams.json');
  const streamName = req.params.name;

  try {
    if (fs.existsSync(streamsFile)) {
      const streams = JSON.parse(fs.readFileSync(streamsFile, 'utf8'));
      const stream = streams[streamName];

      if (stream) {
        res.json(stream);
      } else {
        res.status(404).json({ error: 'Stream not found', name: streamName });
      }
    } else {
      res.status(404).json({ error: 'Stream not found', name: streamName });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server with error handling
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 CAPD Streaming Proxy Server running on http://localhost:${PORT}`);
  console.log(`📺 Serve your TV page at http://localhost:${PORT}/tv.html`);
  console.log(`🔧 API endpoints:`);
  console.log(`   - Stream proxy: http://localhost:${PORT}/api/stream?url=<encoded-url>`);
  console.log(`   - Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[Server] Port ${PORT} in use, retrying in 3 seconds...`);
    setTimeout(() => server.listen(PORT, '127.0.0.1'), 3000);
  } else {
    console.error('[Server] Error:', err);
    process.exit(1);
  }
});
