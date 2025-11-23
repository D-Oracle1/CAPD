# CAPD Live Stream Monitoring & Management Tools

Complete guide to monitoring, managing, and maintaining live streams on your CAPD Digital TV platform.

---

## Table of Contents

1. [Monitoring Dashboard](#monitoring-dashboard)
2. [Stream Health Metrics](#stream-health-metrics)
3. [Performance Tracking](#performance-tracking)
4. [Viewer Analytics](#viewer-analytics)
5. [Quality Assurance](#quality-assurance)
6. [Real-time Alerts](#real-time-alerts)
7. [Automation & Scheduling](#automation--scheduling)
8. [Emergency Procedures](#emergency-procedures)
9. [Maintenance Schedule](#maintenance-schedule)

---

## Monitoring Dashboard

### Overview Panel

The monitoring dashboard provides real-time visibility into all active streams:

```
┌─────────────────────────────────────────────────┐
│           LIVE STREAM STATUS                    │
├─────────────────────────────────────────────────┤
│  CAPD Main Channel       │ 🟢 LIVE             │
│  Viewers: 1,245          │ Bitrate: 4.2 Mbps   │
│  Duration: 1h 23m        │ FPS: 30              │
│  Status: Excellent       │ Health: ✅ 99%      │
└─────────────────────────────────────────────────┘
```

### Access Monitoring Tools

#### 1. OBS Built-in Monitoring

**Live Stats Display:**
1. Open OBS
2. Click **View** → **Stats**
3. Monitor in bottom-left corner:
   - **FPS:** Frames per second (should be 30)
   - **CPU Usage:** Encoding load (keep <80%)
   - **Bitrate:** Current upload speed
   - **Dropped Frames:** Dropped packets

**Live Monitor:**
1. Click **View** → **Dock** → **Stats**
2. Creates persistent monitoring panel
3. Real-time metrics display

#### 2. YouTube Analytics

**Real-time Dashboard:**
1. Go to [youtube.com/creator_studio](https://youtube.com/creator_studio)
2. Select your event
3. View live metrics:
   - Current viewers
   - Peak viewers
   - Concurrent viewers graph
   - Watch time
   - Likes and comments
   - Engagement rate

**Steps:**
1. Click **Analytics**
2. Select **Real-time** tab
3. Monitor while streaming
4. Track metrics every 5-10 minutes

#### 3. Twitch Dashboard

**Creator Dashboard Metrics:**
1. Go to [dashboard.twitch.tv](https://dashboard.twitch.tv)
2. Select channel
3. Monitor:
   - Live viewers count
   - Peak viewers
   - Average viewer time
   - Chat activity
   - Engagement metrics

**Steps:**
1. Log in to Twitch
2. Click **Creator Dashboard** (top right)
3. View live stats
4. Watch chat for audience engagement

#### 4. Custom Server Monitoring

**Nginx RTMP Stats:**
1. Go to `http://your-domain.com/stat`
2. Shows:
   - Active connections
   - Incoming streams
   - Connected clients
   - Bitrate information

**Command Line Monitoring:**
```bash
# Monitor Nginx processes
ps aux | grep nginx

# Check active connections
netstat -an | grep 1935

# Monitor bandwidth usage
iftop -i eth0

# Real-time server stats
htop
```

---

## Stream Health Metrics

### Key Metrics to Monitor

#### 1. Bitrate Health

| Metric | Excellent | Good | Fair | Poor |
|--------|-----------|------|------|------|
| Bitrate | 3500-6000 kbps | 2500-3500 kbps | 1500-2500 kbps | <1500 kbps |
| Consistency | Stable ±50 | Stable ±100 | Fluctuates ±200 | Highly variable |
| Target | ✅ Best quality | ✅ Good quality | ⚠️ Acceptable | ❌ Poor quality |

**Check OBS:**
1. View Stats (bottom-left)
2. Look for "Output: Bitrate"
3. Should match your configured setting

#### 2. FPS (Frames Per Second)

| FPS | Quality | Use Case |
|-----|---------|----------|
| 60 fps | Excellent | Action, sports, fast motion |
| 30 fps | Good | News, talk shows, standard |
| 24 fps | Acceptable | Minimal movement content |
| <24 fps | Poor | Not recommended |

**Monitor in OBS:**
1. Stats panel shows "Rendering: X FPS"
2. Should match your output setting
3. Dropped frames below video input count is acceptable

#### 3. Dropped Frames

**Interpretation:**
- **0 dropped:** Perfect connection ✅
- **<5 dropped:** Excellent 🟢
- **5-20 dropped:** Good 🟡
- **>20 dropped:** Poor 🔴

**Solutions:**
- Lower bitrate
- Reduce resolution
- Close background apps
- Check internet connection
- Use wired connection

#### 4. Encoding CPU Usage

| Usage | Status | Action |
|-------|--------|--------|
| <30% | Excellent | All good |
| 30-50% | Good | Monitor |
| 50-80% | High | Be cautious |
| >80% | Critical | Lower settings |

**In OBS:**
- Stats show "CPU Usage: X%"
- Close other applications if too high

---

## Performance Tracking

### Create Monitoring Log

**Daily Stream Log Template:**

```
Stream Date: 2025-11-24
Start Time: 14:00
End Time: 16:30
Duration: 2h 30m

TECHNICAL METRICS:
- Average Viewers: 845
- Peak Viewers: 1,240
- Bitrate: 4000 kbps (stable)
- FPS: 30 (consistent)
- Dropped Frames: 2
- CPU Usage: 45%
- Encoding Time: 38ms

QUALITY ISSUES:
- None observed ✅

ENGAGEMENT:
- Comments: 127
- Likes: 456
- Shares: 23
- Super Chat: 5

NOTES:
- Stream quality excellent throughout
- No connectivity issues
- Good audience engagement

IMPROVEMENTS FOR NEXT:
- Add intro music (5m transition)
- Better camera angle for segment 2
- Prepare graphics in advance
```

### Performance Graph

Track metrics over time:

```
Viewer Count Over Time:
     │      ╱╲
 1200│     ╱  ╲     ╱─╲
 1000│    ╱    ╲   ╱   ╲
  800│   ╱      ╲ ╱     ╲___
  600│  ╱        ╲╱
  400│_╱________________
     └──────────────────
      0h  30m  1h  1.5h 2h
```

### Performance Checklist

**Before Stream:**
- [ ] Test stream (5-10 min)
- [ ] Check internet speed (upload >5 Mbps)
- [ ] Verify bitrate settings
- [ ] Check CPU usage
- [ ] Test audio/video quality
- [ ] Close background apps
- [ ] Have backup internet ready

**During Stream:**
- [ ] Monitor viewer count
- [ ] Watch for dropped frames
- [ ] Check bitrate stability
- [ ] Monitor CPU usage
- [ ] Engage with audience
- [ ] Watch for technical issues
- [ ] Keep time accurate

**After Stream:**
- [ ] Review analytics
- [ ] Document metrics
- [ ] Save recording
- [ ] Post summary
- [ ] Respond to comments
- [ ] Note improvements

---

## Viewer Analytics

### YouTube Analytics

**Access:**
1. Go to Creator Studio
2. Click **Analytics**
3. View detailed reports

**Key Metrics:**
- **Watch Time:** Total minutes watched
- **Concurrent Viewers:** How many watching at same time
- **Peak Viewers:** Maximum concurrent viewers
- **Average View Duration:** Average time per viewer
- **Audience Retention:** Graph showing when people leave
- **Engagement:** Likes, comments, shares
- **New Subscribers:** New followers from stream

**Analyze Retention:**
1. Look at "Audience Retention" graph
2. Identify drops (when viewers leave)
3. Note what was happening at drop
4. Improve that segment for next stream

**Example Retention Analysis:**
```
100% ──────────╲
     │         │╲
 80% │         │ ╲___
     │         │     ╲
 60% │────────────────╲__
     │ Intro  Problem   Recovery
```

### Twitch Analytics

**Access:**
1. Creator Dashboard
2. Click **Analytics**

**Key Metrics:**
- **Peak Viewers:** Max concurrent viewers
- **Average Viewers:** Average throughout stream
- **Watch Time:** Total hours watched
- **Followers:** New followers
- **Chat Activity:** Messages per minute

**Track Growth:**
- Compare week-to-week
- Note what content works
- Identify trending topics
- Plan similar content

### Custom Analytics Tracking

**Manual Tracking:**

Create spreadsheet:

| Date | Start | End | Duration | Viewers | Peak | Bitrate | FPS | Issues | Notes |
|------|-------|-----|----------|---------|------|---------|-----|--------|-------|
| 11/24 | 14:00 | 16:30 | 2h 30m | 845 | 1,240 | 4000 | 30 | None | Good quality |

**Analysis:**
- Track trends over time
- Identify best performing times
- Note technical issues
- Document improvements

---

## Quality Assurance

### Video Quality Testing

#### Resolution & Bitrate Check

**Test Process:**

1. **720p @ 30fps with 4000 kbps:**
   - Should be sharp and clear
   - Minimal pixelation
   - Smooth motion
   - No buffering

2. **Test on Multiple Devices:**
   - Desktop (Chrome, Firefox)
   - Mobile (iOS, Android)
   - Tablet
   - Smart TV

3. **Network Conditions:**
   - Test on good WiFi
   - Test on mobile 4G
   - Test on poor WiFi
   - Note minimum acceptable quality

#### Audio Quality Testing

**Checklist:**
- [ ] Audio at correct level (not too loud)
- [ ] No background noise
- [ ] No distortion/clipping
- [ ] Microphone working
- [ ] No echo/feedback
- [ ] Music/effects clear
- [ ] Guest audio audible

**Test Audio:**
1. Have someone watch stream
2. Ask if audio is clear
3. Test different sources
4. Adjust levels if needed

#### Visual Quality Testing

**Check:**
- Camera focus is sharp
- Lighting is adequate
- Colors are accurate
- Screen share is readable
- Text is legible
- No red/green/blue tinting
- Frame rate smooth (no jitter)

### Quality Standards Checklist

**Professional Quality:**
- ✅ 1080p @ 30fps (if available)
- ✅ Bitrate 5000+ kbps
- ✅ Sharp, clear video
- ✅ Good lighting
- ✅ Clean audio
- ✅ No dropped frames
- ✅ Smooth transitions

**Good Quality:**
- ✅ 720p @ 30fps
- ✅ Bitrate 3500-4000 kbps
- ✅ Clear video
- ✅ Adequate lighting
- ✅ Clear audio
- ✅ Minimal dropped frames

**Minimum Acceptable:**
- ⚠️ 480p @ 30fps
- ⚠️ Bitrate 2000-2500 kbps
- ⚠️ Recognizable video
- ⚠️ Audible audio
- ⚠️ <5 dropped frames

---

## Real-time Alerts

### Alert Setup

#### OBS Alerts

**Enable Notifications:**
1. **File** → **Settings**
2. **General** tab
3. Enable:
   - "Warn when stopping stream"
   - "Confirm on exit"
   - "Automatically record streams"

**Monitor Stats:**
1. Keep stats visible
2. Watch for:
   - Dropped frames >5
   - Bitrate drops
   - CPU spikes >80%

#### YouTube Alerts

Set up notifications:
1. Creator Studio → Settings
2. Enable email alerts:
   - Comments on streams
   - New subscribers
   - Super Chat
   - Stream issues

#### Twitch Alerts

Creator Dashboard:
1. Settings → Notifications
2. Enable alerts for:
   - New followers
   - New subscribers
   - Chat mentions
   - Connection issues

### Alert Response Guide

#### When Bitrate Drops

**Action:**
1. Check internet speed test
2. Close bandwidth-heavy apps
3. Lower bitrate in OBS (try 3000 kbps)
4. Reduce resolution to 720p
5. Move closer to router
6. If problem persists, announce brief technical pause

#### When Frames Drop

**Action:**
1. Check CPU usage in OBS
2. Close background applications
3. Reduce output resolution
4. Lower FPS to 24
5. Restart OBS if necessary
6. Inform audience of brief pause

#### When Connection Fails

**Action:**
1. Check internet connection
2. Restart router
3. Switch to mobile hotspot (have backup ready)
4. Reconnect to streaming server
5. Post announcement about interruption

#### When Audio Issues Occur

**Action:**
1. Check microphone connection
2. Unmute in OBS
3. Adjust audio levels
4. Switch to backup microphone
5. Use system audio if available

---

## Automation & Scheduling

### Automatic Stream Scheduling

#### YouTube Scheduled Streams

**Setup:**
1. Creator Studio → Live Streaming
2. Click **Create**
3. Set **Schedule for** (future date/time)
4. Configure details
5. YouTube handles promotion

**Advantages:**
- YouTube notifies subscribers
- Pre-show page appears
- Automated countdown
- Queue viewers before stream

#### Twitch Scheduled Streams

**Setup:**
1. Creator Dashboard → Create
2. Select **Stream**
3. Set **Start time**
4. Add title & description
5. Twitch schedules on channel

#### OBS Automatic Recording

**Setup:**
1. **File** → **Settings**
2. **Output** tab
3. **Recording** section
4. Enable **Auto-start recording**
5. Choose save location

**Result:**
- Recording starts automatically when you go live
- Stops when you stop streaming
- Saved automatically for archival

### Pre-Stream Automation

**Create OBS Profile for Each Show:**

1. **File** → **Profiles**
2. Click **New**
3. Name it: "News Broadcast"
4. Configure:
   - Sources (cameras, graphics)
   - Scenes (opening, main, closing)
   - Audio levels
   - Bitrate settings

**Replicate across streams:**
- News Broadcast profile
- Educational Content profile
- Entertainment profile
- Emergency broadcast profile

### Announcement Automation

**Post Live Announcements:**

Admin Panel → Announcements → + Add Announcement

```
TITLE: 📺 LIVE NOW: Main News Broadcast
TYPE: Breaking
CONTENT: Join us for live news and updates.
         Streaming on YouTube, Twitch, and CAPD TV.
PRIORITY: High
EXPIRES IN: 4 (hours)
```

---

## Emergency Procedures

### Stream Failure Recovery

#### Step 1: Identify Issue

**Check:**
- Internet connection status
- OBS connection indicator
- Server status page
- Error messages in OBS

#### Step 2: Assess Severity

- **Minor:** Audio/video glitch → Continue
- **Moderate:** Dropped connection → Reconnect (1-2 min)
- **Major:** Complete failure → Switch to backup

#### Step 3: Implement Fix

**If reconnecting:**
```
1. Stop streaming in OBS
2. Wait 5 seconds
3. Click "Start Streaming"
4. Wait for reconnection
5. Check stream on platform
```

**If switching to backup:**
```
1. Have backup OBS instance running
2. Alternate streaming account ready
3. Switch RTMP key in CAPD admin
4. Go live on backup platform
5. Post announcement: "Brief technical interruption.
                       Now streaming on alternate channel"
```

### Platform Outage Response

#### YouTube Down

**Action:**
1. Switch to Twitch as primary
2. Post on social media: "YouTube temporarily unavailable,
                          watch live on Twitch at..."
3. Update CAPD to show Twitch stream
4. Continue streaming to Twitch
5. Archive on YouTube when available

#### Twitch Down

**Action:**
1. Switch to YouTube
2. Direct audience to YouTube
3. Continue normal broadcast
4. Save VOD to Twitch when available

### Internet Failure Protocol

**Stage 1: Connection Drops (0-30 seconds)**
- Continue streaming if buffering
- Don't announce yet
- Monitor connection

**Stage 2: Persistent Issues (30-60 seconds)**
- Announce: "Brief technical interruption"
- Check connection
- Attempt reconnect

**Stage 3: Complete Failure (>60 seconds)**
- Stop stream
- Switch to backup internet (mobile hotspot)
- Post announcement: "Stream interrupted due to
                      technical issues. Reconnecting..."
- Go live on backup

**Stage 4: Unable to Recover**
- Post: "Today's broadcast postponed to [time].
         We apologize for the interruption."
- Reschedule to later time
- Notify audience via all channels

---

## Maintenance Schedule

### Daily Tasks

**Before Each Stream:**
- [ ] Test internet speed (should be >5 Mbps upload)
- [ ] Test microphone
- [ ] Test camera
- [ ] Check OBS settings
- [ ] Update program title
- [ ] Post announcement
- [ ] Have backup plan

**After Each Stream:**
- [ ] Stop recording
- [ ] Export video
- [ ] Post summary announcement
- [ ] Review analytics
- [ ] Respond to comments
- [ ] Document any issues
- [ ] Plan next stream

### Weekly Tasks

**Every Sunday:**
- [ ] Review weekly analytics
- [ ] Analyze viewer trends
- [ ] Review dropped frames
- [ ] Check technical issues
- [ ] Plan next week's content
- [ ] Update schedule
- [ ] Back up recordings

**Quality Check:**
- [ ] Test audio quality
- [ ] Test video quality
- [ ] Check microphone levels
- [ ] Verify lighting
- [ ] Test on mobile
- [ ] Review captions/graphics

### Monthly Tasks

**1st of Month:**
- [ ] Full system backup
- [ ] Review monthly metrics
- [ ] Compare month-to-month growth
- [ ] Update equipment inventory
- [ ] Check licensing/subscriptions
- [ ] Security audit
- [ ] Plan content calendar

**Technical Maintenance:**
- [ ] Update OBS software
- [ ] Update drivers (graphics, audio)
- [ ] Clean computer
- [ ] Check for malware
- [ ] Verify firewall rules
- [ ] Review error logs

### Quarterly Tasks

**Every 3 Months:**
- [ ] Hardware inspection
- [ ] Microphone calibration
- [ ] Camera testing
- [ ] Network review
- [ ] Security update
- [ ] Archive old recordings
- [ ] Plan quarter content

**Growth Analysis:**
- [ ] Compare quarters
- [ ] Identify best content
- [ ] Plan improvements
- [ ] Budget review
- [ ] Equipment upgrade assessment
- [ ] Training needs

### Annual Tasks

**Every 12 Months:**
- [ ] Full audit of system
- [ ] License renewal check
- [ ] Equipment replacement assessment
- [ ] Comprehensive backup
- [ ] Annual report preparation
- [ ] Strategic planning
- [ ] Team evaluation

---

## Monitoring Tools Setup

### Free Tools

**YouTube Analytics:**
- Built-in, free
- Real-time metrics
- Audience retention
- Engagement tracking

**Twitch Analytics:**
- Built-in, free
- Viewer trends
- Follower growth
- Watch time tracking

**OBS Stats:**
- Built-in, free
- CPU usage
- FPS, bitrate
- Dropped frames

### Paid Alternatives

**StreamYard:**
- Multi-platform streaming
- Analytics dashboard
- Guest management
- $20-29/month

**Restream:**
- Stream to 30+ platforms
- Analytics
- Chat moderation
- Free + $20-50/month

**VDO.AI:**
- Advanced analytics
- Viewer behavior
- Optimization suggestions
- $99+/month

---

## Quick Reference

### Monitor Checklist During Stream

Every 5-10 minutes:
- [ ] Check viewer count
- [ ] Monitor bitrate (should be stable)
- [ ] Check CPU usage (<80%)
- [ ] Verify FPS (should be 30)
- [ ] Look for dropped frames
- [ ] Check audio levels
- [ ] Engage with chat
- [ ] Verify video quality

### Common Metrics & Targets

| Metric | Target | Check |
|--------|--------|-------|
| Bitrate | 4000 kbps | OBS Stats |
| FPS | 30 fps | OBS Stats |
| Resolution | 720p | OBS Settings |
| Dropped Frames | <5 | OBS Stats |
| CPU Usage | <70% | OBS Stats |
| Viewers | Monitor | Platform |
| Engagement | >100 comments | Platform |
| Audio Level | -6 to -3 dB | OBS Mixer |

### Emergency Contacts

**Technical Support:**
- OBS: discord.gg/obs
- YouTube: support.google.com
- Twitch: twitch.tv/help
- CAPD: admin@capd.ng

---

**Version:** 1.0
**Created:** November 24, 2025
**Status:** Complete & Ready

Your streams are now fully monitored and managed! 🎬📊
