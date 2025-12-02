const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToSupabase, deleteFromSupabase, validateFileType, validateFileSize } = require('../supabase-storage');

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  credentials: false,
  maxAge: 86400
}));

// Parse JSON request bodies
app.use(express.json({ limit: '5gb' }));
app.use(express.urlencoded({ limit: '5gb', extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.mkv', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${ext}`));
    }
  }
});

// Convert Google Drive sharing URL to direct playable URL
function convertGoogleDriveUrl(url) {
  if (!url.includes('drive.google.com')) {
    return url;
  }

  let fileId = null;
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)\//);
  if (match1) {
    fileId = match1[1];
  }

  const match2 = url.match(/id=([a-zA-Z0-9-_]+)/);
  if (!fileId && match2) {
    fileId = match2[1];
  }

  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return url;
}

// Proxy endpoint for Google Drive streams
app.get('/api/gdrive/stream', (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const decodedUrl = decodeURIComponent(streamUrl);
    const directUrl = convertGoogleDriveUrl(decodedUrl);

    console.log('🔗 Google Drive stream requested');
    const proxy = createProxyMiddleware({
      target: directUrl,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'warn',
      onProxyRes: (proxyRes, req, res) => {
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
        if (proxyRes.headers['content-type']) {
          res.setHeader('Content-Type', proxyRes.headers['content-type']);
        } else {
          res.setHeader('Content-Type', 'video/mp4');
        }
      },
      onError: (err, req, res) => {
        console.error('❌ Google Drive proxy error:', err.message);
        res.status(500).json({ error: 'Failed to stream from Google Drive' });
      }
    });

    proxy(req, res);
  } catch (error) {
    console.error('❌ Google Drive proxy error:', error);
    res.status(500).json({ error: 'Invalid Google Drive URL' });
  }
});

// Proxy endpoint for streaming URLs
app.get('/api/stream', (req, res) => {
  const streamUrl = req.query.url;
  if (!streamUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const decodedUrl = decodeURIComponent(streamUrl);
    if (decodedUrl.includes('drive.google.com')) {
      const directUrl = convertGoogleDriveUrl(decodedUrl);
      console.log('📁 Detected Google Drive URL, converting...');
      return res.redirect(`/api/gdrive/stream?url=${encodeURIComponent(directUrl)}`);
    }

    if (!decodedUrl.match(/^https?:\/\//i)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

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

// Stream proxy for HLS/DASH manifests
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

// ========== PASSCODE MANAGEMENT ENDPOINTS ==========

// Get passcode settings
app.get('/api/passcode', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    let settings = { passcode: { enabled: false, code: null } };

    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
    }

    res.json({
      enabled: settings.passcode?.enabled || false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error loading passcode settings:', error);
    res.json({ enabled: false });
  }
});

// Verify passcode
app.post('/api/passcode/verify', (req, res) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({ verified: false, error: 'Passcode required' });
    }

    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    let settings = { passcode: { enabled: false, code: null } };

    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
    }

    if (!settings.passcode?.enabled) {
      return res.json({ verified: true });
    }

    const correct = settings.passcode?.code === passcode;
    res.json({ verified: correct });
  } catch (error) {
    console.error('Error verifying passcode:', error);
    res.status(500).json({ verified: false, error: 'Verification failed' });
  }
});

// Save passcode settings (Admin only)
app.post('/api/passcode/settings', (req, res) => {
  try {
    const { enabled, passcode } = req.body;

    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    const dataDir = path.dirname(settingsPath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let settings = { passcode: { enabled: false, code: null } };

    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
    }

    settings.passcode = {
      enabled: enabled === true,
      code: passcode || null,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');

    console.log(`✅ Passcode settings updated - Enabled: ${enabled}`);
    res.json({ success: true, message: 'Passcode settings updated' });
  } catch (error) {
    console.error('Error saving passcode settings:', error);
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all channels
app.get('/api/channels', (req, res) => {
  try {
    const channelsPath = path.join(__dirname, '..', 'data', 'channels.json');
    const channelsData = fs.readFileSync(channelsPath, 'utf8');
    const data = JSON.parse(channelsData);
    res.json({ channels: data.channels || [] });
  } catch (error) {
    console.error('Error loading channels:', error);
    res.status(500).json({ error: 'Failed to load channels', channels: [] });
  }
});

// Save/Update all channels
app.post('/api/channels', (req, res) => {
  try {
    const { channels } = req.body;

    if (!Array.isArray(channels)) {
      return res.status(400).json({ error: 'Channels must be an array' });
    }

    const channelsPath = path.join(__dirname, '..', 'data', 'channels.json');
    const data = { channels };
    fs.writeFileSync(channelsPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`✅ Saved ${channels.length} channels to JSON file`);
    res.json({
      message: 'Channels updated successfully',
      channels: channels
    });
  } catch (error) {
    console.error('Error saving channels:', error);
    res.status(500).json({ error: 'Failed to save channels' });
  }
});

// Get all settings
app.get('/api/settings', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    const settingsData = fs.readFileSync(settingsPath, 'utf8');
    const data = JSON.parse(settingsData);
    res.json({ settings: data });
  } catch (error) {
    console.error('Error loading settings:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// Save/Update settings
app.post('/api/settings', (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings must be an object' });
    }

    const settingsPath = path.join(__dirname, '..', 'data', 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');

    console.log('✅ Saved application settings to JSON file');
    res.json({
      message: 'Settings updated successfully',
      settings: settings
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Get active RTMP streams
app.get('/api/streams', (req, res) => {
  const streamsFile = path.join(__dirname, '..', '.streams.json');

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
  const streamsFile = path.join(__dirname, '..', '.streams.json');
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

// Serve static files
app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    if (filePath.match(/\.(m3u8|ts|mp4|mkv|webm)$/i)) {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Export for Vercel serverless
module.exports = app;
