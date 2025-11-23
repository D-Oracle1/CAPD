# CAPD Content Management System - Complete Guide

## Overview

CAPD now features a professional Content Management System (CMS) that allows administrators to manage all website content without technical knowledge. The CMS provides an intuitive admin panel for managing news, channels, schedules, announcements, and more.

---

## Getting Started

### Access the Admin Panel

1. Navigate to: `https://yourdomain.com/admin/`
2. Or click "Admin" link in the website header

### Default Credentials

- **Username:** `admin`
- **Password:** `capd2025`

⚠️ **IMPORTANT:** Change these credentials immediately in production!

---

## Admin Dashboard Overview

### Main Sections

The admin dashboard has 6 main sections:

#### 1. **Dashboard Overview**
- View summary statistics
- Quick action buttons
- System information
- Total articles, channels, programs, and announcements

#### 2. **News & Articles**
- Create, edit, and delete news articles
- Manage article metadata (author, category, date)
- Support for rich HTML content
- Featured image management

#### 3. **Channels**
- Manage broadcasting channels
- Configure streaming URLs (HLS/RTMP)
- Set channel status (live/offline)
- Track viewer counts
- Support for up to 10+ channels

#### 4. **Schedule**
- Create TV program schedules
- Assign programs to channels
- Set time slots (24-hour format)
- Manage host information
- View all scheduled programs

#### 5. **Announcements**
- Post breaking news
- Create announcements with expiration dates
- Set priority levels
- Support for multiple announcement types

#### 6. **Settings**
- Export/Import data
- Clear cache
- Backup management
- System tools

---

## Detailed Management Guides

### Managing News & Articles

#### Add a New Article

1. Click "📰 News & Articles" in sidebar
2. Click "+ Add Article" button
3. Fill in the form:
   - **Title:** Article headline
   - **Author:** Your name or publication
   - **Category:** Infrastructure, Healthcare, Education, Community, Agriculture
   - **Date:** Publication date
   - **Description:** Short summary (1-2 sentences)
   - **Content:** Full article text (supports HTML)
   - **Featured Image:** URL to article image (optional)

4. Click "Save Article"

#### Edit an Article

1. Go to "News & Articles"
2. Find the article in the list
3. Click "Edit"
4. Modify the information
5. Click "Save Article"

#### Delete an Article

1. Go to "News & Articles"
2. Find the article
3. Click "Delete"
4. Confirm deletion

#### Content Tips

- **Title:** Keep under 100 characters
- **Description:** 50-150 characters for previews
- **Content:** Supports HTML for formatting
  ```html
  <p>Paragraph text</p>
  <strong>Bold text</strong>
  <em>Italic text</em>
  <h3>Subheading</h3>
  <ul>
    <li>List item 1</li>
    <li>List item 2</li>
  </ul>
  ```

---

### Managing Channels

#### Add a New Channel

1. Click "📡 Channels" in sidebar
2. Click "+ Add Channel" button
3. Fill in the form:
   - **Channel Name:** Full name (e.g., "CAPD Main Channel")
   - **Channel Number:** Numeric ID (1-10)
   - **Description:** Brief description
   - **Stream URL:** HLS or RTMP stream URL
   - **Status:** Live or Offline
   - **Viewers:** Current viewer count

4. Click "Save Channel"

#### Stream URL Examples

**YouTube Live:**
```
https://www.youtube.com/embed/STREAM_KEY
```

**Twitch:**
```
rtmp://live-iad.twitch.tv/app/STREAM_KEY
```

**OBS Studio:**
```
https://your-server.com/live/channel.m3u8
```

**Custom RTMP:**
```
rtmp://your-streaming-server.com/app/stream-name
```

#### Edit a Channel

1. Go to "Channels"
2. Find the channel card
3. Click "Edit"
4. Update information
5. Click "Save Channel"

#### Delete a Channel

1. Go to "Channels"
2. Find the channel
3. Click "Delete"
4. Confirm deletion

---

### Managing Program Schedule

#### Add a Program

1. Click "📅 Schedule" in sidebar
2. Click "+ Add Program" button
3. Fill in the form:
   - **Program Title:** Name of the program
   - **Channel:** Select from existing channels
   - **Start Time:** HH:MM format (24-hour)
   - **End Time:** HH:MM format (24-hour)
   - **Duration:** Length in minutes (auto-calculated)
   - **Description:** Program summary
   - **Host:** Name of the program host

4. Click "Save Program"

#### Time Format

- Use **24-hour format** (00:00 to 23:59)
- Examples:
  - 06:00 = 6:00 AM
  - 14:30 = 2:30 PM
  - 22:45 = 10:45 PM

#### Schedule Tips

- Avoid overlapping programs on the same channel
- Leave buffer time between programs
- Programs can be 30 minutes, 60 minutes, 90 minutes, etc.
- Host names help audience identify programs

#### View Schedule

1. Go to "Schedule"
2. All programs displayed in table format
3. Shows time, channel, host information
4. Edit or delete as needed

---

### Managing Announcements

#### Post an Announcement

1. Click "📢 Announcements" in sidebar
2. Click "+ Add Announcement" button
3. Fill in the form:
   - **Title:** Announcement headline
   - **Type:** Breaking, News, Event, or Update
   - **Content:** Announcement details
   - **Priority:** High, Medium, or Low
   - **Expires In:** Hours until auto-remove

4. Click "Post Announcement"

#### Announcement Types

| Type | Use Case | Icon |
|------|----------|------|
| **Breaking** | Urgent news | 🔴 |
| **News** | Regular updates | 📰 |
| **Event** | Upcoming events | 📅 |
| **Update** | General updates | 📢 |

#### Priority Levels

- **High:** Critical, appears first in ticker
- **Medium:** Important, normal priority
- **Low:** Informational, lowest priority

#### Auto-Expiration

- Set how many hours until announcement disappears
- Default: 24 hours
- Useful for time-sensitive announcements
- Past announcements automatically removed

---

## Data Management

### Export Your Data

#### Why Export?

- Backup all content
- Transfer to new system
- Archive records
- Data security

#### How to Export

1. Go to "Settings"
2. Click "⬇️ Export All Data"
3. Downloads JSON file with:
   - All articles
   - All channels
   - All programs
   - All announcements
   - Export timestamp

#### File Format

The exported file contains:
```json
{
  "articles": [...],
  "channels": [...],
  "schedule": [...],
  "announcements": [...],
  "exportedAt": "2025-11-23T..."
}
```

### Import Data

#### How to Import

1. Go to "Settings"
2. Click "⬆️ Import Data"
3. Select JSON file
4. Click "Import Data"
5. Data merged into system

#### Import Notes

- Overwrites existing data
- Backup first if you have important data
- File must be valid JSON format

### Clear Cache

- Removes all locally stored data
- Useful if experiencing issues
- Back up data first!

---

## Best Practices

### Content Management

1. **Regular Updates**
   - Add news at least weekly
   - Update announcements frequently
   - Keep programs current

2. **Quality Control**
   - Check spelling and grammar
   - Verify links and URLs
   - Test content before publishing

3. **Consistent Naming**
   - Use descriptive titles
   - Follow naming conventions
   - Use consistent categories

4. **Image Management**
   - Use descriptive file names
   - Keep consistent dimensions
   - Optimize file sizes

### Channel Management

1. **Stream URLs**
   - Test URLs before saving
   - Keep URLs up to date
   - Document any changes

2. **Live Status**
   - Update status when streaming
   - Mark offline when not broadcasting
   - Update viewer counts regularly

3. **Multiple Channels**
   - Assign numbers logically
   - Give clear descriptions
   - Organize by content type

### Schedule Management

1. **Program Planning**
   - Plan weekly or monthly
   - Avoid conflicts
   - Leave setup time between programs

2. **Host Information**
   - Always include host names
   - Update when hosts change
   - Add host descriptions

3. **Timing**
   - Double-check times
   - Account for time zones
   - Plan for technical setup

---

## Troubleshooting

### Can't Login

- Check username/password
- Clear browser cache
- Try different browser
- Check if admin panel is online

### Data Not Saving

- Check internet connection
- Verify form is completely filled
- Check browser console for errors
- Try exporting data first

### Changes Not Visible on Website

- Clear website cache
- Refresh the page
- Wait a few minutes for sync
- Check if using correct data folder

### Lost Data

- Check if backup file exists
- Use import to restore data
- Contact system administrator

---

## Security Best Practices

### Password Management

1. **Change Default Password**
   - First time logging in
   - Use strong, unique password
   - Never share credentials

2. **Account Access**
   - Only share with trusted admins
   - Log out when finished
   - Use different passwords per account

3. **Data Security**
   - Regular backups
   - Secure storage of backups
   - Limited admin access

### Browser Security

- Use HTTPS (encrypted)
- Don't save passwords
- Clear cookies periodically
- Use trusted devices only

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close forms |
| `Enter` | Submit forms |
| `Ctrl+S` | Save (in some forms) |
| `Ctrl+Z` | Undo (limited support) |

---

## Common Tasks

### Update News Article

```
Dashboard → News & Articles → Edit → Save
```

### Schedule a Program

```
Dashboard → Schedule → Add Program → Save
```

### Post Breaking News

```
Dashboard → Announcements → Add → Post
```

### Change Channel Status

```
Dashboard → Channels → Edit → Status → Save
```

### Export Backup

```
Dashboard → Settings → Export All Data
```

---

## Integration with Website

The CMS data automatically updates:

- **Homepage:** Latest news appears on landing page
- **News Page:** All articles available for reading
- **TV Page:** Channels and schedule display live
- **Announcements:** Ticker updates in real-time

---

## Technical Details

### Data Storage

- Data stored in browser's localStorage
- JSON format for compatibility
- No server required (static site)
- Regular backups recommended

### Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### File Limits

- JSON files: No hard limit
- Text content: Unlimited
- Articles: Recommend <1MB per article
- Total backup size: Depends on browser

---

## Getting Help

### Documentation

- Read this guide
- Check inline help text
- Review form labels

### Admin Panel Features

- Hover over fields for tooltips
- Error messages show what went wrong
- Success messages confirm actions

### Contact Support

- Email: admin@capd.ng
- Phone: +234 801 234 5678
- Hours: 24/7 support available

---

## Version Information

- **CMS Version:** 1.0
- **Created:** November 23, 2025
- **Last Updated:** November 23, 2025
- **Status:** Production Ready

---

## Next Steps

1. ✅ Access admin panel
2. ✅ Change default password
3. ✅ Add your content
4. ✅ Configure channels
5. ✅ Create program schedule
6. ✅ Post announcements
7. ✅ Regular backups
8. ✅ Monitor performance

---

**Thank you for using CAPD CMS!**

For more information, visit the main website or contact the support team.
