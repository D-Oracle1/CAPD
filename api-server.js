/**
 * CAPD API Server
 * Handles stream management, status checks, and live broadcasting
 *
 * Usage: npm run api-server
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Streams registry file
const streamsFile = path.join(__dirname, '.streams.json');
const streamsDbFile = path.join(__dirname, 'data', 'streams.json');

// Initialize streams database
function initializeStreamsDb() {
  if (!fs.existsSync(streamsDbFile)) {
    const dir = path.dirname(streamsDbFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(streamsDbFile, JSON.stringify({ streams: [] }, null, 2));
  }
}

// Get all streams (from channels configuration)
app.get('/api/streams', (req, res) => {
  try {
    // Read channels from localStorage data
    const channelsFile = path.join(__dirname, 'data', 'channels.json');
    let channels = [];

    if (fs.existsSync(channelsFile)) {
      const data = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
      channels = data.channels || [];
    }

    // Map channels to streams format
    const streams = channels.map(ch => ({
      id: ch.id,
      name: ch.name,
      number: ch.number,
      description: ch.description,
      streamUrl: ch.streamUrl,
      status: ch.status || 'offline',
      viewers: ch.viewers || 0,
      type: detectStreamType(ch.streamUrl),
      hlsUrl: ch.streamUrl.includes('.m3u8') ? ch.streamUrl : null,
      rtmpUrl: ch.streamUrl.includes('rtmp') ? ch.streamUrl : null
    }));

    res.json({ streams });
  } catch (error) {
    console.error('Error fetching streams:', error);
    res.status(500).json({ error: 'Failed to fetch streams' });
  }
});

// Helper function to detect stream type
function detectStreamType(url) {
  if (!url) return 'unknown';
  if (url.includes('rtmp')) return 'rtmp';
  if (url.includes('.m3u8')) return 'hls';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('http') && (url.includes('.mp4') || url.includes('.mov') || url.includes('.mkv'))) return 'mp4';
  return 'unknown';
}

// Create new stream (for RTMP or custom URL)
app.post('/api/streams', (req, res) => {
  try {
    const { name, number, description, streamUrl, status } = req.body;

    if (!name || !streamUrl) {
      return res.status(400).json({ error: 'Name and stream URL are required' });
    }

    // Read channels file
    const channelsFile = path.join(__dirname, 'data', 'channels.json');
    const dir = path.dirname(channelsFile);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let data = { channels: [] };
    if (fs.existsSync(channelsFile)) {
      data = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
    }

    // Check if channel already exists
    if (data.channels.some(ch => ch.name === name)) {
      return res.status(400).json({ error: 'Channel already exists' });
    }

    // Add new channel
    const newChannel = {
      id: 'ch-' + Date.now(),
      name,
      number: number || (data.channels.length + 1),
      description: description || '',
      streamUrl,
      status: status || 'offline',
      viewers: 0,
      type: detectStreamType(streamUrl),
      createdAt: new Date().toISOString()
    };

    data.channels.push(newChannel);
    fs.writeFileSync(channelsFile, JSON.stringify(data, null, 2));

    res.status(201).json({
      message: 'Stream created successfully',
      stream: newChannel
    });
  } catch (error) {
    console.error('Error creating stream:', error);
    res.status(500).json({ error: 'Failed to create stream' });
  }
});

// Get stream status by name or ID
app.get('/api/streams/:id', (req, res) => {
  try {
    const streamId = req.params.id;
    const channelsFile = path.join(__dirname, 'data', 'channels.json');

    if (!fs.existsSync(channelsFile)) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const data = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
    const channel = data.channels.find(ch => ch.id === streamId || ch.name === streamId);

    if (!channel) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const streamType = detectStreamType(channel.streamUrl);
    let hlsUrl = null;

    // Generate HLS URL for RTMP streams
    if (streamType === 'rtmp') {
      const streamName = channel.streamUrl.split('/').pop();
      hlsUrl = `http://localhost:8000/live/${streamName}/index.m3u8`;
    } else if (streamType === 'hls') {
      hlsUrl = channel.streamUrl;
    }

    res.json({
      id: channel.id,
      name: channel.name,
      status: channel.status,
      viewers: channel.viewers,
      streamUrl: channel.streamUrl,
      type: streamType,
      hlsUrl,
      rtmpUrl: streamType === 'rtmp' ? channel.streamUrl : null,
      description: channel.description
    });
  } catch (error) {
    console.error('Error fetching stream status:', error);
    res.status(500).json({ error: 'Failed to fetch stream status' });
  }
});

// Delete stream
app.delete('/api/streams/:id', (req, res) => {
  try {
    const streamId = req.params.id;
    const channelsFile = path.join(__dirname, 'data', 'channels.json');

    if (!fs.existsSync(channelsFile)) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    let data = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
    const initialLength = data.channels.length;

    data.channels = data.channels.filter(ch => ch.id !== streamId && ch.name !== streamId);

    if (data.channels.length === initialLength) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    fs.writeFileSync(channelsFile, JSON.stringify(data, null, 2));

    res.json({ message: 'Stream deleted successfully' });
  } catch (error) {
    console.error('Error deleting stream:', error);
    res.status(500).json({ error: 'Failed to delete stream' });
  }
});

// Server health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    rtmpServer: 'rtmp://localhost:1935',
    hlsServer: 'http://localhost:8000',
    apiServer: `http://localhost:${PORT}`,
    timestamp: new Date().toISOString()
  });
});

// Start server with error handling
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🎬 CAPD API Server Started║
╚════════════════════════════════════════════════════════════════╝

📡 API Server: http://localhost:${PORT}
🎙️ RTMP Server: rtmp://localhost:1935
📺 HLS Server: http://localhost:8000

🔗 Available Endpoints:
   GET  /api/streams          - List all streams
   POST /api/streams          - Create new stream
   GET  /api/streams/:name    - Get stream status
   DEL  /api/streams/:name    - Delete stream
   GET  /api/health           - Server health check

⚠️ To stop server: Press Ctrl+C
`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[API] Port ${PORT} in use, retrying in 3 seconds...`);
    setTimeout(() => server.listen(PORT, '127.0.0.1'), 3000);
  } else {
    console.error('[API] Server error:', err);
    process.exit(1);
  }
});
