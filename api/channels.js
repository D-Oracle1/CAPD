/**
 * CAPD API - Channels Endpoint
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

async function getChannels(res) {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('number', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ channels: data || [] });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to fetch channels' });
  }
}

async function saveChannels(req, res) {
  try {
    const { channels } = req.body;

    if (!Array.isArray(channels)) {
      return res.status(400).json({ error: 'Channels must be an array' });
    }

    // Convert camelCase to snake_case for database
    const dbChannels = channels.map(ch => ({
      id: ch.id,
      name: ch.name,
      number: ch.number,
      description: ch.description,
      stream_url: ch.streamUrl || ch.stream_url,
      status: ch.status,
      viewers: ch.viewers,
      type: ch.type,
      poster: ch.poster,
      rtmp_url: ch.rtmpUrl || ch.rtmp_url,
      created_at: ch.createdAt || ch.created_at,
      updated_at: new Date().toISOString()
    }));

    // Delete and insert
    await supabase.from('channels').delete().neq('id', 'null');
    const { data, error } = await supabase
      .from('channels')
      .insert(dbChannels)
      .select();

    if (error) throw error;
    return res.status(200).json({ message: 'Success', channels: data });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to save channels' });
  }
}

module.exports = async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  switch (req.method) {
    case 'GET':
      return await getChannels(res);
    case 'POST':
      return await saveChannels(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
};
