# CAPD Streaming Troubleshooting & Optimization Guide

Complete troubleshooting solutions and optimization techniques for professional streaming.

---

## Table of Contents

1. [Connection Issues](#connection-issues)
2. [Audio Problems](#audio-problems)
3. [Video Quality Issues](#video-quality-issues)
4. [Performance Problems](#performance-problems)
5. [Platform-Specific Issues](#platform-specific-issues)
6. [Optimization Tips](#optimization-tips)
7. [Advanced Diagnostics](#advanced-diagnostics)
8. [Error Messages](#error-messages)

---

## Connection Issues

### Problem: Can't Connect to Streaming Server

#### Symptoms
- "Failed to connect" error in OBS
- Stream won't start
- Connection times out
- No error message (hangs)

#### Step 1: Check Internet Connection

**Test Your Connection:**

```bash
# Test internet speed (Windows PowerShell)
Invoke-WebRequest https://www.speedtest.net -OutFile speedtest.exe
```

**Or use online tool:**
- Go to [speedtest.net](https://speedtest.net)
- Upload speed should be >5 Mbps
- If <5 Mbps, try:
  - Close background apps
  - Restart router
  - Move closer to router
  - Use Ethernet instead of WiFi

#### Step 2: Verify Stream Key

**YouTube:**
1. Go to Creator Studio
2. Click **Live Streaming**
3. Select your event
4. Copy the **Stream Key**
5. Paste into OBS exactly (no spaces)

**Twitch:**
1. Go to Settings → Channel
2. Find **Primary Stream Key**
3. Copy it
4. Paste into OBS (check for spaces)

**Common Mistake:** Extra spaces in key

**Fix:**
```
❌ WRONG: "abc123def 456ghi"
✅ RIGHT: "abc123def456ghi"
```

#### Step 3: Check Firewall/Router

**Windows Firewall:**
1. Windows Security
2. Firewall & Network Protection
3. Allow app through firewall
4. Find OBS Studio
5. Enable both "Private" and "Public"
6. Click "OK"

**Router Firewall:**
1. Log into router (192.168.1.1)
2. Find firewall settings
3. Allow ports:
   - 1935 (RTMP)
   - 443 (HTTPS)
   - 80 (HTTP)
4. Save and restart router

#### Step 4: Test Connection

**In OBS:**
1. File → Settings → Stream
2. Click **Test Stream**
3. Should show "Stream is working!"
4. If not, proceed to next step

#### Step 5: Try Different Server

**YouTube:**
- Server: `rtmps://a.rtmp.youtube.com/live2`

**Twitch:**
- Server: `rtmp://live-iad.twitch.tv/app`

**Custom:**
- Try different geographic server
- Example: `rtmp://primary.example.com:1935/live`

---

### Problem: Disconnects During Stream

#### Symptoms
- Stream was working, then stopped
- "Connection lost" message
- Stream goes offline unexpectedly
- Reconnects automatically then fails again

#### Solution 1: Network Stability

**Check:**
1. Is WiFi dropping signal?
   - Look at WiFi bars on computer
   - Check router lights
   - Walk closer to router

2. Other devices using bandwidth?
   - Pause YouTube on other devices
   - Stop downloads
   - Pause cloud backups
   - Disable automatic updates

**Fix:**
1. Use Ethernet cable (more stable)
2. Restart router
3. Change WiFi channel (less congestion)
4. Move router to central location

#### Solution 2: ISP Issue

**Check:**
1. Call ISP - ask about line quality
2. Check for outages in area
3. Ask about upload speed limits
4. Verify connection type (fiber, cable, DSL)

**Workaround:**
1. Have mobile hotspot ready as backup
2. Use 4G/5G connection if WiFi fails
3. Switch to backup internet mid-stream

#### Solution 3: OBS Settings

**Lower Stream Bitrate:**
1. File → Settings → Output
2. Reduce bitrate to 2500 kbps
3. Test with lower rate first

**Increase Buffer:**
1. File → Settings → Advanced
2. Increase buffer (if available)
3. Save and test

**Adjust Output:**
1. File → Settings → Output
2. Output Mode: Advanced
3. Check "Network Optimized Encoding"
4. Save and test

---

## Audio Problems

### Problem: No Audio in Stream

#### Symptoms
- Video showing but no sound
- Viewer can't hear you
- OBS shows audio levels active
- But stream is silent

#### Step 1: Check Microphone Connection

**Physical Check:**
- [ ] Microphone plugged in?
- [ ] Cable fully inserted?
- [ ] No loose connections?
- [ ] Microphone powered on (if USB)?
- [ ] Battery working (if wireless)?

**Try:**
1. Disconnect microphone
2. Reconnect firmly
3. Try different USB port
4. Restart computer

#### Step 2: Enable Audio in Windows

**Check Audio:**
1. Right-click speaker icon (taskbar)
2. Click **Sound Settings**
3. Check under "Input devices"
4. Your microphone should list
5. Test microphone (record voice, play back)

**If Microphone Missing:**
1. Right-click speaker icon
2. Click **Sound Devices and Volumes**
3. Click **Device Properties** on your microphone
4. Enable "Full duplex"

#### Step 3: Enable Audio in OBS

**Check OBS Audio:**
1. Open OBS
2. Look at **Audio Mixer** (bottom)
3. Your microphone should list
4. Drag slider - levels should move
5. If not, audio source missing

**Add Audio Source:**
1. Right-click in **Mixer**
2. Click **Add/Manage Sources**
3. Click **+** button
4. Select **Audio Input Capture**
5. Choose your microphone
6. Click **Create New**

#### Step 4: Verify Audio Settings

**In OBS:**
1. File → Settings → Audio
2. Sample Rate: 44.1 kHz (or 48 kHz)
3. Channels: Stereo
4. Devices:
   - Desktop Audio: Default
   - Mic/Auxiliary Audio: Your microphone
5. Click OK

#### Step 5: Test Audio Stream

**YouTube:**
1. Go to Creator Studio
2. Select your event
3. Under **Monitor Stream** you should see audio levels moving
4. If not, audio not reaching platform

**Twitch:**
1. Start test stream in OBS
2. On Twitch, view your stream
3. Should hear audio
4. If not, check audio configuration

---

### Problem: Audio Too Quiet

#### Symptoms
- Audio barely audible
- Viewers asking to increase volume
- Audio levels very low in OBS mixer

#### Solution 1: Increase Microphone Level

**In OBS Mixer:**
1. Look at **Mic/Aux Audio** channel
2. Drag slider to right (increase volume)
3. Should be around -6 to -3 dB (yellow level)
4. Not going into red (peaking)

**Safe Levels:**
```
🟢 Green (-30 to -10)  = Too quiet
🟡 Yellow (-6 to -3)   = Good (speak normally)
🔴 Red (>0)            = Too loud (avoid peaking)
```

#### Solution 2: Microphone Settings

**Boost Microphone in Windows:**
1. Right-click speaker icon
2. Click **Sound Settings**
3. Find your microphone
4. Click **Device Properties**
5. Click **Additional device properties**
6. Levels tab
7. Increase **Microphone Boost** to +20dB
8. Click OK

#### Solution 3: Increase System Volume

1. Click speaker icon (taskbar)
2. Drag Master Volume to higher level
3. OBS will capture louder audio

#### Solution 4: Better Microphone Placement

1. Hold microphone 6 inches from mouth
2. Speak directly into microphone
3. Not from side
4. Avoid microphone too close (pops)

---

### Problem: Audio Distorted or Clipping

#### Symptoms
- Audio sounds harsh or scratchy
- Peaks in red constantly
- Audio is "cracking" or "popping"
- Microphone sounds awful

#### Solution 1: Lower Input Levels

**In OBS Mixer:**
1. Look at **Mic/Aux** channel
2. Drag slider LEFT to reduce
3. Aim for -6 to -3 dB (yellow)
4. Not in red zone
5. Test by speaking normally

#### Solution 2: Use Noise Gate

**In OBS:**
1. Right-click **Mic/Aux** in mixer
2. Click **Filters**
3. Click **+** button
4. Add **Noise Gate**
5. Set **Open Threshold:** -50 dB
6. Set **Close Threshold:** -60 dB
7. Test

#### Solution 3: Check Microphone

1. Is microphone damaged?
2. Try different microphone
3. Test in Audacity (free recording software)
4. If distorted there, microphone problem
5. If clean there, OBS settings issue

#### Solution 4: Increase Distance

1. Move microphone 8-10 inches away
2. Speak toward (not shouting)
3. Reduces harsh tones
4. More natural sound
5. Lower chance of clipping

---

## Video Quality Issues

### Problem: Blurry or Pixelated Video

#### Symptoms
- Video looks blocky or blurry
- Especially when there's motion
- Text is hard to read
- Quality seems low overall

#### Solution 1: Check Bitrate

**Increase Bitrate:**
1. File → Settings → Output
2. Video Bitrate: Try 5000 kbps (up from 4000)
3. Make sure upload speed supports it (>8 Mbps)
4. Test quality
5. If still pixelated, increase to 6000 kbps

**Bitrate Guide:**
- 2000 kbps = Acceptable (480p)
- 3000 kbps = Good (720p)
- 4000 kbps = Better (720p)
- 5000 kbps = Excellent (720p)
- 6000+ kbps = Premium (1080p)

#### Solution 2: Increase Resolution

**Upgrade Resolution:**
1. File → Settings → Video
2. Base Canvas: Try 1920x1080 (1080p)
3. Output: Try 1920x1080
4. Make sure bitrate is 5000+ kbps
5. Test streaming quality

#### Solution 3: Check Encoder

**Upgrade Encoder:**
1. File → Settings → Output
2. Encoder: Change to **NVIDIA NVENC** (if available)
3. Or **Intel QuickSync** (if available)
4. These are faster than CPU (x264)

#### Solution 4: Check Internet Speed

1. Go to [speedtest.net](https://speedtest.net)
2. Check **Upload Speed**
3. If <5 Mbps:
   - Close background apps
   - Restart router
   - Move closer to WiFi
   - Use Ethernet cable
4. If consistently <3 Mbps, reduce bitrate

---

### Problem: Video Freezes or Stutters

#### Symptoms
- Video pauses/freezes
- Motion is jerky
- Playback stutters
- Smooth then freezes randomly

#### Solution 1: Lower Frame Rate

**Reduce FPS:**
1. File → Settings → Video
2. Common FPS Values: 30 (or change to 24)
3. Click OK
4. Test stream quality
5. Smoother at lower FPS

**FPS vs Quality:**
- 60 FPS = Smooth but more bitrate needed
- 30 FPS = Standard, smooth, balanced
- 24 FPS = Smooth for static content

#### Solution 2: Lower Resolution

**Reduce to 720p:**
1. File → Settings → Video
2. Base Canvas: 1280x720
3. Output: 1280x720
4. Bitrate: 3500 kbps
5. Test - usually smooth now

#### Solution 3: Close Background Apps

**Free Up CPU:**
1. Press Ctrl+Shift+Esc (Task Manager)
2. Look for resource hogs:
   - Chrome (many tabs)
   - Antivirus scans
   - Windows updates
   - Cloud syncs (OneDrive, Google Drive)
3. Close unnecessary apps
4. Restart computer if still slow

#### Solution 4: Check CPU Usage

**In OBS Stats:**
1. View → Stats (bottom-left)
2. Look for "CPU Usage"
3. If >80%, something's wrong
4. Restart computer
5. Close all other apps
6. Try again

---

## Performance Problems

### Problem: High CPU Usage (>80%)

#### Symptoms
- OBS Stats shows CPU > 80%
- Computer fans running loud
- System sluggish
- Video stuttering

#### Quick Fixes

**Immediate:**
1. Close Chrome browser (huge CPU hog)
2. Close Discord, Slack, Teams
3. Pause cloud syncs (OneDrive, Google Drive)
4. Disable Windows updates
5. Restart computer

**Encoding:**
1. File → Settings → Output
2. Encoder: Change to hardware (NVIDIA NVENC, Intel QuickSync)
3. Can reduce CPU to 20-30%

**Resolution:**
1. File → Settings → Video
2. Lower to 1280x720
3. Or even 854x480
4. Reduces CPU load significantly

**FPS:**
1. Reduce FPS to 24
2. Instead of 30
3. Saves ~20% CPU

#### Complete CPU Optimization

**Step 1: Hardware Acceleration**
- If you have NVIDIA graphics: Use NVENC
- If you have Intel: Use QuickSync
- These offload from CPU to GPU

**Step 2: Reduce Quality Settings**
```
Before: 1920x1080, 60 FPS, 6000 kbps = CPU 85% ❌
After:  1280x720, 30 FPS, 4000 kbps = CPU 35% ✅
```

**Step 3: Clean Computer**
1. Delete old recordings
2. Clear temp files
3. Defrag hard drive
4. Update drivers (graphics, audio)
5. Remove unused programs

---

### Problem: Dropped Frames

#### Symptoms
- OBS shows "X dropped frames"
- Stream quality degrading
- Short freezes in stream
- Viewers experiencing buffering

#### Severity Guide

| Dropped | Status | Action |
|---------|--------|--------|
| 0-2 | Perfect | Nothing needed |
| 2-5 | Good | Monitor |
| 5-20 | Concerning | Lower bitrate |
| 20-50 | Bad | Significant changes |
| >50 | Critical | Stop stream |

#### Solution 1: Lower Bitrate

**Current Issues:**
```
Bitrate: 6000 kbps
Upload: 10 Mbps
Dropped: 47 frames
= Too high bitrate for connection
```

**Fix:**
```
Step 1: Reduce to 4000 kbps
Step 2: Stream 10 minutes
Step 3: Check dropped frames
Result: Should drop significantly
```

#### Solution 2: Stabilize Connection

**Check WiFi:**
1. Move closer to router
2. Use 5GHz band (if available)
3. Keep phone/tablets from router
4. Restart router
5. Or use Ethernet cable

**Test Connection:**
1. [speedtest.net](https://speedtest.net)
2. Run multiple tests
3. Check consistency
4. If varies greatly, WiFi is unstable

#### Solution 3: Reduce Video Quality

**Lower Resolution:**
1. 1280x720 instead of 1920x1080
2. Fixes many frame drops

**Lower FPS:**
1. 24 FPS instead of 30
2. Slightly less smooth but stable

**Combine Both:**
1. 854x480 @ 24 FPS
2. Uses minimal resources
3. Good for consistent streaming

---

## Platform-Specific Issues

### YouTube Issues

#### Stream Won't Go Live

**Symptoms:**
- Stream created but won't start
- Status shows "offline"
- Can't find stream on YouTube

**Solution:**

1. **Check Account Status**
   - Must have YouTube channel for at least 24 hours
   - Must have verified email
   - Must have no recent violations

2. **Check Event Settings**
   - Creator Studio → Live Streaming
   - Event must show "Ready to stream"
   - Not "Ended" or "Scheduled"

3. **Check Stream Key**
   - Copy **Stream Key** exactly
   - Paste into OBS
   - No spaces before or after
   - Check for typos

4. **Refresh YouTube**
   - Refresh browser (F5)
   - Close and reopen Creator Studio
   - Wait 30 seconds then refresh again

#### YouTube Chat Not Working

**Check:**
1. Chat must be enabled in stream settings
2. Not in "Member-only chat"
3. Age 18+ to enable chat
4. Check browser privacy settings
5. Clear cookies and try different browser

#### Video Doesn't Archive

**Solution:**
1. Creator Studio → Live Streaming
2. Click **Settings**
3. Ensure "Save broadcast as video" is enabled
4. Wait 15 minutes after stream ends
5. Video appears in uploads

---

### Twitch Issues

#### Stream Goes Offline

**Check:**
1. Stream Key might have changed
2. Verify current key in Settings → Channel
3. Copy correct key
4. Paste into OBS
5. Restart OBS stream

#### Low Bitrate Warning

**Twitch Shows Warning:**
- Reduces quality automatically
- Upload speed too low
- Check [speedtest.net](https://speedtest.net)
- If <3 Mbps, reduce OBS bitrate to 2000 kbps

#### VOD Issues

**VOD Won't Save:**
1. Verify channel verified
2. Check VOD storage enabled
3. Wait 24 hours for processing
4. If still missing, contact Twitch support

---

## Optimization Tips

### Optimize for 720p Quality

**Recommended Settings:**
```
Base Canvas:     1280x720
Output Scale:    1280x720
Bitrate:         4000-5000 kbps
FPS:             30
Encoder:         x264 (or hardware if available)
Preset:          Fast or Medium
Profile:         Main
```

### Optimize for 1080p Quality

**Recommended Settings:**
```
Base Canvas:     1920x1080
Output Scale:    1920x1080
Bitrate:         6000-8000 kbps
FPS:             30
Encoder:         Hardware preferred (NVENC/QuickSync)
Preset:          Fast (if hardware)
Profile:         High
```

### Optimize for Low Bandwidth

**Recommended Settings:**
```
Base Canvas:     854x480
Output Scale:    854x480
Bitrate:         1500-2000 kbps
FPS:             24
Encoder:         x264
Preset:          Very Fast
Profile:         Main
```

### Optimize for High CPU Usage

**Recommended Settings:**
```
Use Hardware Encoder (NVIDIA NVENC or Intel QuickSync)
Resolution:      1280x720
Bitrate:         3000-4000 kbps
FPS:             30
Close background apps
```

---

## Advanced Diagnostics

### Network Diagnostics

**Run Network Speed Test:**

Windows Command Prompt:
```
# Test download speed
bitsadmin /create "Test" && bitsadmin /resume "Test" && timeout 10 && bitsadmin /complete "Test"

# Check connection quality
ping 8.8.8.8 -n 100
# Look for packet loss (should be 0%)
# Look for avg time (<30ms is good)
```

**Or use online tools:**
- [speedtest.net](https://speedtest.net) - Full test
- [fast.com](https://fast.com) - Quick download test
- [testmy.net](https://testmy.net) - Detailed metrics

### Check Stream Logs

**In OBS:**
1. Help → Log Files
2. Look for recent log
3. Open with Notepad
4. Search for "error" or "fail"
5. Google the error message

### Test Different Settings

**Create Test Profiles:**

OBS → File → Profiles:
1. Create "Test 720p 30fps"
2. Test for 15 minutes
3. Record results
4. Create "Test 480p 24fps"
5. Compare quality vs performance

### Monitor System Resources

**Use Windows Performance Monitor:**
1. Type "Performance Monitor"
2. Add counter:
   - CPU usage
   - Disk usage
   - Memory usage
   - Network usage
3. Monitor while streaming
4. Identify bottleneck

---

## Error Messages

### "Stream Key Rejected"

**Cause:** Wrong stream key

**Fix:**
1. Get correct key from YouTube/Twitch
2. Copy exactly
3. Paste into OBS
4. No spaces at beginning/end
5. Restart OBS

### "Connection Timed Out"

**Cause:** Server unreachable

**Fix:**
1. Check internet connection
2. Try different server
3. Check firewall (allow port 1935)
4. Restart OBS
5. Check if service is down

### "Network Adaptation Failed"

**Cause:** Bitrate too high for connection

**Fix:**
1. Lower bitrate (try 3000 kbps)
2. Reduce resolution to 720p
3. Check internet speed
4. Close other apps using internet
5. Switch to Ethernet

### "Encoder Error - Encode Failed"

**Cause:** Encoding problem

**Fix:**
1. Close OBS completely
2. Restart computer
3. Change encoder (x264 to Hardware)
4. Lower resolution/bitrate
5. Update graphics drivers

### "Insufficient Permissions"

**Cause:** YouTube/Twitch permission issue

**Fix:**
1. YouTube: Verify email address
2. Twitch: Check account verified
3. Check account age (YouTube needs 24h)
4. Re-authenticate in OBS
5. Contact platform support if persistent

---

## Quick Diagnostic Flowchart

```
Stream Won't Start?
├─ Check Internet Connection
│  └─ <5 Mbps?
│     └─ Close apps, restart router
├─ Verify Stream Key
│  └─ Wrong key?
│     └─ Copy again from YouTube/Twitch
├─ Check Firewall
│  └─ Blocked?
│     └─ Allow OBS through firewall
└─ Still failing?
   └─ Try different platform
```

```
Stream Stops During Broadcast?
├─ Check Internet Stability
│  └─ Dropping signal?
│     └─ Use Ethernet cable
├─ Lower Bitrate
│  └─ Try 3000-4000 kbps
├─ Reduce Resolution
│  └─ Try 720p
└─ Get Backup Internet
   └─ Mobile hotspot ready?
```

```
Poor Video Quality?
├─ Check Bitrate
│  └─ <3000 kbps?
│     └─ Increase to 4000
├─ Check Resolution
│  └─ 480p?
│     └─ Upgrade to 720p
├─ Check FPS
│  └─ 24 fps?
│     └─ Try 30 fps
└─ Check CPU Usage
   └─ >80%?
      └─ Use Hardware encoder
```

---

## Getting Help

**For OBS Issues:**
- Website: [obsproject.com](https://obsproject.com)
- Discord: [discord.gg/obsproject](https://discord.gg/obsproject)
- Manual: [obsproject.com/wiki](https://obsproject.com/wiki)

**For YouTube Issues:**
- Help Center: [support.google.com/youtube](https://support.google.com/youtube)
- Phone: 1-888-346-3966

**For Twitch Issues:**
- Help Center: [twitch.tv/help](https://twitch.tv/help)
- Discord: Twitch Developer Community

**For CAPD Issues:**
- Email: admin@capd.ng
- Phone: +234 801 234 5678

---

**Version:** 1.0
**Created:** November 24, 2025
**Status:** Complete & Ready

When troubleshooting, work through solutions systematically from simplest to most complex. Good luck with your streams! 🎬
