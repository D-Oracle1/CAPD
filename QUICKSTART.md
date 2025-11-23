# CAPD Digital TV - Quick Start Guide

Get your digital TV platform live in 5 minutes!

## 🚀 Quick Setup (5 minutes)

### Step 1: Configure Your Streaming URLs (2 min)

Edit `data/channels.json` and update the `streamUrl` for each channel:

```json
{
  "id": "main",
  "name": "CAPD Main Channel",
  "streamUrl": "https://your-streaming-server.com/live/main",  // ← UPDATE THIS
  "status": "live"
}
```

**Where to get your stream URL?**
- **RTMP Server**: `rtmp://your-server.com/app/stream-key`
- **HLS Server**: `https://your-server.com/streams/channel.m3u8`
- **YouTube Live**: Convert embed URL to streaming URL
- **Twitch**: Get RTMP ingest URL from dashboard

### Step 2: Add Channel Images (1 min)

Create folder: `assets/images/`

Add these images:
- `channel-main.jpg` (1920x1080 recommended)
- `channel-news.jpg`
- `channel-community.jpg`
- `channel-education.jpg`
- `channel-culture.jpg`

### Step 3: Customize Your Data (1 min)

Edit these files with your content:

**`data/channels.json`**
```json
{
  "id": "main",
  "name": "Your Channel Name",
  "number": 1,
  "description": "Your channel description",
  "streamUrl": "your-stream-url-here",
  "status": "live",
  "viewers": 0
}
```

**`data/schedule.json`** - Add your programs
**`data/articles.json`** - Add your news
**`data/announcements.json`** - Add announcements

### Step 4: Test Locally (30 sec)

```bash
cd /path/to/CAPD
python -m http.server 8000
```

Visit: http://localhost:8000

### Step 5: Deploy (30 sec)

```bash
git add .
git commit -m "Configure CAPD Digital TV"
git push origin main
```

Done! ✅

---

## 🎯 Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Homepage** | `index.html` | Main hub with featured content |
| **Live Stream** | `live.html` | Watch TV with channel switching |
| **Schedule** | `schedule.html` | View program guide |
| **News** | `news.html` | Read articles and updates |

---

## 📝 Adding Content

### Add a New Channel

1. Edit `data/channels.json`
2. Add new object to `channels` array:

```json
{
  "id": "sports",
  "name": "Sports Channel",
  "number": 6,
  "description": "Local sports and events",
  "streamUrl": "https://your-server.com/live/sports",
  "poster": "assets/images/channel-sports.jpg",
  "status": "live",
  "viewers": 350
}
```

3. Add image: `assets/images/channel-sports.jpg`
4. Add programs with `"channelId": "sports"` to `data/schedule.json`

### Add a Program

Edit `data/schedule.json`:

```json
{
  "id": "prog-100",
  "channelId": "main",
  "title": "Your Show Name",
  "startTime": "09:00",
  "endTime": "10:00",
  "duration": 60,
  "description": "Show description",
  "host": "Host Name",
  "image": "assets/images/prog-100.jpg"
}
```

Time format: 24-hour (09:00, 14:30, 22:45)

### Publish News

Edit `data/articles.json`:

```json
{
  "id": "art-100",
  "title": "Your Article Title",
  "description": "Short summary",
  "image": "assets/images/art-100.jpg",
  "date": "2025-11-23",
  "author": "Your Name",
  "category": "Your Category",
  "featured": true,
  "content": "<p>Your article HTML content here...</p>"
}
```

### Post Announcement

Edit `data/announcements.json`:

```json
{
  "id": "ann-100",
  "type": "breaking",
  "title": "Breaking News Title",
  "content": "Announcement content",
  "timestamp": "2025-11-23T14:30:00Z",
  "priority": "high",
  "expiresAt": "2025-11-24T14:30:00Z",
  "icon": "alert"
}
```

---

## 🎨 Customization

### Change Colors

Edit `assets/css/styles.css` and update CSS variables:

```css
:root {
  --primary-red: #dc2626;      /* Main brand color */
  --dark-bg: #111827;          /* Dark background */
  --white: #ffffff;            /* Text color */
}
```

### Change Logo/Branding

Update navigation header in `assets/js/components.js`:
```javascript
<h1 class="text-2xl font-bold">Your Organization Name</h1>
```

### Change Footer

Edit `assets/js/components.js` - `createFooter()` function:
```javascript
<p>&copy; 2025 Your Organization Name. All rights reserved.</p>
```

---

## 🔧 Troubleshooting

### Video Not Playing?
- Check `streamUrl` is correct and accessible
- Verify streaming server is running
- Check browser console for errors (F12)
- Test stream URL directly in VLC player

### Images Not Showing?
- Check file path in JSON matches actual filename
- Ensure image is in `assets/images/` folder
- Verify file format (jpg, png, webp)
- Clear browser cache (Ctrl+Shift+Delete)

### Program Not Appearing?
- Check `channelId` exists in `channels.json`
- Verify times in 24-hour format (06:00)
- Check JSON syntax is valid
- Use online JSON validator: jsonlint.com

### Chat/Comments Not Working?
- Enable JavaScript in browser
- Clear browser cache
- Check console for errors
- Try different browser

---

## 📚 Important File Formats

### Time Format
Always use 24-hour format:
- `06:00` = 6:00 AM
- `14:30` = 2:30 PM
- `22:45` = 10:45 PM

### Date Format
Use ISO format:
- `2025-11-23` = November 23, 2025

### Timestamp Format
Use ISO 8601 with Z for UTC:
- `2025-11-23T14:30:00Z`

### JSON Syntax
```json
{
  "key": "value",
  "number": 123,
  "boolean": true,
  "array": [1, 2, 3],
  "nested": { "key": "value" }
}
```

---

## 🌐 Deployment Options

### GitHub Pages (Recommended)
1. Push to GitHub
2. Enable Pages in Settings → Pages
3. Site available at: `https://username.github.io/CAPD`
4. **Automatic updates** on every push!

### Other Hosting
- Netlify (drag & drop)
- Vercel (Git integration)
- AWS S3 (static hosting)
- Any web server

---

## 📊 Before You Go Live

**Checklist:**

- [ ] Stream URLs configured for all channels
- [ ] Channel images uploaded
- [ ] Programs scheduled
- [ ] News articles published
- [ ] Announcements created
- [ ] Tested locally
- [ ] Tested on mobile device
- [ ] Domain configured (optional)
- [ ] Shared with community

---

## 🎬 Common Use Cases

### Daily News Broadcast
1. Schedule morning news program at 6:00 AM
2. Update schedule in `data/schedule.json`
3. Post breaking news in announcements
4. Publish article in news section

### Community Event
1. Add special event to schedule
2. Start live stream 10 minutes before
3. Post announcement
4. Engage in live chat

### Educational Program
1. Add to education channel
2. Schedule in advance
3. Post related articles
4. Save stream URL for replay

---

## 💡 Tips & Tricks

### Make Announcements Stand Out
- Use `"priority": "high"` for important announcements
- Use `"type": "breaking"` for breaking news
- Set short expiration time to auto-hide

### Feature Important Content
- Set `"featured": true` on key articles
- Pin important programs
- Use announcements for urgent updates

### Mobile Optimization
- Test all pages on phone
- Check video player works
- Verify chat is accessible
- Test navigation menus

### Keep It Fresh
- Update schedule weekly
- Publish news regularly
- Refresh announcements daily
- Update viewer counts

---

## 🆘 Get Help

1. **Check README.md** - Complete documentation
2. **Check PLATFORM_SUMMARY.md** - Feature overview
3. **Check your JSON** - Use jsonlint.com to validate
4. **Check browser console** - Press F12 for errors
5. **Test streaming URL** - Use VLC player

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Configure streams | 5 min |
| Add images | 5 min |
| Set up channels | 10 min |
| Add programs | 15 min |
| Publish articles | 10 min |
| Test locally | 5 min |
| Deploy | 2 min |
| **Total** | **~50 min** |

---

## 🎉 You're Ready!

Your CAPD Digital TV platform is now live and broadcasting to your community!

**Next actions:**
1. Start streaming content
2. Share URLs with community
3. Monitor engagement
4. Keep content updated
5. Gather feedback

---

**Questions?** Check README.md for complete documentation.

**Ready to launch?** You've got everything you need! 🚀
