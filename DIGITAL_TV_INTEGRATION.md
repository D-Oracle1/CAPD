# CAPD Digital TV Integration Guide

## Overview

Your original CAPD Communications website design has been preserved with a new **Digital TV** feature integrated as a dedicated page in the navigation.

## What Was Done

### ✅ Preserved Your Original Design
- **index.html** - Homepage with hero section, news, videos, and projects
- **news.html** - News listing and article detail pages
- **videos.html** - Video player with sidebar
- **projects.html** - Project gallery with lightbox

### ✅ Added Digital TV Page
- **tv.html** - New professional digital TV broadcasting page

### ✅ Updated Navigation
Added "📺 Digital TV" link to navigation on all pages:
- index.html
- news.html
- videos.html
- projects.html

### ✅ Created Reusable Data System
All TV features use JSON data files:
- **data/channels.json** - 5 broadcasting channels
- **data/schedule.json** - Program schedule
- **data/articles.json** - News articles
- **data/announcements.json** - Breaking news

### ✅ JavaScript Utilities (Optional)
Created helper files in assets/js/ for more advanced features:
- **assets/js/utils.js** - Utility functions (fetch, formatting, etc)
- **assets/js/components.js** - Reusable UI components

## New TV Page Features (tv.html)

### Live Streaming
- Multi-channel video player
- Channel switching with viewer counts
- Live/Offline status indicators
- Current program display
- Today's schedule preview

### Announcements & Breaking News
- Scrolling news ticker
- Breaking news section in sidebar
- Priority-based announcements
- Auto-expiring news items

### Program Schedule
- Today's programs in grid view
- Program images and descriptions
- Host information
- Live Now indicators

### Responsive Design
- Works on mobile, tablet, and desktop
- Matches your website's light theme
- Consistent with existing pages
- Same header and footer as other pages

## How to Use

### Quick Start

1. **Update streaming URLs**
   ```json
   // Edit data/channels.json
   "streamUrl": "https://your-streaming-server.com/live/channel-name"
   ```

2. **Add channel images** (optional)
   ```
   Create: assets/images/
   Add: channel-main.jpg, channel-news.jpg, etc
   ```

3. **Customize content**
   - Edit data/channels.json for channels
   - Edit data/schedule.json for programs
   - Edit data/articles.json for news articles
   - Edit data/announcements.json for breaking news

4. **Test locally**
   ```bash
   python -m http.server 8000
   # Visit http://localhost:8000/tv.html
   ```

### Configuration Files

#### data/channels.json
```json
{
  "channels": [
    {
      "id": "main",
      "name": "CAPD Main Channel",
      "number": 1,
      "description": "Main live broadcast",
      "streamUrl": "https://your-server.com/live/main",
      "status": "live",
      "viewers": 1250
    }
  ]
}
```

#### data/schedule.json
```json
{
  "schedule": [
    {
      "id": "prog-001",
      "channelId": "main",
      "title": "Morning News",
      "startTime": "06:00",
      "endTime": "06:30",
      "duration": 30,
      "description": "Daily news",
      "host": "John Doe",
      "image": "assets/images/prog-001.jpg"
    }
  ]
}
```

#### data/announcements.json
```json
{
  "announcements": [
    {
      "id": "ann-001",
      "type": "breaking",
      "title": "Breaking News Title",
      "content": "News content here",
      "timestamp": "2025-11-23T10:30:00Z",
      "priority": "high",
      "expiresAt": "2025-11-24T10:30:00Z"
    }
  ]
}
```

## File Structure

```
CAPD/
├── index.html              (Original - Updated nav)
├── news.html               (Original - Updated nav)
├── videos.html             (Original - Updated nav)
├── projects.html           (Original - Updated nav)
├── tv.html                 (NEW - Digital TV page)
│
├── data/                   (NEW - Data folder)
│   ├── channels.json       (NEW - 5 channels)
│   ├── schedule.json       (NEW - Programs)
│   ├── articles.json       (NEW - News articles)
│   └── announcements.json  (NEW - Breaking news)
│
├── assets/                 (NEW - Optional)
│   └── js/
│       ├── utils.js        (Utility functions)
│       └── components.js   (Reusable components)
│
└── news.json              (Original - Keep for compatibility)
```

## Features Breakdown

### On the TV Page

**Live Player**
- Embedded video player
- Supports HLS and RTMP streams
- Full controls (play, pause, fullscreen)
- Current program info display

**Channel List (Sidebar)**
- All available channels
- Live/offline status
- Viewer counts
- Click to switch channels

**Announcements Section**
- Breaking news items
- News ticker with scrolling text
- Priority indicators
- Auto-expiring content

**Schedule Section**
- Today's programs
- Program images
- Host information
- "LIVE NOW" badges for current programs

**Current Program**
- Program title and description
- Start and end times
- Host name
- Program image

## Streaming URLs

### How to Get Your Stream URL

**YouTube Live:**
- Get the streaming key from YouTube Studio
- Format: `https://www.youtube.com/embed/STREAM_KEY`

**Twitch:**
- Get RTMP ingest URL from dashboard
- Format: `rtmp://live-[region].twitch.tv/app/[stream_key]`

**Custom RTMP/HLS Server:**
- Use your streaming server URL
- HLS Format: `https://server.com/path/stream.m3u8`
- RTMP Format: `rtmp://server.com/app/stream-key`

**Self-Hosted:**
- Run OBS Studio or FFmpeg
- Stream to your server
- Use server's streaming URL

## Compatibility

- **Browsers:** Chrome, Firefox, Safari, Edge
- **Mobile:** iOS Safari, Android Chrome
- **Video Formats:** MP4, HLS (m3u8), RTMP
- **No Dependencies:** Works with just HTML/CSS/JS

## Customization

### Change Colors
The TV page uses your website's color scheme:
- Blue (#0066cc) - Primary
- Gray (#888, #666) - Secondary
- White (#fff) - Background

### Change Layout
The TV page is responsive:
- Desktop: 2-column (video + sidebar)
- Mobile: 1-column (video stacks on top)

### Add More Channels
Simply add more objects to `data/channels.json`:
```json
{
  "id": "sports",
  "name": "Sports Channel",
  "number": 6,
  ...
}
```

### Add Programs
Add to `data/schedule.json`:
```json
{
  "id": "prog-100",
  "channelId": "sports",
  "title": "Live Match",
  ...
}
```

## Testing

### Local Testing
```bash
# Start local server
cd /path/to/CAPD
python -m http.server 8000

# Visit
http://localhost:8000/tv.html
```

### Check Browser Console
Press **F12** to open developer tools and check for errors:
- Console tab for JavaScript errors
- Network tab to verify data loads
- Network tab to verify video stream works

### Common Issues

**Video not playing:**
- Check streaming URL is correct
- Verify server is running
- Test URL directly in VLC player
- Check browser console for errors

**Data not loading:**
- Check file path: `data/channels.json`
- Validate JSON syntax at jsonlint.com
- Check browser console for 404 errors
- Verify file exists in correct folder

**Announcements not showing:**
- Check `expiresAt` date is in future
- Verify JSON syntax
- Check if announcements array is populated

## Integration with Existing Pages

The TV page is standalone but integrates with your site:

**Homepage Integration**
You can add a link/button on index.html:
```html
<a href="tv.html" class="button">Watch Live TV</a>
```

**News Integration**
TV page pulls announcements (can also pull from news.json)

**Video Integration**
TV page uses separate data (news.json stays for homepage)

## Optional: Advanced Setup

### Using Reusable Components (Optional)
If you want to use the component system:

1. Include utilities in tv.html:
```html
<script src="assets/js/utils.js"></script>
<script src="assets/js/components.js"></script>
```

2. Use components:
```javascript
// Utils
Utils.fetchData('data/channels.json')
Utils.formatTime('14:30')

// Components
Components.createChannelCard(channel)
Components.createProgramItem(program)
Components.createAnnouncement(announcement)
```

These are pre-created but optional - tv.html works without them.

## Deployment

1. Push code to GitHub
2. GitHub Pages auto-deploys
3. Site available at: `https://username.github.io/CAPD`
4. TV page at: `https://username.github.io/CAPD/tv.html`

## Support

**Documentation Files:**
- `README.md` - Original comprehensive guide
- `QUICKSTART.md` - Quick reference
- `PLATFORM_SUMMARY.md` - Feature overview
- This file - Integration guide

**In-Page Help:**
- Check browser console (F12) for errors
- Validate JSON at jsonlint.com
- Test streaming URL separately

## Next Steps

1. ✅ **Setup complete** - TV page is ready
2. 📺 **Configure streams** - Add your streaming URLs
3. 📝 **Add content** - Customize channels, programs, announcements
4. 🧪 **Test** - Test locally with your content
5. 🚀 **Deploy** - Push to GitHub and go live

---

**Version:** 1.0
**Date:** November 23, 2025
**Status:** Ready to Use ✅

Your CAPD website now has professional digital TV capabilities while maintaining your original design!
