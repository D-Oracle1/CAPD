# CAPD Admin Dashboard - Streaming Setup Guide

Complete guide to using the Streaming Setup feature in the CAPD Admin Panel.

---

## 🚀 Quick Start

### Step 1: Access Admin Panel
1. Go to `/admin/`
2. Login with credentials:
   - **Username:** `admin`
   - **Password:** `capd2025`

### Step 2: Navigate to Streaming Setup
1. Click **🎬 Streaming Setup** in the left sidebar
2. Choose your streaming platform

### Step 3: Configure & Save
1. Select your platform (YouTube, Twitch, OBS, or Custom)
2. Follow the step-by-step wizard
3. Click **Save Configuration**

---

## 📋 Platform Setup Guides

### YouTube Live Setup

**What You'll Need:**
- YouTube account with verified email
- YouTube channel (must be 24+ hours old)
- Creator Studio access

**Steps:**

1. **Enable YouTube Live** (First Time Only)
   - Go to [youtube.com/creator_studio](https://youtube.com/creator_studio)
   - Click **Live Streaming**
   - Click **Set up content** → **Get started**
   - Click **Enable**
   - Wait 24 hours for YouTube to verify

2. **Get Your Stream Key**
   - Go to Creator Studio → **Live Streaming**
   - Click **Stream Settings** (left menu)
   - Copy your **Stream Key**

3. **In CAPD Admin Panel**
   - Select **YouTube Live**
   - Paste your Stream Key in the field
   - Paste your Video ID or Stream URL
   - Click **Save YouTube Configuration**

4. **Use with OBS Studio**
   - Open OBS
   - File → Settings → Stream
   - Service: **YouTube**
   - Click **Connect Account**
   - Select your live event

**Result:**
- ✅ Configuration saved
- ✅ Stream key securely stored
- ✅ Ready to broadcast

---

### Twitch Setup

**What You'll Need:**
- Twitch account
- Verified email
- Streaming content rights

**Steps:**

1. **Create/Access Twitch Account**
   - Go to [twitch.tv](https://twitch.tv)
   - Sign up or log in
   - Verify email

2. **Get Your Stream Key**
   - Click **Settings** (profile menu)
   - Click **Channel**
   - Scroll to **Primary Stream Key**
   - Click **Copy**

3. **In CAPD Admin Panel**
   - Select **Twitch**
   - Paste your Stream Key
   - Enter your Twitch channel name
   - Click **Save Twitch Configuration**

4. **Use with OBS Studio**
   - Open OBS
   - File → Settings → Stream
   - Service: **Twitch**
   - Click **Connect Account** or enter:
     - Server: `rtmp://live-iad.twitch.tv/app`
     - Stream Key: (paste from CAPD)

**Result:**
- ✅ Configuration saved
- ✅ Ready for Twitch broadcasting
- ✅ Can stream immediately

---

### OBS + Custom Server Setup

**What You'll Need:**
- OBS Studio installed
- Custom streaming server (Nginx, Wowza, Ant Media, etc.)
- Server address and credentials
- Stream key from your server

**Steps:**

1. **Download OBS Studio**
   - Go to [obsproject.com](https://obsproject.com)
   - Click **Download OBS Studio**
   - Install on your computer

2. **Get Server Credentials**
   - From your streaming server provider
   - Note the server address
   - Get your stream key

3. **In CAPD Admin Panel**
   - Select **OBS + Server**
   - Enter server address (e.g., `rtmp://server.com/live`)
   - Enter stream key
   - Adjust bitrate (4000 kbps recommended)
   - Select FPS (30 recommended)
   - Choose resolution (720p recommended)
   - Select preset (Medium recommended)
   - Click **Generate OBS Configuration** to see settings
   - Click **Save OBS Configuration**

4. **Configure OBS with Generated Settings**
   - Open OBS
   - File → Settings → Stream
   - Service: **Custom**
   - Enter server and key from CAPD
   - File → Settings → Output
   - Set bitrate to configured value
   - Click OK → Start Streaming

**Result:**
- ✅ Server credentials saved
- ✅ Output settings configured
- ✅ Ready for professional broadcasting

---

### Custom RTMP/HLS Server Setup

**What You'll Need:**
- Custom streaming server (Wowza, Ant Media, etc.)
- Server address
- Stream key
- Optional: HLS playlist URL

**Steps:**

1. **Get Server Information**
   - Server provider name
   - RTMP server address
   - Stream key from provider
   - Optional: HLS URL

2. **In CAPD Admin Panel**
   - Select **Custom RTMP**
   - Enter server provider name
   - Enter RTMP server address
   - Enter stream key
   - Enter HLS URL (if available)
   - Adjust bitrate if needed (4000 kbps default)
   - Select FPS (30 default)
   - Click **Save Custom Configuration**

3. **Use with OBS**
   - Open OBS
   - File → Settings → Stream
   - Service: **Custom**
   - Server: (paste RTMP address from CAPD)
   - Stream Key: (paste from CAPD)
   - Output settings as configured

**Result:**
- ✅ Custom server configured
- ✅ HLS playback ready (if URL provided)
- ✅ Full server control available

---

## 🔒 Security Features

### Stream Key Protection

**The Dashboard Protects Your Keys:**

1. **Display Masking**
   - Stream keys shown as: `••••••••••••••••`
   - Click 👁️ button to temporarily reveal
   - Keys never logged or exposed

2. **Clipboard Copying**
   - Click **Copy Stream Key** button
   - Key copied securely to clipboard
   - Safe to use with OBS

3. **LocalStorage Encryption**
   - Keys stored locally on your device
   - Not sent to servers
   - Only visible in admin panel

### Best Practices

- ⚠️ Never share your stream key
- ⚠️ Don't commit keys to GitHub
- ✅ Regenerate key if compromised
- ✅ Use strong password for admin account
- ✅ Keep backup of keys in secure location

---

## 📱 Current Configuration Display

### View Your Configuration

The **Current Streaming Configuration** section shows:
- **Platform:** Active streaming platform
- **Server:** Streaming server address
- **Status:** Configuration saved ✅
- **Last Updated:** When config was saved
- **Parameters:** All settings used

### Edit Configuration

1. Click **Edit Configuration** button
2. Select the same platform again
3. Modify any settings
4. Click **Save** to update

### Switch Platforms

1. Select different platform
2. Configure new platform
3. Previous config remains in localStorage
4. Can switch back anytime

---

## 🎯 Using Stream Configuration with OBS

### Quick Setup Method

1. **Get Stream Key from CAPD**
   - Go to Streaming Setup
   - Select your platform
   - Click **Copy Stream Key**
   - Key in clipboard

2. **Configure OBS**
   - Open OBS
   - File → Settings → Stream

   **For YouTube:**
   - Service: YouTube
   - Authenticate with account

   **For Twitch:**
   - Service: Twitch
   - Authenticate with account

   **For Custom:**
   - Service: Custom
   - Server: `rtmp://server.com/live`
   - Paste stream key

3. **Start Streaming**
   - Click **Start Streaming**
   - Monitor in platform (YouTube, Twitch, etc.)

---

## ✅ Verification Checklist

After saving configuration:

- [ ] Platform selected correctly
- [ ] Stream key entered
- [ ] Configuration saved (✅ message shown)
- [ ] Current config displays settings
- [ ] Can copy stream key to clipboard
- [ ] OBS configured with same settings
- [ ] Test stream works

---

## 🔧 Troubleshooting

### Configuration Not Saving

**Problem:** Configuration won't save

**Solution:**
1. Check all required fields filled
2. Stream key must not be empty
3. Check browser allows localStorage
4. Try different browser
5. Clear cookies and retry

### Stream Key Not Copying

**Problem:** Copy to clipboard doesn't work

**Solution:**
1. Make sure stream key field has value
2. Try clicking again
3. Use manual copy (Ctrl+C)
4. Try different browser

### Can't See Configuration

**Problem:** Current config not showing

**Solution:**
1. Refresh page
2. Save configuration again
3. Check localStorage enabled
4. Check browser console for errors

### Stream Key Visibility Toggle Not Working

**Problem:** Can't toggle visibility

**Solution:**
1. Refresh admin panel
2. Select platform again
3. Check for JavaScript errors (F12)
4. Try different browser

---

## 📊 Configuration Fields Explained

### YouTube Configuration
- **Stream Key:** 32-character key from YouTube Creator Studio
- **Server:** `rtmps://a.rtmp.youtube.com/live2` (auto-filled)
- **Video ID:** YouTube video ID or stream URL

### Twitch Configuration
- **Stream Key:** Secret key from Twitch Settings
- **Channel Name:** Your Twitch username
- **Server:** `rtmp://live-iad.twitch.tv/app` (auto-filled)

### OBS Configuration
- **Server:** RTMP address of custom server
- **Stream Key:** Server-provided streaming key
- **Bitrate:** Video bitrate (1500-8000 kbps)
- **FPS:** Frames per second (24, 30, 60)
- **Resolution:** Output resolution (480p, 720p, 1080p)
- **Preset:** Encoding preset (Fast, Medium, Slow)

### Custom RTMP Configuration
- **Provider:** Server provider name
- **RTMP Server:** Primary streaming address
- **Stream Key:** Authentication key
- **HLS URL:** Optional HTTP Live Streaming URL
- **Bitrate:** Recommended bitrate
- **FPS:** Frames per second

---

## 💡 Tips & Tricks

### Save Multiple Configurations

**Use Admin Features:**
1. Save YouTube config
2. Go back to Streaming Setup
3. Select Twitch
4. Enter different details
5. Both configs saved (latest overwrites)

**Note:** Currently stores only latest config. Consider exporting for backup.

### Generate OBS Config

Click **Generate OBS Configuration** to see detailed settings in a dialog:
```
OBS Configuration
================
Server: rtmp://your-server.com/live
Stream Key: abc123xyz

Output Settings:
- Bitrate: 4000 kbps
- FPS: 30
- Resolution: 1280x720
- Preset: Medium
```

### Export Configuration

To backup configuration:
1. Go to Settings → **Export All Data**
2. JSON file downloads
3. Your streaming config included
4. Can import later

---

## 🚀 Advanced Usage

### Custom Server Setup Recommendations

**For Nginx RTMP:**
```
Server: rtmp://your-domain.com:1935/live
Stream Key: your-stream-name
HLS: http://your-domain.com/hls/stream.m3u8
```

**For Wowza:**
```
Server: rtmp://your-wowza-server.com/live
Stream Key: your-stream-key
HLS: http://your-server.com:8081/vod/mp4:stream/playlist.m3u8
```

**For Ant Media:**
```
Server: rtmp://your-server.com:1935/live
Stream Key: stream-name
HLS: http://your-server.com:5080/WebRTCAppEE/rest/v2/broadcasts/stream-name/hls/media.m3u8
```

---

## 📞 Support

### Common Issues

**Stream Won't Connect**
- Check stream key is correct
- Verify server address is accessible
- Check firewall allows port 1935 (RTMP)
- Test internet connection

**Poor Video Quality**
- Reduce bitrate
- Lower resolution
- Check internet upload speed
- Close background apps

**Stream Keeps Dropping**
- Use Ethernet instead of WiFi
- Lower bitrate/resolution
- Check for network issues
- Have backup internet ready

### Get Help

- Check [STREAMING_GUIDE.md](./STREAMING_GUIDE.md) for detailed platform guides
- Review [STREAMING_TROUBLESHOOTING.md](./STREAMING_TROUBLESHOOTING.md) for issues
- Check admin panel tooltips and help text
- Contact: admin@capd.ng

---

## 🎓 Video Tutorials

Coming soon! Video walkthroughs for:
- YouTube Live setup
- Twitch configuration
- OBS Studio setup
- Custom server configuration
- Troubleshooting streams

---

**Version:** 1.0
**Created:** November 24, 2025
**Status:** Complete & Ready

Start streaming with CAPD today! 🎬
