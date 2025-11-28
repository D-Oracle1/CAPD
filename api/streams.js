/**
 * CAPD API - Streams Endpoint
 * Vercel Serverless Function
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function detectStreamType(url) {
  if (!url) return 'unknown';
  if (url.includes('rtmp')) return 'rtmp';
  if (url.includes('.m3u8')) return 'hls';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('http') && (url.includes('.mp4') || url.includes('.mov'))) return 'mp4';
  return 'unknown';
}

async function getStreams(res) {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('number', { ascending: true });

    if (error) throw error;

    const streams = (data || []).map(ch => ({
      id: ch.id,
      name: ch.name,
      number: ch.number,
      description: ch.description,
      streamUrl: ch.streamUrl,
      status: ch.status || 'offline',
      viewers: ch.viewers || 0,
      type: detectStreamType(ch.streamUrl)
    }));

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

    return res.status(200).json({
      id: data.id,
      name: data.name,
      status: data.status,
      viewers: data.viewers,
      streamUrl: data.streamUrl,
      type: detectStreamType(data.streamUrl),
      description: data.description
    });
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
      streamUrl,
      status: status || 'offline',
      viewers: 0,
      type: detectStreamType(streamUrl),
      createdAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('channels')
      .insert([newStream])
      .select();

    if (error) throw error;
    return res.status(201).json({ message: 'Created', stream: data[0] });
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
