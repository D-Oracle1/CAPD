/**
 * CAPD API - Health Check Endpoint
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

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Test database connection
    const { data, error } = await supabase
      .from('channels')
      .select('count')
      .limit(1);

    if (error) throw error;

    return res.status(200).json({
      status: 'ok',
      service: 'CAPD API Server (Vercel)',
      database: 'Supabase',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(503).json({
      status: 'error',
      service: 'CAPD API Server (Vercel)',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
};
