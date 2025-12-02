/**
 * Supabase Client Configuration
 * Used by both frontend and backend to interact with Supabase database
 */

const SUPABASE_URL = 'https://yuzqfrybmpxeqqxtewyl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enFmcnlibXB4ZXFxeHRld3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjE1NzYsImV4cCI6MjA3OTg5NzU3Nn0.m_vwoLx449WZoRWzZsYIUf0MD8G_EMpwUDIpIGZ-Z-8';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1enFmcnlibXB4ZXFxeHRld3lsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDMyMTU3NiwiZXhwIjoyMDc5ODk3NTc2fQ.obGbRhRiBGw6DvHB1zBw3f8Cj4Dt6GbNRXgSZ5IhOS0';

// For Node.js/backend use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY
  };
}

// For frontend use
if (typeof window !== 'undefined') {
  window.SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY
  };
}
