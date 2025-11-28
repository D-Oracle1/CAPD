-- SUPABASE DATABASE SETUP FOR CAPD
-- Run this SQL in Supabase SQL Editor to create tables

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  type TEXT DEFAULT 'mp4',
  status TEXT DEFAULT 'offline',
  viewers INTEGER DEFAULT 0,
  poster TEXT,
  rtmp_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_channels_number ON channels(number);
CREATE INDEX IF NOT EXISTS idx_channels_status ON channels(status);

-- Insert default channels
INSERT INTO channels (id, name, number, description, stream_url, type, status, viewers) VALUES
('main', 'CAPD Main Channel', 1, 'Main live broadcast and news', 'https://www.youtube.com/live/dQw4w9WgXcQ', 'youtube', 'online', 1250),
('news', 'CAPD News 24/7', 2, 'Latest news and updates', 'https://www.youtube.com/live/jNQXAC9IVRw', 'youtube', 'online', 890),
('community', 'Community Channel', 3, 'Community events and programs', 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/big_buck_bunny.mp4', 'mp4', 'online', 567),
('education', 'Education Channel', 4, 'Educational content and seminars', 'https://www.youtube.com/live/9bZkp7q19f0', 'youtube', 'online', 742),
('culture', 'Culture & Entertainment', 5, 'Cultural programs and entertainment', 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/sintel.mp4', 'mp4', 'online', 615)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Enable read access for all users" ON channels
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Enable update for authenticated users" ON channels
  FOR UPDATE USING (true) WITH CHECK (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Enable insert for authenticated users" ON channels
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to delete
CREATE POLICY "Enable delete for authenticated users" ON channels
  FOR DELETE USING (true);

-- Optionally: Create a view for easier access
CREATE OR REPLACE VIEW v_channels AS
SELECT
  id,
  name,
  number,
  description,
  stream_url as streamUrl,
  type,
  status,
  viewers,
  poster,
  rtmp_url as rtmpUrl,
  created_at as createdAt,
  updated_at as updatedAt
FROM channels
ORDER BY number ASC;
