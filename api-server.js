/**
 * CAPD API Server
 * Handles stream management, status checks, and live broadcasting
 * Database: Supabase PostgreSQL
 *
 * Usage: npm run api-server
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Load channels from JSON file as fallback
let localChannels = [];
try {
  const channelsPath = path.join(__dirname, 'data', 'channels.json');
  const channelsData = fs.readFileSync(channelsPath, 'utf8');
  localChannels = JSON.parse(channelsData).channels || [];
  console.log(`✅ Loaded ${localChannels.length} channels from JSON file`);
} catch (error) {
  console.warn('⚠️ Could not load channels.json:', error.message);
}

// Supabase Configuration
const SUPABASE_URL = 'https://yuzqfrybmpxeqqxtewyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enFmcnlibXB4ZXFxeHRld3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjE1NzYsImV4cCI6MjA3OTg5NzU3Nn0.m_vwoLx449WZoRWzZsYIUf0MD8G_EMpwUDIpIGZ-Z-8';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database tables if needed
async function initializeDatabase() {
  try {
    console.log('Initializing Supabase database tables...');
    // Tables will be created via Supabase dashboard or migrations
    // This is just a placeholder for future initialization logic
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Get all channels (for frontend and admin)
app.get('/api/channels', async (req, res) => {
  try {
    // Create a timeout promise for Supabase query (5 second timeout)
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Supabase query timeout' } }), 5000)
    );

    const queryPromise = supabase
      .from('channels')
      .select('*')
      .order('number', { ascending: true });

    const result = await Promise.race([queryPromise, timeoutPromise]);
    const { data, error } = result;

    if (error) {
      console.warn('⚠️ Supabase error, using fallback JSON data:', error.message);
      // Fallback to local JSON file
      return res.json({ channels: localChannels });
    }

    // Check if we got valid data from Supabase
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`✅ Loaded ${data.length} channels from Supabase`);
      return res.json({ channels: data });
    }

    // If Supabase returned empty, use local fallback
    console.log('⚠️ Supabase returned no data, using fallback JSON data');
    res.json({ channels: localChannels });
  } catch (error) {
    console.warn('⚠️ Database error, using fallback JSON data:', error.message);
    // Fallback to local JSON file when database is unavailable
    res.json({ channels: localChannels });
  }
});

// Save/Update all channels (from admin panel)
app.post('/api/channels', async (req, res) => {
  try {
    const { channels } = req.body;

    if (!Array.isArray(channels)) {
      return res.status(400).json({ error: 'Channels must be an array' });
    }

    // Delete all existing channels and insert new ones
    const { error: deleteError } = await supabase
      .from('channels')
      .delete()
      .neq('id', 'null');

    if (deleteError) throw deleteError;

    // Insert all channels
    const { data, error: insertError } = await supabase
      .from('channels')
      .insert(channels)
      .select();

    if (insertError) throw insertError;

    res.json({
      message: 'Channels updated successfully',
      channels: data
    });
  } catch (error) {
    console.error('Error saving channels:', error);
    res.status(500).json({ error: 'Failed to save channels' });
  }
});

// Get all streams (from channels configuration)
app.get('/api/streams', async (req, res) => {
  try {
    // Create a timeout promise for Supabase query (5 second timeout)
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: 'Supabase query timeout' } }), 5000)
    );

    const queryPromise = supabase
      .from('channels')
      .select('*')
      .order('number', { ascending: true });

    const result = await Promise.race([queryPromise, timeoutPromise]);
    const { data, error } = result;

    let channels = localChannels;
    if (!error && data && Array.isArray(data) && data.length > 0) {
      channels = data;
      console.log(`✅ Loaded ${data.length} streams from Supabase`);
    } else if (error) {
      console.warn('⚠️ Supabase error, using fallback JSON data:', error.message);
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
    console.warn('⚠️ Database error, using fallback JSON data:', error.message);
    // Fallback to local JSON file
    const streams = localChannels.map(ch => ({
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
app.post('/api/streams', async (req, res) => {
  try {
    const { name, number, description, streamUrl, status } = req.body;

    if (!name || !streamUrl) {
      return res.status(400).json({ error: 'Name and stream URL are required' });
    }

    // Check if channel already exists
    const { data: existing, error: checkError } = await supabase
      .from('channels')
      .select('id')
      .eq('name', name)
      .single();

    if (!checkError && existing) {
      return res.status(400).json({ error: 'Channel already exists' });
    }

    // Get max channel number
    const { data: channels } = await supabase
      .from('channels')
      .select('number')
      .order('number', { ascending: false })
      .limit(1);

    const maxNumber = channels && channels.length > 0 ? channels[0].number : 0;

    // Add new channel
    const newChannel = {
      id: 'ch-' + Date.now(),
      name,
      number: number || (maxNumber + 1),
      description: description || '',
      streamUrl,
      status: status || 'offline',
      viewers: 0,
      type: detectStreamType(streamUrl),
      createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('channels')
      .insert([newChannel])
      .select();

    if (error) throw error;

    res.status(201).json({
      message: 'Stream created successfully',
      stream: data[0]
    });
  } catch (error) {
    console.error('Error creating stream:', error);
    res.status(500).json({ error: 'Failed to create stream' });
  }
});

// Get stream status by name or ID
app.get('/api/streams/:id', async (req, res) => {
  try {
    const streamId = req.params.id;

    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .or(`id.eq.${streamId},name.eq.${streamId}`)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const streamType = detectStreamType(data.streamUrl);
    let hlsUrl = null;

    // Generate HLS URL for RTMP streams
    if (streamType === 'rtmp') {
      const streamName = data.streamUrl.split('/').pop();
      hlsUrl = `http://localhost:8000/live/${streamName}/index.m3u8`;
    } else if (streamType === 'hls') {
      hlsUrl = data.streamUrl;
    }

    res.json({
      id: data.id,
      name: data.name,
      status: data.status,
      viewers: data.viewers,
      streamUrl: data.streamUrl,
      type: streamType,
      hlsUrl,
      rtmpUrl: streamType === 'rtmp' ? data.streamUrl : null,
      description: data.description
    });
  } catch (error) {
    console.error('Error fetching stream status:', error);
    res.status(500).json({ error: 'Failed to fetch stream status' });
  }
});

// Delete stream
app.delete('/api/streams/:id', async (req, res) => {
  try {
    const streamId = req.params.id;

    const { error } = await supabase
      .from('channels')
      .delete()
      .or(`id.eq.${streamId},name.eq.${streamId}`);

    if (error) throw error;

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
const server = app.listen(PORT, '127.0.0.1', async () => {
  try {
    await initializeDatabase();
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🎬 CAPD API Server Started (Database Mode)           ║
╚════════════════════════════════════════════════════════════════╝

📡 API Server: http://localhost:${PORT}
🎙️ RTMP Server: rtmp://localhost:1935
📺 HLS Server: http://localhost:8000
💾 Database: Supabase PostgreSQL

🔗 Available Endpoints:
   GET  /api/channels         - Get all channels from database
   POST /api/channels         - Save/update all channels
   GET  /api/streams          - List all streams from database
   POST /api/streams          - Create new stream
   GET  /api/streams/:name    - Get stream status
   DEL  /api/streams/:name    - Delete stream
   GET  /api/health           - Server health check

⚠️ To stop server: Press Ctrl+C
`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
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
