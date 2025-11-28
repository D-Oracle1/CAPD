/**
 * CAPD API - Streams Endpoint
 * Vercel Serverless Function
 */

const { createClient } = require('@supabase/supabase-js');

// Import Supabase credentials
let SUPABASE_URL, SUPABASE_ANON_KEY;
try {
  const config = require('../supabase-client.js');
  SUPABASE_URL = config.SUPABASE_URL;
  SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;
  console.log('Supabase config loaded from supabase-client.js');
} catch (e) {
  console.error('Failed to load supabase-client.js:', e.message);
  // Fallback to hardcoded values if require fails
  SUPABASE_URL = 'https://yuzqfrybmpxeqqxtewyl.supabase.co';
  SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enFmcnlibXB4ZXFxeHRld3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjE1NzYsImV4cCI6MjA3OTg5NzU3Nn0.m_vwoLx449WZoRWzZsYIUf0MD8G_EMpwUDIpIGZ-Z-8';
  console.log('Using hardcoded Supabase credentials');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function detectStreamType(url) {
  if (!url) return 'unknown';
  if (url.includes('rtmp')) return 'rtmp';
  if (url.includes('.m3u8')) return 'hls';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('http') && (url.includes('.mp4') || url.includes('.mov'))) return 'mp4';
  return 'unknown';
}

// Convert snake_case to camelCase
function convertToCamelCase(channel) {
  return {
    id: channel.id,
    name: channel.name,
    number: channel.number,
    description: channel.description,
    streamUrl: channel.stream_url,
    type: channel.type,
    status: channel.status,
    viewers: channel.viewers,
    poster: channel.poster,
    rtmpUrl: channel.rtmp_url,
    createdAt: channel.created_at,
    updatedAt: channel.updated_at
  };
}

async function getStreams(res) {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('number', { ascending: true });

    if (error) throw error;

    const streams = (data || []).map(convertToCamelCase);
    return res.status(200).json({ streams });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch streams' });
  }
}

async function getStreamById(res, id) {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .or(`id.eq.${id},name.eq.${id}`)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    return res.status(200).json(convertToCamelCase(data));
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch stream' });
  }
}

async function createStream(req, res) {
  try {
    const { name, number, description, streamUrl, status } = req.body;

    if (!name || !streamUrl) {
      return res.status(400).json({ error: 'Name and streamUrl required' });
    }

    const newStream = {
      id: 'ch-' + Date.now(),
      name,
      number: number || 1,
      description: description || '',
      stream_url: streamUrl,
      status: status || 'offline',
      viewers: 0,
      type: detectStreamType(streamUrl),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('channels')
      .insert([newStream])
      .select();

    if (error) throw error;
    return res.status(201).json({ message: 'Created', stream: convertToCamelCase(data[0]) });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to create stream' });
  }
}

async function deleteStream(res, id) {
  try {
    const { error } = await supabase
      .from('channels')
      .delete()
      .or(`id.eq.${id},name.eq.${id}`);

    if (error) throw error;
    return res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to delete stream' });
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      if (id) {
        return await getStreamById(res, id);
      }
      return await getStreams(res);
    case 'POST':
      return await createStream(req, res);
    case 'DELETE':
      return await deleteStream(res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};
