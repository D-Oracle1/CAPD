const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CAPD Streaming Proxy Server running on http://localhost:${PORT}`);
  console.log(`📺 Serve your TV page at http://localhost:${PORT}/tv.html`);
  console.log(`🔧 API endpoints:`);
  console.log(`   - Stream proxy: http://localhost:${PORT}/api/stream?url=<encoded-url>`);
  console.log(`   - Health check: http://localhost:${PORT}/api/health`);
});
