/**
 * Vercel Serverless Function for Channel Management
 * Uses Supabase PostgreSQL database for persistent storage
 * GET: Fetch all channels
 * POST: Save/update channels
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yuzqfrybmpxeqqxtewyl.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enFmcnlibXB4ZXFxeHRld3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjE1NzYsImV4cCI6MjA3OTg5NzU3Nn0.m_vwoLx449WZoRWzZsYIUf0MD8G_EMpwUDIpIGZ-Z-8';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to convert database rows to channel format
function dbRowToChannel(row) {
  return {
    id: row.id,
    name: row.name,
    number: row.number,
    description: row.description,
    streamUrl: row.stream_url,
    type: row.type,
    status: row.status,
    viewers: row.viewers,
    poster: row.poster,
    rtmpUrl: row.rtmp_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Helper function to convert channel to database format
function channelToDbRow(channel) {
  return {
    id: channel.id,
    name: channel.name,
    number: channel.number,
    description: channel.description,
    stream_url: channel.streamUrl,
    type: channel.type || 'mp4',
    status: channel.status || 'offline',
    viewers: channel.viewers || 0,
    poster: channel.poster,
    rtmp_url: channel.rtmpUrl,
    updated_at: new Date().toISOString()
  };
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // GET /api/channels - Fetch all channels from Supabase
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('number', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to fetch channels from database' });
      }

      const channels = (data || []).map(dbRowToChannel);
      res.status(200).json({ channels });

    } else if (req.method === 'POST') {
      // POST /api/channels - Save/update channels in Supabase
      const { channels } = req.body;

      if (!Array.isArray(channels)) {
        return res.status(400).json({ error: 'Channels must be an array' });
      }

      // Delete all existing channels and insert new ones
      const { error: deleteError } = await supabase
        .from('channels')
        .delete()
        .neq('id', null); // Delete all records

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return res.status(500).json({ error: 'Failed to update channels' });
      }

      // Insert new channels
      const dbChannels = channels.map(channelToDbRow);
      const { data, error: insertError } = await supabase
        .from('channels')
        .insert(dbChannels);

      if (insertError) {
        console.error('Insert error:', insertError);
        return res.status(500).json({ error: 'Failed to save channels' });
      }

      const responseChannels = (data || channels).map(ch =>
        ch.stream_url ? dbRowToChannel(ch) : ch
      );

      res.status(200).json({
        message: 'Channels updated successfully',
        channels: responseChannels
      });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in channels API:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
