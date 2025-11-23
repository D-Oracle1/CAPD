# CAPD Live Streaming Setup Guide

Complete guide to setting up and managing live streams on your CAPD Digital TV platform.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Platform Options](#platform-options)
3. [YouTube Live Setup](#youtube-live-setup)
4. [Twitch Setup](#twitch-setup)
5. [OBS Studio Setup](#obs-studio-setup)
6. [Custom RTMP/HLS Server](#custom-rtmphls-server)
7. [Adding Stream to CAPD](#adding-stream-to-capd)
8. [Monitoring & Management](#monitoring--management)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Quick Start

### Choose Your Platform

| Platform | Complexity | Cost | Setup Time |
|----------|-----------|------|-----------|
| **YouTube Live** | ⭐ Easy | Free | 10 min |
| **Twitch** | ⭐ Easy | Free | 10 min |
| **OBS + Streaming Server** | ⭐⭐⭐ Medium | Low-Moderate | 30 min |
| **Custom RTMP Server** | ⭐⭐⭐⭐ Advanced | Moderate-High | 1-2 hours |

### 3-Step Process

1. **Set up streaming source** (YouTube, Twitch, OBS, etc.)
2. **Get stream URL/Key** from your streaming service
3. **Add to CAPD** via admin panel

---

## Platform Options

### Option 1: YouTube Live (RECOMMENDED for Beginners)

**Pros:**
- ✅ Free
- ✅ Easy setup
- ✅ Large audience
- ✅ Built-in chat
- ✅ Automatic archiving
- ✅ Analytics included

**Cons:**
- YouTube account required
- Limited customization
- Dependent on YouTube policies

### Option 2: Twitch

**Pros:**
- ✅ Free
- ✅ Gaming/streaming focused
- ✅ Good community
- ✅ Monetization available
- ✅ Built-in chat

**Cons:**
- Affiliate requirements
- Gaming-focused audience
- Bandwidth limits

### Option 3: OBS + Streaming Server

**Pros:**
- ✅ Full control
- ✅ Multiple outputs
- ✅ Professional quality
- ✅ No platform restrictions

**Cons:**
- ⚠️ Requires technical setup
- ⚠️ Server costs
- ⚠️ More maintenance

### Option 4: Custom RTMP/HLS

**Pros:**
- ✅ Complete control
- ✅ White-label solution
- ✅ Scalable

**Cons:**
- ⚠️ Expensive
- ⚠️ Requires technical expertise
- ⚠️ Higher maintenance

---

## YouTube Live Setup

### Step 1: Enable YouTube Live

1. Go to [youtube.com](https://youtube.com)
2. Sign in to your CAPD YouTube account
3. Click your profile → **Creator Studio**
4. Go to **Live Streaming** (left menu)
5. Click **Set up content** → **Get started**
6. Click **Enable**
7. Wait 24 hours for YouTube to verify

### Step 2: Create a Live Event

1. Go to **Creator Studio** → **Live Streaming**
2. Click **Create**
3. Fill in details:
   - **Title:** "CAPD Main Channel - Live"
   - **Description:** "Community news and programs"
   - **Scheduled for:** Date/time of broadcast
   - **Visibility:** Public
   - **Language:** English
   - **Category:** News

4. Click **Create**

### Step 3: Get Stream Key

1. Go to **Creator Studio** → **Live Streaming**
2. Select your event
3. Go to **Stream Settings** (left menu)
4. Copy **Stream Key** (keep this private!)
5. Copy **Stream URL:** `rtmps://a.rtmp.youtube.com/live2`

### Step 4: Start Broadcasting

#### Option A: Using OBS (Recommended)
- See [OBS Setup](#obs-studio-setup) below
- Use Stream Key from YouTube

#### Option B: Using YouTube Live Dashboard
1. Go to **Creator Studio** → **Live Streaming**
2. Click **Share**
3. YouTube generates embed code
4. Copy the YouTube URL

### Step 5: Add to CAPD

1. Go to Admin Panel → **Channels**
2. Click **+ Add Channel**
3. Fill in:
   - **Channel Name:** CAPD Main Channel
   - **Channel Number:** 1
   - **Stream URL:**
     - For embed: `https://www.youtube.com/embed/STREAM_ID`
     - For direct: `https://www.youtube.com/watch?v=STREAM_ID`
   - **Status:** live
4. Click **Save Channel**

### YouTube Embed Code

YouTube provides embed code:
```html
<iframe
  width="100%"
  height="100%"
  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
  frameborder="0"
  allowfullscreen>
</iframe>
```

Extract the video ID from the URL and use it in CAPD.

---

## Twitch Setup

### Step 1: Create Twitch Account

1. Go to [twitch.tv](https://twitch.tv)
2. Sign up with email
3. Verify email
4. Complete profile

### Step 2: Get Stream Key

1. Go to **Settings** (top right menu)
2. Click **Channel**
3. Scroll to **Primary Stream Key**
4. Click **Copy**

**Keep this key SECRET!** Anyone with this key can stream to your channel.

### Step 3: Prepare OBS or Streaming Software

See [OBS Setup](#obs-studio-setup) for details.

Settings for Twitch:
- **Server:** `rtmp://live-iad.twitch.tv/app`
- **Stream Key:** Your Twitch stream key

### Step 4: Start Stream

1. Open OBS (or streaming software)
2. Enter Twitch settings
3. Click **Start Streaming**
4. Go to Twitch.tv to verify stream is live

### Step 5: Add to CAPD

1. Go to Admin Panel → **Channels**
2. Click **+ Add Channel**
3. Fill in:
   - **Channel Name:** CAPD Twitch
   - **Stream URL:** `https://www.twitch.tv/yourchannel`
   - **Status:** live
4. Click **Save Channel**

### Twitch Embed Code

Get embed code:
1. Go to your channel on Twitch
2. Click **Share** (top right)
3. Click **Embed**
4. Copy code

```html
<iframe
  src="https://player.twitch.tv/?channel=YOUR_CHANNEL&parent=yourdomain.com"
  height="720"
  width="1280"
  allowfullscreen>
</iframe>
```

---

## OBS Studio Setup

### What is OBS?

**OBS Studio** (Open Broadcaster Software) is free software that:
- ✅ Captures your screen/camera
- ✅ Broadcasts to YouTube, Twitch, Facebook, etc.
- ✅ Customizable layouts
- ✅ Professional quality
- ✅ Works on Windows, Mac, Linux

### Download & Install

1. Go to [obsproject.com](https://obsproject.com)
2. Download OBS Studio (free)
3. Install on your computer
4. Launch OBS

### Step 1: Add Video Source

1. OBS window opens
2. Under **Sources** section, click **+** (plus sign)
3. Choose source type:
   - **Display Capture:** Stream your entire screen
   - **Window Capture:** Stream one window
   - **Camera:** Stream from webcam
   - **Video Capture Device:** Stream from camera
   - **Media Source:** Stream video file

4. Select your source (example: Display Capture)
5. Click **Create New**
6. Click **OK**

### Step 2: Add Audio Source

1. Under **Sources**, click **+**
2. Select **Audio Input Capture**
3. Choose your microphone/audio device
4. Click **Create New**
5. Click **OK**

### Step 3: Configure Stream Settings

#### For YouTube:

1. Click **File** → **Settings**
2. Go to **Stream** (left menu)
3. Service: **YouTube**
4. Click **Connect Account**
5. Sign in with your YouTube account
6. Authorize OBS
7. Select your live event from dropdown

#### For Twitch:

1. Click **File** → **Settings**
2. Go to **Stream** (left menu)
3. Service: **Twitch**
4. Authentication Token: Click **Connect Account**
5. Sign in with Twitch
6. Or enter manually:
   - **Server:** `rtmp://live-iad.twitch.tv/app`
   - **Stream Key:** Your Twitch key

#### For Custom Server:

1. Click **File** → **Settings**
2. Go to **Stream** (left menu)
3. Service: **Custom**
4. **Server:** `rtmp://your-server.com/app`
5. **Stream Key:** Your stream key

### Step 4: Test Settings

1. Click **File** → **Settings**
2. Go to **Output** (left menu)
3. Bitrate recommendations:
   - **Video:** 2500-6000 kbps
   - **Audio:** 128 kbps
4. Check **Automatic configuration** for auto-setup
5. Click **OK**

### Step 5: Start Streaming

1. Make sure your sources are configured
2. Check Preview to see what will stream
3. Click **Start Streaming** (bottom right)
4. OBS shows connection status
5. Check your broadcast platform (YouTube/Twitch) to verify live

### OBS Layout Tips

Create professional layouts:
1. Drag sources to arrange
2. Right-click source → **Transform** for sizing
3. Create multiple **Scenes** for different layouts:
   - Scene 1: Full screen
   - Scene 2: Screen + webcam
   - Scene 3: News desk view
4. Switch scenes during broadcast

### OBS Keyboard Shortcuts

- **Alt + S:** Start/Stop streaming
- **Alt + R:** Start/Stop recording
- **Space:** Mute audio
- **Up/Down Arrow:** Switch scenes

---

## Custom RTMP/HLS Server

### What You Need

1. **Streaming Server Software:**
   - Nginx with RTMP module
   - Wowza Streaming Engine
   - Ant Media Server
   - Red5 Server

2. **Server:** VPS or dedicated server with:
   - Good bandwidth (5-25 Mbps upload)
   - Low latency
   - Reliable uptime

3. **Domain:** Optional (for HTTPS)

### Option 1: Nginx + RTMP Module (Recommended)

#### Install Nginx RTMP

**On Linux (Ubuntu/Debian):**

```bash
# Install dependencies
sudo apt-get update
sudo apt-get install build-essential libpcre3 libpcre3-dev zlib1g zlib1g-dev libssl-dev libgd-dev libgeoip-dev wget curl git

# Download Nginx
cd /tmp
wget http://nginx.org/download/nginx-1.20.1.tar.gz
tar -xzf nginx-1.20.1.tar.gz

# Download RTMP module
git clone https://github.com/arut/nginx-rtmp-module.git

# Configure Nginx with RTMP
cd nginx-1.20.1
./configure \
  --prefix=/etc/nginx \
  --sbin-path=/usr/sbin/nginx \
  --add-module=../nginx-rtmp-module \
  --with-http_ssl_module \
  --with-http_gzip_static_module

# Compile and install
make
sudo make install
```

#### Configure RTMP

Create `/etc/nginx/nginx.conf`:

```nginx
user www-data;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;
    gzip on;

    server {
        listen 80;
        server_name your-domain.com;

        location / {
            root /var/www/html;
            index index.html;
        }

        location /stat {
            rtmp_stat all;
            rtmp_stat_stylesheet stat.xsl;
        }
    }
}

rtmp {
    server {
        listen 1935;
        chunk_size 4096;

        # RTMP application
        application live {
            live on;
            record off;

            # Allow push from OBS/streaming software
            allow publish 0.0.0.0/0;
            allow play 0.0.0.0/0;
        }

        # HLS application
        application hls {
            live on;
            hls on;
            hls_path /tmp/hls;
            hls_fragment 10s;
            hls_playlist_length 60s;
        }
    }
}
```

#### Start Nginx

```bash
sudo nginx
```

#### Get Stream URLs

**RTMP URL:**
```
rtmp://your-domain.com/live/stream-key
```

**HLS URL:**
```
http://your-domain.com/hls/stream-key.m3u8
```

### Option 2: Docker (Easiest)

Use Docker with pre-configured streaming server:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Run streaming server
docker run -d \
  --name streaming \
  -p 1935:1935 \
  -p 8080:8080 \
  jrottenberg/ffmpeg:4.4-ubuntu \
  -i rtmp://localhost/live/stream \
  -c:v libx264 -c:a aac \
  -f flv rtmp://localhost/out/stream
```

---

## Adding Stream to CAPD

### From Admin Panel

1. Go to **Admin Panel** → **Channels**
2. Click **+ Add Channel**
3. Fill in form:

```
Channel Name:    CAPD Main Channel
Channel Number:  1
Description:     Main live broadcast
Stream URL:      rtmp://server.com/live/main
                 OR
                 https://www.youtube.com/embed/VIDEO_ID
                 OR
                 http://server.com/hls/stream.m3u8
Status:          live
Viewers:         0
```

4. Click **Save Channel**

### Stream URL Format

**YouTube:**
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

**Twitch:**
```
https://www.twitch.tv/yourchannel
```

**Custom RTMP:**
```
rtmp://your-domain.com/live/stream-key
```

**HLS (HTTP Live Streaming):**
```
https://your-domain.com/hls/stream.m3u8
```

### Update Stream URL

1. Go to Admin Panel → **Channels**
2. Find your channel
3. Click **Edit**
4. Update Stream URL
5. Click **Save Channel**

---

## Monitoring & Management

### Check Live Status

1. Go to **Admin Panel** → **Dashboard**
2. Check channel status
3. Update viewer count:
   - Go to **Channels**
   - Edit channel
   - Update **Viewers** number
   - Save

### Monitor Performance

#### YouTube Analytics

1. Go to **Creator Studio** → **Analytics**
2. Monitor:
   - Concurrent viewers
   - Average view duration
   - Audience retention
   - Engagement (likes, comments)

#### Twitch Analytics

1. Go to **Creator Dashboard**
2. View:
   - Viewer count
   - Peak viewers
   - Watch time
   - Follow count

#### OBS Monitoring

In OBS:
1. View **Stats** (bottom left)
2. Check:
   - Bitrate
   - FPS
   - Dropped frames
   - Encoding usage

### Update Program Info

1. Go to **Admin Panel** → **Schedule**
2. Click **+ Add Program**
3. Fill in details:
   - Title
   - Start time
   - End time
   - Host
   - Description
4. Click **Save Program**

### Post Announcements

1. Go to **Admin Panel** → **Announcements**
2. Click **+ Add Announcement**
3. Post: "LIVE NOW: Main broadcast starting"
4. Set priority: **high**
5. Click **Post Announcement**

---

## Troubleshooting

### Stream Won't Start

**Problem:** "Failed to connect to streaming server"

**Solution:**
1. Check internet connection
2. Verify stream URL
3. Check stream key (is it correct?)
4. Verify firewall allows port 1935 (RTMP)
5. Restart OBS and try again

### Video Quality Issues

**Problem:** Buffering, pixelation, lag

**Solution:**
1. Lower bitrate in OBS (try 2500-4000 kbps)
2. Reduce resolution to 720p
3. Check internet upload speed (need 5+ Mbps)
4. Close other applications
5. Move closer to router
6. Use Ethernet cable instead of WiFi

### Audio Issues

**Problem:** No audio, distorted audio, echoing

**Solution:**
1. Check microphone is selected in OBS
2. Check microphone levels (shouldn't peak)
3. Mute desktop audio if recording screen
4. Check system audio levels
5. Use external microphone
6. Check microphone cable connection

### Dropped Frames

**Problem:** Streaming drops, disconnects

**Solution:**
1. Lower resolution (try 720p)
2. Lower FPS to 30
3. Reduce bitrate
4. Close background applications
5. Check internet stability (run speed test)
6. Use wired connection
7. Disable WiFi if possible

### Stream Not Appearing in CAPD

**Problem:** Stream URL added but video not playing

**Solution:**
1. Verify stream URL format
2. Check stream is actually broadcasting
3. Clear browser cache
4. Try different browser
5. Check video player compatibility
6. Verify HTML5 is enabled
7. Check console for errors (F12)

---

## Best Practices

### Before Going Live

- ✅ Test stream 15 minutes early
- ✅ Check audio and video quality
- ✅ Have backup internet connection
- ✅ Close unnecessary applications
- ✅ Set up scenes in OBS beforehand
- ✅ Inform viewers via announcement
- ✅ Post social media announcement
- ✅ Test chat functionality

### During Broadcast

- ✅ Monitor viewer count
- ✅ Watch for comments/questions
- ✅ Keep audio/video quality stable
- ✅ Engage with audience
- ✅ Monitor dropped frames (OBS stats)
- ✅ Keep conversation relevant
- ✅ Stay professional
- ✅ Follow community guidelines

### After Broadcast

- ✅ Save recording (if enabled)
- ✅ Update program status
- ✅ Post summary announcement
- ✅ Review analytics
- ✅ Respond to comments
- ✅ Archive video
- ✅ Create clips for social media
- ✅ Plan next broadcast

### Quality Standards

**Recommended Settings:**

- **Resolution:** 1280x720 (720p)
- **FPS:** 30 fps
- **Video Bitrate:** 4000 kbps
- **Audio Bitrate:** 128 kbps
- **Codec:** H.264 video, AAC audio

**Minimum Requirements:**

- **Resolution:** 854x480
- **FPS:** 24 fps
- **Bitrate:** 2000 kbps
- **Internet:** 3 Mbps upload

### Bandwidth Requirements

| Resolution | FPS | Bitrate | Upload Speed Needed |
|-----------|-----|---------|-------------------|
| 480p | 24 | 1500 kbps | 2 Mbps |
| 480p | 30 | 2500 kbps | 3 Mbps |
| 720p | 24 | 3000 kbps | 4 Mbps |
| 720p | 30 | 4000 kbps | 5 Mbps |
| 1080p | 30 | 6000 kbps | 8 Mbps |

---

## Advanced: Multiple Streams

### Stream to Multiple Platforms

With OBS, stream simultaneously to YouTube, Twitch, Facebook:

1. Go to **File** → **Settings**
2. Go to **Stream**
3. Service: **Custom**
4. Enable **Stream to multiple destinations**
5. Add each platform's RTMP URL
6. Click **OK**
7. Start streaming to all at once

### Load Balancing

For high-traffic streams:
1. Use CDN (Cloudflare, Akamai)
2. Distribute across multiple servers
3. Use geographic routing
4. Monitor performance

### Backup Stream

Set up backup:
1. Configure second OBS instance
2. Use different streaming server
3. Switch if primary fails
4. Monitor both streams

---

## Security Tips

### Protect Your Stream Key

- ❌ Never share stream key publicly
- ❌ Don't post stream key in chats
- ❌ Don't commit to GitHub with key
- ✅ Regenerate key if compromised
- ✅ Use environment variables
- ✅ Store securely

### Firewall Configuration

Allow these ports:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 1935 (RTMP)
- Port 8080 (HLS)

### SSL/HTTPS

Use RTMPS (encrypted RTMP):
```
rtmps://your-domain.com:443/live/stream-key
```

---

## Common Stream URLs

### YouTube

```
https://www.youtube.com/watch?v=VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
rtmps://a.rtmp.youtube.com/live2/STREAM_KEY
```

### Twitch

```
https://www.twitch.tv/CHANNEL_NAME
rtmp://live-iad.twitch.tv/app/STREAM_KEY
```

### OBS/Custom

```
rtmp://server.com/live/stream-key
http://server.com/hls/stream.m3u8
rtmps://server.com:443/live/stream-key
```

---

## Getting Help

### OBS Support

- **Website:** [obsproject.com](https://obsproject.com)
- **Forum:** [obsproject.com/forum](https://obsproject.com/forum)
- **Discord:** [obs.community](https://obs.community)

### YouTube Live Help

- **Creator Support:** [youtube.com/support](https://youtube.com/support)
- **Community Forum:** YouTube Creator Community

### Twitch Support

- **Help Center:** [twitch.tv/help](https://twitch.tv/help)
- **Discord:** Twitch Developer Community

### CAPD Support

- **Email:** admin@capd.ng
- **Phone:** +234 801 234 5678
- **Hours:** 24/7 support

---

## Quick Reference

### Add Stream to CAPD in 3 Steps

1. **Get stream URL** from platform
2. **Go to Admin** → Channels → + Add Channel
3. **Paste URL** and save

### Stream URL Cheat Sheet

**YouTube:**
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```

**Twitch:**
```
https://www.twitch.tv/yourchannel
```

**OBS:**
```
rtmp://server.com/live/stream-key
```

**HLS:**
```
http://server.com/hls/stream.m3u8
```

---

**Version:** 1.0
**Created:** November 23, 2025
**Status:** Complete & Ready

Next: Start your first broadcast! 🎬
