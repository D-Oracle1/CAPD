# CAPD Digital TV - Community Broadcasting Platform

A modern, professional digital television platform built for live streaming, program scheduling, and community engagement.

## 🎯 Platform Overview

CAPD Digital TV is a comprehensive digital broadcasting solution designed to:

- **Stream live content** from 5+ channels simultaneously
- **Share breaking news and announcements** with interactive ticker
- **Manage program schedules** with detailed guides
- **Engage audiences** through live chat and comments
- **Distribute news articles** with categories and search
- **Reach global audiences** across all devices

## 🏗️ Architecture

### Directory Structure

```
CAPD/
├── index.html                # Homepage / Dashboard
├── live.html                 # Live streaming player with channel switching
├── schedule.html             # Program guide and schedule
├── news.html                 # News articles and detail pages
├── assets/
│   ├── css/
│   │   └── styles.css        # Main stylesheet (Tailwind + custom)
│   └── js/
│       ├── utils.js          # Utility functions (fetch, formatting, etc)
│       └── components.js     # Reusable UI components
├── data/
│   ├── channels.json         # Channel configuration (5+ channels)
│   ├── schedule.json         # Program guide (50+ programs)
│   ├── announcements.json    # Breaking news and alerts
│   └── articles.json         # News articles
└── config/                   # Configuration files (future)
```

### Technology Stack

- **Frontend**: HTML5, CSS3 (Tailwind), Vanilla JavaScript
- **Styling**: Tailwind CSS (CDN) + Custom CSS
- **Data**: JSON files (static)
- **Streaming**: HLS/RTMP ready (configure stream URLs)
- **Deployment**: GitHub Pages (automatic via Actions)

## 📺 Core Features

### 1. **Live Streaming Page** (`live.html`)

- Multi-channel live player with HLS/RTMP support
- Channel switching with live indicators
- Real-time viewer count
- Live chat with message history
- Like and share functionality
- Current program display
- Upcoming programs grid

**Key Functions:**
- `selectChannel()` - Switch between channels
- `setupChat()` - Initialize live chat
- `setupPlayerControls()` - Like, share, fullscreen buttons

### 2. **Program Schedule** (`schedule.html`)

- Complete TV guide with filtering
- Channel and date filters
- Table view with detailed information
- Grid view with program cards
- Program modal with full details
- Quick navigation to live stream

**Key Functions:**
- `displaySchedule()` - Render programs
- `openProgramModal()` - Show program details
- `goToLiveStream()` - Navigate to channel

### 3. **News System** (`news.html`)

- Articles with categories and search
- Article detail pages with comments
- Related articles sidebar
- Share functionality
- Comment system
- Author and date metadata

**Key Functions:**
- `displayArticlesList()` - Show all articles
- `displayArticleDetail()` - Show single article
- `setupComments()` - Comment interaction

### 4. **Homepage** (`index.html`)

- Featured channels showcase
- Breaking news ticker (scrolling)
- What's On Now section
- Coming Up Next section
- Latest news highlights
- Feature descriptions
- Call-to-action sections

### 5. **Reusable Components** (`assets/js/components.js`)

```javascript
Components.createHeader()              // Navigation header
Components.createFooter()              // Site footer
Components.createHeroSection()         // Hero banner
Components.createChannelCard()         // Channel display
Components.createProgramItem()         // Program card
Components.createArticleCard()         // News article card
Components.createAnnouncement()        // Ticker announcement
Components.createComment()             // Comment display
```

### 6. **Utility Functions** (`assets/js/utils.js`)

```javascript
Utils.fetchData(url)                   // Load JSON with error handling
Utils.formatTime(time24)               // Convert 24h to 12h format
Utils.formatDate(dateString)           // Format dates
Utils.formatRelativeTime(timestamp)    // "2 hours ago" format
Utils.isProgramLive(start, end)        // Check if program is live
Utils.getTimeUntil(startTime)          // Time until next program
Utils.createElement(tag, attrs)        // Create HTML elements
Utils.showNotification(msg, type)      // Toast messages
```

## 📊 Data Structures

### channels.json

```json
{
  "channels": [
    {
      "id": "main",
      "name": "CAPD Main Channel",
      "number": 1,
      "description": "Main live broadcast and news",
      "streamUrl": "https://stream-server.com/live/main",
      "poster": "assets/images/channel-main.jpg",
      "status": "live",
      "viewers": 1250
    }
  ]
}
```

### schedule.json

```json
{
  "schedule": [
    {
      "id": "prog-001",
      "channelId": "main",
      "title": "Morning News Brief",
      "startTime": "06:00",
      "endTime": "06:30",
      "duration": 30,
      "description": "Daily morning news summary",
      "host": "John Okafor",
      "image": "assets/images/prog-001.jpg"
    }
  ]
}
```

### announcements.json

```json
{
  "announcements": [
    {
      "id": "ann-001",
      "type": "breaking",
      "title": "BREAKING: Road Project 95% Complete",
      "content": "The major road...",
      "timestamp": "2025-11-23T10:30:00Z",
      "priority": "high",
      "expiresAt": "2025-11-24T10:30:00Z",
      "icon": "alert"
    }
  ]
}
```

### articles.json

```json
{
  "articles": [
    {
      "id": "art-001",
      "title": "Article Title",
      "description": "Short description",
      "image": "assets/images/article.jpg",
      "date": "2025-11-23",
      "author": "John Doe",
      "category": "Infrastructure",
      "featured": true,
      "content": "<p>Full HTML content...</p>"
    }
  ]
}
```

## 🚀 Setup & Configuration

### 1. Configure Streaming URLs

Edit `data/channels.json` and update the `streamUrl` for each channel:

```json
"streamUrl": "https://your-streaming-server.com/live/channel-name"
```

Supported formats:
- HLS: `https://server.com/path/stream.m3u8`
- RTMP: `rtmp://server.com/app/stream`

### 2. Add Your Content

#### Add Channels
Edit `data/channels.json` to add/modify channels with proper stream URLs

#### Add Programs
Edit `data/schedule.json` to add programs with:
- Channel ID (must match a channel in channels.json)
- Start/end times in HH:MM format
- Host names and descriptions

#### Add News Articles
Edit `data/articles.json` to add news with:
- Categories for filtering
- Author information
- HTML content for rich formatting

#### Add Announcements
Edit `data/announcements.json` to add breaking news/alerts

### 3. Update Images

Place images in `assets/images/` folder:
- Channel posters: `channel-*.jpg`
- Program images: `prog-*.jpg`
- Article images: `article-*.jpg`
- Favicon: `favicon.ico`

## 🎨 Styling

### Tailwind CSS
- CDN-based for rapid development
- Responsive breakpoints: `md:`, `lg:`, etc.
- Dark theme by default

### Custom CSS Features
- Smooth animations (slideIn, pulse, etc.)
- News ticker scrolling
- Video aspect ratios (16:9, 1:1)
- Gallery lightbox
- Chat styling

### Color Scheme
- Primary Red: `#dc2626`
- Dark Background: `#111827` (gray-900)
- Accent Gray: `#1f2937` (gray-800)
- Text: `#ffffff` (white)

## 🔄 Workflow

### Adding a New Channel

1. Add to `data/channels.json`:
```json
{
  "id": "unique-id",
  "name": "Channel Name",
  "number": 6,
  "streamUrl": "https://streaming-server/live/stream-key",
  "status": "live"
}
```

2. Add channel image to `assets/images/channel-unique-id.jpg`

3. Add programs to `data/schedule.json` with `channelId: "unique-id"`

### Adding a Program

1. Edit `data/schedule.json` and add:
```json
{
  "id": "prog-XXX",
  "channelId": "main",
  "title": "Program Name",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "host": "Host Name",
  "image": "assets/images/prog-XXX.jpg"
}
```

2. Upload program image to `assets/images/`

### Publishing News

1. Edit `data/articles.json` and add:
```json
{
  "id": "art-XXX",
  "title": "Article Title",
  "category": "News Category",
  "author": "Author Name",
  "content": "<p>HTML content...</p>"
}
```

2. Upload article image to `assets/images/`

### Broadcasting Announcements

1. Edit `data/announcements.json` and add:
```json
{
  "id": "ann-XXX",
  "title": "Breaking News Title",
  "content": "Announcement text",
  "priority": "high",
  "expiresAt": "2025-12-31T23:59:00Z"
}
```

## 📱 Responsive Design

All pages are fully responsive with breakpoints:

- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)

Key responsive features:
- Grid layouts adapt column count
- Navigation collapses on mobile
- Video players scale proportionally
- Chat sidebar moves below on mobile

## 🔐 Security Considerations

- All data is static JSON (no database injection risks)
- No user authentication required (public platform)
- Content Security Policy ready for implementation
- User-generated content (chat) not persistent

## 📈 Performance

- **Static hosting**: GitHub Pages (instant CDN)
- **Lazy loading**: Images load on demand
- **No build step**: Deploy directly from repo
- **Minimal dependencies**: Only Tailwind CDN
- **Caching**: Browser cache + GitHub Pages CDN

## 🐛 Troubleshooting

### Channel not loading
- Check `streamUrl` in `data/channels.json`
- Verify streaming server is running
- Test URL in browser directly

### Images not showing
- Check file path in JSON matches actual file
- Ensure images are in `assets/images/` folder
- Verify file format (jpg, png)

### Program not appearing
- Check `channelId` matches a channel
- Verify times in HH:MM format
- Check time is in 24-hour format

### Chat not working
- Clear browser cache
- Check browser console for errors
- Ensure JavaScript is enabled

## 🔄 Deployment

### GitHub Pages Automatic Deployment

1. Push changes to `main` branch
2. GitHub Actions automatically deploys
3. Site updates at `https://username.github.io/CAPD`

### Local Testing

```bash
# Start a local server
python -m http.server 8000

# Visit http://localhost:8000
```

## 📝 Content Management

### Best Practices

1. **Program Naming**: Use clear, descriptive titles
2. **Images**: Use 16:9 aspect ratio for programs/channels
3. **Times**: Use 24-hour format (06:00, 14:30, etc)
4. **Categories**: Keep consistent across articles
5. **Scheduling**: Avoid overlapping programs on same channel

### Backup Strategy

- Maintain Git history for all changes
- Back up JSON files regularly
- Test changes locally before pushing
- Keep image assets organized

## 🚀 Future Enhancements

Potential improvements:
- [ ] Database integration for persistent comments
- [ ] User authentication and profiles
- [ ] Advanced analytics and viewership tracking
- [ ] Mobile app (React Native)
- [ ] Backend API for dynamic content
- [ ] Live stream bitrate switching
- [ ] Recording/VOD support
- [ ] Multi-language support
- [ ] Advanced moderation tools
- [ ] Monetization features

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review JSON file syntax
3. Test in different browsers
4. Check browser console for errors

## 📄 License

© 2025 CAPD Communications. All rights reserved.

---

**Last Updated**: November 23, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
