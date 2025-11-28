/**
 * CAPD API - Health Check Endpoint
 * Vercel Serverless Function
 */

const { createClient } = require('@supabase/supabase-js');

// Import Supabase credentials
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('../supabase-client.js');

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
