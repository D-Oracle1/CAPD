# Google Drive MP4 Streaming Guide

## Overview

CAPD now supports direct streaming of videos from Google Drive for MP4 streams. This is perfect for hosting large video files that exceed your database storage limitations. Google Drive provides unlimited storage for video files and seamless streaming capabilities.

## Why Google Drive MP4 Streaming?

✅ **Unlimited Storage** - Google Drive accounts come with generous storage quotas (15GB free, or more with Google Workspace)
✅ **Large File Support** - Stream videos larger than 5GB without database storage concerns
✅ **Easy Management** - Organize videos in folders, share securely
✅ **Reliable Playback** - Direct streaming with adaptive bitrate
✅ **Free Solution** - No additional costs for hosting

## How to Use Google Drive MP4 Streaming

### Step 1: Upload Video to Google Drive

1. Go to [Google Drive](https://drive.google.com)
2. Click **"+ New"** → **"File upload"** or drag-and-drop your MP4 video
3. Wait for the upload to complete
4. Once uploaded, right-click the file and select **"Share"**

### Step 2: Configure Sharing Settings

1. In the sharing dialog, click **"Change"** next to "Restricted"
2. Select **"Anyone with the link"**
3. Make sure the permission is set to **"Viewer"** (read-only)
4. Click **"Share"** and copy the sharing link

The sharing link will look like:
```
https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7/view?usp=sharing
```

### Step 3: Add Channel to CAPD Admin Panel

1. Go to **Admin Panel** → **Channels** section
2. Click **"+ Add Channel"** button
3. Fill in the channel details:
   - **Channel Name**: Name of your channel (e.g., "Movie Night")
   - **Channel Number**: Unique number for the channel
   - **Description**: Brief description of the channel
   - **Stream Type**: Select **"🎥 MP4 Video"** from the dropdown

### Step 4: Add Google Drive Video URL

With Stream Type set to **"MP4 Video"**:

1. You'll see **"MP4 Mode"** options:
   - Select **"External URL (Cloud/Direct Link)"** radio button
   - You'll see instructions for Google Drive

2. In the **"Stream URL"** field, paste your Google Drive sharing link:
   ```
   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   ```

3. The system will **automatically convert** the URL to a direct playable format
4. You'll see a confirmation: "✅ Google Drive URL automatically converted!"

### Step 5: Configure Channel Settings

1. **Status**: Set to "live" or "offline"
2. **Thumbnail** (Optional): Upload a custom thumbnail for the channel
3. Click **"Save Channel"** button

That's it! The channel is now ready to stream.

## How It Works Behind the Scenes

### URL Conversion Process

The system automatically converts Google Drive sharing links to direct playable URLs:

**Input URL:**
```
https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7/view?usp=sharing
```

**Converted URL:**
```
https://drive.google.com/uc?export=view&id=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
```

This direct URL allows seamless playback in the TV page video player without requiring users to navigate through Google Drive.

### Supported Google Drive URL Formats

The system supports multiple Google Drive URL formats:

1. **Standard Sharing Link:**
   ```
   https://drive.google.com/file/d/{FILE_ID}/view
   https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
   ```

2. **Short URL Format:**
   ```
   https://drive.google.com/open?id={FILE_ID}
   ```

All formats are automatically detected and converted for optimal playback.

## Streaming on TV Page

Once configured, your Google Drive MP4 channels will appear in the **TV page**:

1. Visit the **Digital TV** page
2. Your channels will be listed with thumbnails
3. Click any channel to start streaming
4. The video will play directly in the browser

### Features Available:
- ⏯️ Play/Pause controls
- 🔊 Volume control
- 📺 Fullscreen mode
- 💾 Video quality selection (if supported by Google Drive)
- ❤️ Like/Comment/Share (viewer engagement features)
- 📊 View count tracking

## Best Practices

### Video Preparation
- **Format**: MP4 with H.264 video codec and AAC audio codec for best compatibility
- **Resolution**: 720p to 1080p recommended for streaming
- **Bitrate**: 2-5 Mbps for good quality at reasonable bandwidth
- **File Size**: No limit with Google Drive (stream files up to 100GB+)

### Sharing and Security
✅ **DO**:
- Use "Anyone with the link" for sharing (requires the link, not searchable)
- Set permission to "Viewer" only (prevents accidental modifications)
- Keep backups of important videos

❌ **DON'T**:
- Use "Public on the web" (makes video searchable on Google)
- Share direct Google Drive links with unauthorized users
- Modify original files after streaming (may cause playback issues)

### Organization
- Create a dedicated folder in Google Drive for streaming videos
- Use descriptive file names for easy management
- Add descriptions to videos for reference
- Keep a spreadsheet of channel names and their corresponding File IDs

## Troubleshooting

### Video Won't Play

**Issue**: "Failed to load Google Drive video"

**Solutions**:
1. Verify the file is shared with **"Anyone with the link"**
2. Confirm the file is a valid MP4 video file
3. Check your internet connection
4. Try refreshing the page
5. Clear browser cache and cookies

**Admin Panel Check**:
```
1. Go to Channels section
2. Edit the channel
3. Verify the Google Drive URL in Stream URL field
4. Check browser console (F12) for error messages
```

### Playback Issues

**Issue**: Video starts but stops/stutters

**Solutions**:
1. Check your internet bandwidth (minimum 1 Mbps for streaming)
2. Google Drive may throttle bandwidth for very large files
3. Try pausing and resuming playback
4. Close other bandwidth-heavy applications
5. Try a different browser (Chrome, Firefox, Safari)

### File Size Issues

**Issue**: Want to stream very large files (100GB+)

**Solutions**:
- Google Drive supports files larger than 100GB
- For very large files (>20GB), you may experience slower initial buffering
- Splitting content into separate videos is recommended for user experience
- Consider using HLS streaming for better performance with large files

## Advanced: Manual URL Conversion

If automatic conversion doesn't work, you can manually convert the URL:

1. **Extract File ID** from your Google Drive link:
   ```
   From: https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7/view
   Extract: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
   ```

2. **Create Direct URL**:
   ```
   https://drive.google.com/uc?export=view&id=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7
   ```

3. **Paste** the direct URL in the Stream URL field

## API Endpoint Information

### Google Drive Stream Endpoint

The system includes a dedicated Google Drive streaming endpoint:

```
GET /api/gdrive/stream?url={encoded_url}
```

**Features**:
- Automatic URL conversion
- CORS header support
- Proxy streaming for better compatibility
- Error handling with detailed messages

### Example Request:
```javascript
fetch('/api/gdrive/stream?url=' + encodeURIComponent('https://drive.google.com/file/d/FILE_ID/view'))
  .then(response => response.blob())
  .then(blob => {
    // Use blob for video playback
  });
```

## Limitations and Known Issues

⚠️ **Bandwidth Throttling**: Google Drive may throttle bandwidth for very large downloads. For files >5GB, expect slower initial buffering.

⚠️ **Playback Compatibility**: Some older browsers may not support direct Google Drive playback. Use modern browsers (Chrome, Firefox, Safari, Edge).

⚠️ **File Sharing**: File must remain shared for streaming to work. If you unshare the file, playback will stop.

⚠️ **Rate Limiting**: Google Drive has rate limits for accessing files. If many users stream simultaneously, you may experience throttling.

## Comparison: MP4 vs Other Streaming Types

| Feature | MP4 (Google Drive) | YouTube | RTMP | HLS |
|---------|------------------|---------|------|-----|
| Setup Difficulty | Easy | Easy | Medium | Hard |
| File Size Limit | Unlimited | Unlimited | No limit | No limit |
| Live Streaming | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| Cloud Storage | ✅ Google Drive | ✅ YouTube | ❌ Local/Server | ❌ Local/Server |
| Bitrate Adaptive | ⚠️ Limited | ✅ Full | ✅ Full | ✅ Full |
| Initial Buffering | Fast | Fast | Medium | Medium |
| Viewer Engagement | ✅ Yes | ✅ Full | ✅ Basic | ✅ Basic |

## Getting Help

### Common Questions

**Q: How many people can watch a Google Drive stream simultaneously?**
A: Google Drive's bandwidth throttling typically supports 50-200 concurrent viewers. For larger audiences, consider HLS streaming.

**Q: Can I download videos from Google Drive streams?**
A: The video player's download functionality depends on browser settings. Users cannot bypass sharing restrictions.

**Q: What's the maximum file size?**
A: Google Drive supports files up to 100GB (standard) or more (with Google Workspace). CAPD supports all sizes.

**Q: Can I stream live from Google Drive?**
A: No, Google Drive MP4 streaming is for pre-recorded videos only. Use YouTube or RTMP for live streaming.

### Support Resources

- Check browser console (F12) for detailed error messages
- Review the [Troubleshooting](#troubleshooting) section above
- Verify Google Drive sharing settings
- Test with a small test video first
- Check internet connection and bandwidth

## Updates and Improvements

### Version 1.0 Features
✅ Google Drive URL auto-detection and conversion
✅ Direct MP4 playback support
✅ Automatic sharing link parsing
✅ Error handling with user-friendly messages
✅ Dedicated API endpoint for streaming
✅ Thumbnail support for channels
✅ Full integration with TV page

### Future Enhancements (Planned)
- 📈 Streaming statistics and analytics
- 🎯 Multiple quality variants support
- 📝 Transcoding service integration
- 🔐 Enhanced security features
- 🌍 Multi-region CDN support

## Summary

Google Drive MP4 streaming provides an easy, free way to host large video files without database storage limitations. The system automatically handles URL conversion and playback, making it simple for both administrators and viewers.

**Quick Start**:
1. Upload MP4 to Google Drive
2. Share with "Anyone with the link"
3. Add channel in CAPD Admin → Channels
4. Select "MP4 Video" stream type
5. Paste Google Drive link
6. Save and enjoy!

For more questions or issues, refer to the [Troubleshooting](#troubleshooting) section or check the admin panel documentation.
