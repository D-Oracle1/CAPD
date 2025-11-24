# CORS Proxy Server Setup Guide

## Overview

The CORS proxy server solves the problem of streaming directly from your website. Instead of being limited to embedded URLs (YouTube, Twitch), you can now use:

- Direct stream URLs (HTTP/HTTPS)
- RTMP streams
- HLS/DASH manifests (.m3u8)
- Custom streaming servers
- Any HTTP-based video source

## What's the Problem?

When you try to play a stream directly from a URL, browsers block it due to **CORS (Cross-Origin Resource Sharing)** security policies. The proxy server acts as a middleman that:

1. Receives the stream request from your website
2. Fetches the stream from the actual server
3. Adds proper CORS headers so the browser allows it
4. Sends the stream back to your player

## Installation

### Step 1: Install Node.js

If you haven't installed Node.js yet:
1. Download from https://nodejs.org/ (LTS version recommended)
2. Run the installer and follow the prompts
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 2: Install Dependencies

Navigate to your CAPD project directory and run:

```bash
npm install
```

This will install:
- **express** - Web server framework
- **cors** - CORS middleware
- **http-proxy-middleware** - Proxy handler for streaming

### Step 3: Start the Server

Run the server with:

```bash
npm start
```

You should see:
```
🚀 CAPD Streaming Proxy Server running on http://localhost:3000
📺 Serve your TV page at http://localhost:3000/tv.html
```

## Usage

### How It Works

1. **Admin Panel**: Enter any direct stream URL
   - Example: `https://stream.example.com/live/channel1.m3u8`
   - Example: `https://stream.example.com/live/stream.mp4`
   - Example: `rtmp://stream.example.com/live/stream`

2. **TV Page**: The system automatically routes it through the proxy
   - The proxy handles CORS issues
   - No more "embedded URL" requirement

3. **Stream Playback**: Video plays normally with full controls

### Stream URL Examples

**HLS Streams (.m3u8)**
```
https://live.example.com/stream.m3u8
```

**Direct MP4 Streams**
```
https://stream.example.com/video.mp4
```

**RTMP Streams**
```
rtmp://stream.example.com/live/stream
```

**Custom Streaming Servers**
```
https://wowza.example.com/live/stream.m3u8
https://ant-media.example.com/live/stream.m3u8
```

### Configuration in Admin Panel

1. Go to Admin Dashboard → Channels
2. Click "Add Channel" or edit existing channel
3. Paste your **direct stream URL** in the "Stream URL" field
4. Save the channel
5. The TV page will automatically use the proxy

## API Endpoints

### Stream Proxy
```
GET /api/stream?url=<encoded-url>
```

**Example:**
```
GET /api/stream?url=https%3A%2F%2Fstream.example.com%2Flive.m3u8
```

### Health Check
```
GET /api/health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2024-11-24T12:00:00.000Z"
}
```

## Deployment

### Local Testing
```bash
npm start
```
Access at: `http://localhost:3000/tv.html`

### Production Deployment

#### Option 1: Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create capd-streaming

# Deploy
git push heroku main

# Access at: https://capd-streaming.herokuapp.com/tv.html
```

#### Option 2: DigitalOcean App Platform
1. Push code to GitHub
2. Connect repository to DigitalOcean
3. Set runtime to Node.js
4. Deploy automatically

#### Option 3: Your Own Server
```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-repo/capd.git
cd capd

# Install dependencies
npm install

# Start with PM2 (process manager)
npm install -g pm2
pm2 start server.js --name "capd-streaming"
pm2 startup
pm2 save

# Access at: http://your-server.com/tv.html
```

## Environment Variables

Create a `.env` file to customize the server:

```
PORT=3000
NODE_ENV=production
LOG_LEVEL=warn
```

Or set when running:
```bash
PORT=8080 npm start
```

## Troubleshooting

### "Cannot GET /tv.html"
- Make sure you're accessing `http://localhost:3000/tv.html` (not just the root)
- The server serves static files from the project directory

### Stream won't play
- Check the stream URL is accessible in your browser directly
- Verify the URL format is correct
- Check browser console (F12) for error messages

### CORS errors still showing
- The proxy should handle this automatically
- If still occurring, the stream server might be blocking requests
- Try accessing the stream URL directly in your browser first

### Server won't start
- Check Node.js is installed: `node --version`
- Check dependencies: `npm install`
- Check port 3000 is available: `netstat -ano | findstr :3000` (Windows)

## Performance Tips

1. **Use HLS streams** (.m3u8) for best performance
2. **Keep bitrate reasonable** (4000-6000 kbps recommended)
3. **Test stream quality** before adding to channels
4. **Monitor server resources** if streaming to many users

## Security Notes

⚠️ **For Production Deployment:**

1. **Whitelist domains** - Don't proxy requests to arbitrary URLs
2. **Rate limiting** - Add to prevent abuse
3. **HTTPS only** - Always use HTTPS in production
4. **Authentication** - Protect admin panel with strong passwords
5. **Stream encryption** - Use RTMPS (not RTMP) for sensitive content

## Next Steps

- Configure channels in admin panel with direct stream URLs
- Test on TV page
- Deploy to production if needed
- Monitor streaming performance

## Support

For issues or questions:
1. Check browser console (F12) for error messages
2. Review server logs (terminal output)
3. Test stream URL directly in browser first
4. Verify streaming server is online and accessible
