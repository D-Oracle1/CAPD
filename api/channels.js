/**
 * CAPD API - Channels Endpoint
 * Vercel Serverless Function
 */

const { createClient } = require('@supabase/supabase-js');

// Import Supabase credentials
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('../supabase-client.js');

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
