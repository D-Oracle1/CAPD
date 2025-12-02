# Admin Passcode Settings - Complete Debugging Guide

## ✅ What Was Fixed

1. **Improved Error Messages** - Now shows clear success/error messages
2. **Better Status Display** - Larger, more visible status message area
3. **Console Logging** - Better debugging info in browser console
4. **Error Details** - Actual error messages displayed to admin

---

## 🚀 Quick Start

### Step 1: Start Your Server
```bash
npm run both
```

Make sure you see:
```
✅ Express server running on http://localhost:5001
```

### Step 2: Login to Admin Panel
- URL: `http://localhost:5001/admin/index.html`
- Username: `admin`
- Password: `capd2025`

### Step 3: Go to Settings
- Click the **⚙️ Settings** icon in the sidebar

### Step 4: Update Passcode
1. Check the box: "Enable passcode protection"
2. Enter a new passcode (minimum 4 characters)
   - Example: `1234` or `mypass2025`
3. Click **💾 Save Passcode Settings**

### Expected Results

#### ✅ Success Message (Green)
```
✅ Settings saved successfully!
🔒 Passcode protection is now ENABLED
```

#### ❌ Error Messages
If you see an error, check:

| Error | Cause | Fix |
|-------|-------|-----|
| `⚠️ Please enter a passcode` | No passcode typed | Enter a passcode value |
| `⚠️ Passcode must be at least 4 characters` | Too short | Use 4+ characters |
| `❌ Error: Failed to fetch` | Server not running | Run `npm run both` |
| `❌ Error: Cannot POST /api/passcode/settings` | Wrong endpoint | Check server logs |

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
1. Open DevTools: **F12** or **Ctrl+Shift+I**
2. Go to **Console** tab
3. Try saving passcode settings
4. Look for messages like:
   ```
   🔐 Saving passcode settings: {enabled: true, passcodeLength: 4}
   📡 Sending request to: http://localhost:5001/api/passcode/settings
   📥 Response status: 200 OK
   ✅ Success response: {success: true, message: "Passcode settings updated"}
   ```

### Step 2: Check Server Logs
In your terminal where you ran `npm run both`, look for:
```
✅ Passcode settings updated - Enabled: true
```

### Step 3: Verify Settings Saved
1. Open: `C:\Users\Tech Oracle\Documents\GitHub\CAPD\data\settings.json`
2. You should see:
```json
{
  "passcode": {
    "enabled": true,
    "code": "your_new_passcode",
    "lastUpdated": "2025-12-02T..."
  }
}
```

### Step 4: Test Passcode Protection
1. Go to: `http://localhost:5001/tv.html`
2. You should see the passcode modal
3. Enter the passcode you just set
4. Page should unlock

---

## 🛠️ Common Issues & Fixes

### Issue: No Response Message
**Symptoms:** Click button but nothing happens

**Fix:**
1. Check browser console (F12)
2. Check server is running (`npm run both`)
3. Clear browser cache: **Ctrl+Shift+Delete**
4. Reload admin page: **Ctrl+R**

### Issue: "Failed to fetch" Error
**Symptoms:** Message says "Error: Failed to fetch"

**Fix:**
1. Make sure server is running:
   ```bash
   npm run both
   ```
2. Check if port 5001 is in use:
   ```bash
   netstat -ano | findstr :5001
   ```
3. If port is used, kill the process and restart

### Issue: "Error: Cannot POST /api/passcode/settings"
**Symptoms:** 404 error message

**Fix:**
1. Check server.js has the endpoint (should be around line 238)
2. Restart server: `npm run both`
3. Check server logs show `POST /api/passcode/settings`

### Issue: Settings Save But Don't Apply Site-Wide
**Symptoms:** Can save settings but passcode modal doesn't appear

**Fix:**
1. Hard refresh all pages: **Ctrl+Shift+R**
2. Check `data/settings.json` was updated
3. Check browser console for passcode loading errors
4. Restart server

---

## 📋 API Endpoint Reference

### Check Passcode Status
```bash
curl http://localhost:5001/api/passcode
```

**Response:**
```json
{
  "enabled": true,
  "timestamp": "2025-12-02T10:30:00.000Z"
}
```

### Verify a Passcode
```bash
curl -X POST http://localhost:5001/api/passcode/verify \
  -H "Content-Type: application/json" \
  -d '{"passcode": "1234"}'
```

**Response (Success):**
```json
{
  "verified": true
}
```

**Response (Failed):**
```json
{
  "verified": false
}
```

### Update Passcode Settings
```bash
curl -X POST http://localhost:5001/api/passcode/settings \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "passcode": "1234"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Passcode settings updated"
}
```

---

## 🧪 Testing Checklist

- [ ] Can login to admin panel (`/admin/index.html`)
- [ ] Can navigate to Settings section
- [ ] Can toggle "Enable passcode protection" checkbox
- [ ] Can type passcode in input field
- [ ] Click save button shows "💾 Saving..." message
- [ ] Success message appears (green): "✅ Settings saved successfully!"
- [ ] Server logs show: `✅ Passcode settings updated`
- [ ] `data/settings.json` updated with new passcode
- [ ] Visit `http://localhost:5001/tv.html` shows passcode modal
- [ ] Modal requires correct passcode to proceed
- [ ] Incorrect passcode shows error
- [ ] Correct passcode unlocks page

---

## 📞 Still Having Issues?

1. **Check browser console** (F12) - most helpful
2. **Check server logs** - shows backend errors
3. **Verify settings.json** - see what was actually saved
4. **Restart everything**:
   ```bash
   # Kill server
   npm run both  (press Ctrl+C)

   # Clear cache & restart
   npm run both
   ```

---

## 🎯 Success Signs

When everything works, you should see:

✅ **In Admin Panel:**
```
✅ Settings saved successfully!
🔒 Passcode protection is now ENABLED
```

✅ **In Browser Console:**
```
🔐 Saving passcode settings: {enabled: true, passcodeLength: 4}
📡 Sending request to: http://localhost:5001/api/passcode/settings
📥 Response status: 200 OK
✅ Success response: {success: true, message: "Passcode settings updated"}
```

✅ **In Server Terminal:**
```
✅ Passcode settings updated - Enabled: true
```

✅ **On Public Pages:**
- Visiting any page (tv.html, index.html, etc.) shows passcode modal
- Modal requires correct passcode
- Once entered, can navigate between pages freely

---

**Last Updated:** December 2, 2025
**Version:** 1.1 (With Enhanced Debugging)
