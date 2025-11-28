/**
 * Vercel Serverless Function for Channel Management
 * GET: Fetch all channels
 * POST: Save/update channels
 */

const fs = require('fs');
const path = require('path');

// In production, we store in /tmp since Vercel is ephemeral
// In development, we store in data folder
const isProduction = process.env.NODE_ENV === 'production';
const dataDir = isProduction ? '/tmp' : path.join(process.cwd(), 'data');
const channelsFile = path.join(dataDir, 'channels.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize with default channels if file doesn't exist
function initializeChannels() {
  if (!fs.existsSync(channelsFile)) {
    const defaultChannels = {
      channels: [
        {
          id: "main",
          name: "CAPD Main Channel",
          number: 1,
          description: "Main live broadcast and news",
          streamUrl: "https://www.youtube.com/live/dQw4w9WgXcQ",
          poster: "assets/images/channel-main.jpg",
          status: "online",
          viewers: 1250,
          type: "youtube"
        },
        {
          id: "news",
          name: "CAPD News 24/7",
          number: 2,
          description: "Latest news and updates",
          streamUrl: "https://www.youtube.com/live/jNQXAC9IVRw",
          poster: "assets/images/channel-news.jpg",
          status: "online",
          viewers: 890,
          type: "youtube"
        },
        {
          id: "community",
          name: "Community Channel",
          number: 3,
          description: "Community events and programs",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/big_buck_bunny.mp4",
          poster: "assets/images/channel-community.jpg",
          status: "online",
          viewers: 567,
          type: "mp4"
        },
        {
          id: "education",
          name: "Education Channel",
          number: 4,
          description: "Educational content and seminars",
          streamUrl: "https://www.youtube.com/live/9bZkp7q19f0",
          poster: "assets/images/channel-education.jpg",
          status: "online",
          viewers: 742,
          type: "youtube"
        },
        {
          id: "culture",
          name: "Culture & Entertainment",
          number: 5,
          description: "Cultural programs and entertainment",
          streamUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/sintel.mp4",
          poster: "assets/images/channel-culture.jpg",
          status: "online",
          viewers: 615,
          type: "mp4"
        }
      ]
    };
    fs.writeFileSync(channelsFile, JSON.stringify(defaultChannels, null, 2));
  }
}

module.exports = (req, res) => {
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
      // GET /api/channels - Fetch all channels
      initializeChannels();
      const data = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));
      res.status(200).json(data);
    } else if (req.method === 'POST') {
      // POST /api/channels - Save channels
      const { channels } = req.body;

      if (!Array.isArray(channels)) {
        res.status(400).json({ error: 'Channels must be an array' });
        return;
      }

      const data = { channels };
      fs.writeFileSync(channelsFile, JSON.stringify(data, null, 2));

      res.status(200).json({
        message: 'Channels updated successfully',
        channels
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in channels API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
