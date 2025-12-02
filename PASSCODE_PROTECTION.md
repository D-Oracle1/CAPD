# CAPD Sitewide Passcode Protection System

## Overview

The CAPD website now includes a **sitewide passcode protection system** that requires users to enter a passcode before accessing any page on the site. This ensures that shared links always require authentication before viewing any content.

## Features

- **Sitewide Protection**: Every page (index.html, landing.html, tv.html, news.html, etc.) requires passcode authentication
- **Beautiful Gratafy-Style Design**: Modern login interface with animated decorative circles and gradient background
- **Session Persistence**: Once verified in a session, users don't need to re-enter the passcode when navigating between pages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Secure Verification**: Passcodes are verified server-side through the `/api/passcode/verify` endpoint
- **Error Handling**: Clear, user-friendly error messages with automatic dismissal

## Architecture

### Files

1. **passcode-protection.js** - Core utility class handling all passcode logic
2. **passcode-modal.css** - Styling for the Gratafy-inspired modal design
3. **Per-page HTML** - Each page includes the modal HTML and handler functions

### How It Works

```
User visits any page
    ↓
passcode-protection.js initializes automatically
    ↓
Check sessionStorage for 'capd_passcode_verified'
    ↓
If NOT verified: Show passcode modal
    ↓
User enters passcode → Submit form
    ↓
handlePasscodeSubmit() → Verify with server
    ↓
If correct: Set session flag → Unlock page
If incorrect: Show error → Prompt again
```

## Implementation Details

### For Each Page

Every protected page includes:

1. **CSS Link** (in `<head>`)
```html
<link rel="stylesheet" href="passcode-modal.css">
```

2. **Modal HTML** (early in `<body>`)
```html
<div id="passcodeModalContainer" class="hidden">
  <!-- Decorative circles -->
  <div class="passcode-bubble"></div>
  <div class="passcode-bubble"></div>
  <div class="passcode-bubble"></div>
  <div class="passcode-bubble"></div>

  <!-- Modal card with form -->
  <div class="passcode-modal-card">
    <div class="passcode-logo">
      <h2>CAPD</h2>
      <p>Access Required</p>
    </div>

    <form id="passcodeForm" onsubmit="handlePasscodeSubmit(event)">
      <div class="passcode-error" id="passcodeError"></div>
      <div class="passcode-form-group">
        <input
          type="password"
          id="passcodeInput"
          class="passcode-input password"
          placeholder="Enter passcode"
          autocomplete="off"
          maxlength="6"
        />
      </div>
      <button type="submit" class="passcode-submit-btn" id="passcodeSubmitBtn">
        <span>UNLOCK</span>
        <span>→</span>
      </button>
    </form>

    <div class="passcode-footer">
      Protected by CAPD Security
    </div>
  </div>
</div>
```

3. **Page Content Wrapper**
```html
<div id="pageContent">
  <!-- All page content goes here -->
</div>
```

4. **Passcode Handler Function** (before closing `</body>`)
```javascript
async function handlePasscodeSubmit(event) {
  event.preventDefault();
  const passcode = document.getElementById('passcodeInput').value.trim();
  const errorDiv = document.getElementById('passcodeError');
  const submitBtn = document.getElementById('passcodeSubmitBtn');

  if (!passcode) {
    showError(errorDiv, 'Please enter a passcode');
    return;
  }

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  try {
    const verified = await window.passcodeProtection.verifyPasscode(passcode);
    if (verified) {
      errorDiv.classList.remove('show');
      window.passcodeProtection.unlockPage();
      document.getElementById('passcodeInput').value = '';
    } else {
      showError(errorDiv, 'Incorrect passcode. Please try again.');
      document.getElementById('passcodeInput').value = '';
      document.getElementById('passcodeInput').focus();
    }
  } catch (error) {
    showError(errorDiv, 'Connection error. Please try again.');
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
}

function showError(errorDiv, message) {
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  setTimeout(() => {
    errorDiv.classList.remove('show');
  }, 4000);
}
```

5. **Load Protection System** (at end of `</body>`)
```html
<script src="passcode-protection.js"></script>
```

## Server API Requirements

The system requires two API endpoints:

### 1. GET `/api/passcode`
**Purpose**: Check if passcode protection is enabled

**Response**:
```json
{
  "enabled": true,
  "message": "Passcode protection is enabled"
}
```

### 2. POST `/api/passcode/verify`
**Purpose**: Verify the entered passcode

**Request Body**:
```json
{
  "passcode": "1234"
}
```

**Response (Success)**:
```json
{
  "verified": true,
  "message": "Passcode is correct"
}
```

**Response (Failure)**:
```json
{
  "verified": false,
  "message": "Incorrect passcode"
}
```

## Design Features

### Modal Design
- **Background**: Gradient (blue to purple) with floating animated circles
- **Card**: Semi-transparent dark background with blur effect
- **Typography**: Clean sans-serif with "CAPD" logo
- **Buttons**: White button with arrow indicator
- **Animation**: Smooth slide-up entrance animation
- **Responsive**: Adapts beautifully to all screen sizes

### Color Scheme
- Primary Gradient: `#1e3c72` → `#2a5298` → `#7e22ce`
- Button: White (`#ffffff`)
- Text: White with varying opacity
- Error: Red/pink (`#fca5a5`)

### Responsive Breakpoints
- **Desktop**: Full-size modal card
- **Tablet** (768px): Adjusted padding and fonts
- **Mobile** (480px): Compact layout, decorative elements hidden

## Session Management

### SessionStorage Key
```
capd_passcode_verified
```

### Session Behavior
- **Set to 'true'** after successful passcode entry
- **Persists** across page navigation within same browser tab
- **Cleared** when user closes browser tab or clears browser data
- **Not shared** across browser tabs (each tab has independent verification)

## Usage Examples

### For Users
1. User shares a link: `https://example.com/tv.html`
2. Friend opens the link
3. Beautiful passcode modal appears
4. Friend enters passcode
5. Page content becomes accessible
6. Navigating to other pages doesn't require re-entry
7. Closing browser tab clears the session

### For Developers
Adding protection to a new page:
1. Copy the modal HTML to the new page
2. Add CSS link: `<link rel="stylesheet" href="passcode-modal.css">`
3. Add handler function before closing `</body>`
4. Add script loader: `<script src="passcode-protection.js"></script>`
5. Wrap page content in: `<div id="pageContent">...</div>`

## Configuration

### Passcode Settings
Configure passcode protection in your admin panel or server settings:
- Set the passcode value
- Enable/disable protection globally
- Change through admin dashboard at `/admin/dashboard.html`

### Customization Options

**To change modal logo/title**, edit in each page's HTML:
```html
<div class="passcode-logo">
  <h2>CAPD</h2>
  <p>Access Required</p>
</div>
```

**To change colors**, modify `passcode-modal.css`:
```css
#passcodeModalContainer {
  background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 50%, #YOUR_COLOR_3 100%);
}
```

**To adjust animations**, modify keyframes in `passcode-modal.css`:
```css
@keyframes float {
  /* Adjust timing and movement */
}
```

## Security Considerations

1. **Server-Side Verification**: Passcode is always verified server-side, not in the browser
2. **No Client-Side Storage**: Passcode is never stored permanently in browser
3. **Session-Based**: Each session requires re-authentication when browser is closed
4. **HTTPS Recommended**: Always use HTTPS in production to encrypt passcode transmission
5. **Rate Limiting**: Implement rate limiting on server to prevent brute force attacks

## Troubleshooting

### Modal Not Showing
- Check that `passcode-modal.css` is linked correctly
- Verify `passcode-protection.js` is loaded at end of page
- Check browser console for errors

### Passcode Not Verifying
- Confirm server is running and API endpoints are accessible
- Check network tab to see API response
- Verify passcode value in server configuration
- Check server logs for errors

### Modal Shows on Every Page Load
- Clear browser cache and sessionStorage
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Check that sessionStorage is not being cleared by code

### Responsive Issues on Mobile
- Verify `passcode-modal.css` media queries are loading
- Check device viewport settings in HTML head
- Test in Chrome DevTools device emulation mode

## Pages Protected

- ✅ `index.html` - Home page
- ✅ `landing.html` - Landing page
- ✅ `tv.html` - Digital TV page
- ✅ Any future pages with the modal implementation

## Admin Control

Administrators can manage passcode protection through the admin dashboard:
- **Location**: `/admin/dashboard.html`
- **Login**: Default credentials (admin/capd2025)
- **Settings**: Can enable/disable protection and update passcode value
- **Changes**: Take effect immediately across all pages

## Changelog

### Version 1.0 (Current)
- Initial sitewide passcode protection implementation
- Gratafy-inspired modal design
- Beautiful animations and responsive layout
- Server-side passcode verification
- Session-based authentication

---

**Last Updated**: December 2025
**Maintained By**: CAPD Communications Team
**Support**: For issues or questions, contact the development team
