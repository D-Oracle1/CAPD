# 🎬 Using Custom RTMP with Admin Panel

## Overview

The admin panel has a **Custom RTMP Configuration** section that lets you:
- Configure your RTMP streaming server
- Set stream parameters
- Save broadcaster settings
- View your streaming configuration

## Accessing Custom RTMP Settings

### In Admin Panel

1. Open: http://localhost:3000/admin/index.html
2. **Login:** admin / capd2025
3. Click the **Settings** section (gear icon)
4. Scroll to **Streaming Setup & Configuration**
5. Click on **Custom RTMP** option

## Configuration Fields

### Server Details

**Provider:**
- Your streaming server provider
- Examples: "Custom Nginx", "Wowza", "Ant Media", "Node Media Server"
- Free option: Use the built-in RTMP server

**RTMP Server Address:**
- The RTMP endpoint where you'll broadcast
- Example: `rtmp://localhost:1935/live`
- Or production: `rtmp://your-domain.com:1935/live`

**Stream Key:**
- The identifier for your stream
- Example: `live` or `broadcast123`
- Used in OBS/FFmpeg configuration

**HLS Stream URL (Optional):**
- The web playback URL
- Example: `http://localhost:8000/live/mystream/index.m3u8`
- Generated automatically by RTMP server

### Streaming Parameters

**Recommended Bitrate:**
- 4000 kbps for 720p quality (default)
- 2000 kbps for 480p quality
- 6000 kbps for 1080p quality
- Lower = less bandwidth, lower quality
- Higher = better quality, more bandwidth

**FPS (Frames Per Second):**
- 30 fps (recommended for most content)
- 24 fps (film-like look)
- 60 fps (gaming/sports/fast action)

## Step-by-Step Configuration

### For Built-in RTMP Server

1. **Provider:** `Node Media Server`
2. **RTMP Server:** `rtmp://localhost:1935/live`
3. **Stream Key:** `mystream` (or any name)
4. **HLS Stream URL:** `http://localhost:8000/live/mystream/index.m3u8`
5. **Bitrate:** `4000` kbps
6. **FPS:** `30`
7. **Click: Save Custom Configuration**

### For Production Server

1. **Provider:** `Your provider name`
2. **RTMP Server:** `rtmp://your-server.com:1935/live`
3. **Stream Key:** Your actual stream key
4. **HLS Stream URL:** `http://your-server.com:8000/live/streamname/index.m3u8`
5. **Bitrate:** Recommended for your server
6. **FPS:** Server's recommended FPS
7. **Click: Save Custom Configuration**

## Using Saved Configuration

### In OBS Studio

Once you save the configuration in admin panel:

1. **Open OBS Settings** → **Stream**
2. **Service:** Custom
3. **Server:** Use the saved RTMP Server address
   ```
   rtmp://localhost:1935/live
   ```
4. **Stream Key:** Use the saved Stream Key
   ```
   mystream
   ```
5. **Start Streaming**

### In CAPD Channels

After broadcasting:

1. **Go to Channels** section
2. **Add Channel**
3. **Stream URL:** Use the saved HLS Stream URL
   ```
   http://localhost:8000/live/mystream/index.m3u8
   ```
4. **Save Channel**
5. **Watch on TV page**

## Admin Panel Streaming Section

The admin panel under Settings shows:

### Current Configuration Display
- **Platform:** Custom RTMP/HLS
- **Provider:** Your provider
- **RTMP Server:** Address
- **Stream Key:** (hidden for security)
- **HLS URL:** Playback address
- **Parameters:** Bitrate and FPS settings

### Edit Button
- Click "📝 Edit Configuration" to update settings
- Make changes and save again

## Multiple Streams

You can configure multiple custom RTMP streams by:

1. **Create different stream names** in OBS
   - Stream 1: `rtmp://localhost:1935/live/channel1`
   - Stream 2: `rtmp://localhost:1935/live/channel2`

2. **Add multiple channels** in CAPD
   - Channel 1: `http://localhost:8000/live/channel1/index.m3u8`
   - Channel 2: `http://localhost:8000/live/channel2/index.m3u8`

3. **Use same configuration** for all
   - Base RTMP server is the same
   - Only stream key (final part of URL) differs

## Troubleshooting

### Configuration Saved But Stream Won't Play

**Check:**
1. Is RTMP server running? (`npm run rtmp-server`)
2. Is OBS connected and broadcasting?
3. Check the HLS URL is accessible
4. Verify stream name matches between OBS and config

### HLS URL Not Working

**Solutions:**
1. Test in browser: `http://localhost:8000/live/mystream/index.m3u8`
2. Should show `.ts` file list if working
3. Make sure stream name matches OBS setting
4. Check RTMP server hasn't crashed

### Stream Key Not Saving

**Causes:**
1. Form validation may be rejecting input
2. Browser console might show errors
3. Try shorter stream key (no special chars)
4. Clear browser cache and try again

### Can't Edit Configuration

**Solutions:**
1. Click "📝 Edit Configuration" button
2. Make changes
3. **Important:** Click "✅ Save Custom Configuration" (not just any save button)
4. Verify it shows in the current configuration display

## Best Practices

### Security
- ✅ Use strong stream keys in production
- ✅ Change stream keys regularly
- ✅ Don't share stream keys publicly
- ✅ Use RTMPS (secure RTMP) in production

### Performance
- ✅ Start with 4000 kbps bitrate
- ✅ Monitor CPU usage while streaming
- ✅ Adjust bitrate based on connection
- ✅ Test before going live

### Reliability
- ✅ Test configuration before broadcast
- ✅ Have backup streaming method
- ✅ Monitor server status
- ✅ Keep backups of configuration

## Integration with TV Page

Once configured and streaming:

### Workflow
1. **Admin Panel:** Save custom RTMP config
2. **OBS:** Start broadcasting to RTMP server
3. **Admin Panel:** Add channel with HLS URL
4. **TV Page:** Select channel and watch
5. **Broadcast:** Appears on TV page automatically

### Real-Time Updates
- When you start broadcasting, stream appears
- When you stop broadcasting, stream goes offline
- Viewers see status change automatically

## Advanced: API Integration

### Check Stream Status

```bash
# Get all active streams
curl http://localhost:3000/api/streams

# Get specific stream
curl http://localhost:3000/api/streams/mystream
```

Response includes:
- Stream status (live/offline)
- Start time
- HLS URL
- Stream name

### Monitor in Real-Time

```javascript
// JavaScript code to check streams
fetch('http://localhost:3000/api/streams')
  .then(r => r.json())
  .then(data => console.log('Active streams:', data.count))
```

## Common Configuration Examples

### Basic Home Setup
```
Provider: Node Media Server
RTMP: rtmp://localhost:1935/live
Key: mystream
HLS: http://localhost:8000/live/mystream/index.m3u8
Bitrate: 4000 kbps
FPS: 30
```

### Production Setup
```
Provider: Wowza Streaming Engine
RTMP: rtmp://streaming.company.com:1935/live
Key: prod_channel_1
HLS: https://streaming.company.com:8000/live/prod_channel_1/index.m3u8
Bitrate: 6000 kbps
FPS: 30
```

### Low-Bandwidth Setup
```
Provider: Node Media Server
RTMP: rtmp://localhost:1935/live
Key: mobile_stream
HLS: http://localhost:8000/live/mobile_stream/index.m3u8
Bitrate: 1500 kbps
FPS: 24
```

## Keyboard Shortcuts in Admin Panel

| Action | Method |
|--------|--------|
| Save Configuration | Button click or `Enter` |
| Edit Configuration | Click "📝 Edit" button |
| View Settings | Settings section |
| Logout | Logout button (top right) |

## Data Storage

### Where Configuration Is Saved
- **Browser localStorage** - Stored in your browser
- **Admin Panel** - Available when you log back in
- **Not synced** - Only available on this browser/device

### Export Configuration
1. Go to **Settings** → **Data Backup**
2. Click **📥 Export All Data**
3. Configuration is included in JSON file

### Import Configuration
1. Go to **Settings** → **Data Import**
2. Select previously exported JSON file
3. Configuration is restored

## Support

For issues:
1. Check browser console (F12) for errors
2. Check RTMP server logs (terminal)
3. Read RTMP_SERVER_GUIDE.md for detailed help
4. Check OBS logs for connection issues

## Next Steps

1. ✅ Install FFmpeg
2. ✅ Start RTMP server: `npm run rtmp-server`
3. ✅ Configure in admin panel
4. ✅ Set up OBS with RTMP settings
5. ✅ Start broadcasting
6. ✅ Add channel with HLS URL
7. ✅ Watch on TV page

**Your streaming setup is complete!** 🎬
