/**
 * CAPD Sitewide Passcode Protection
 * Provides centralized passcode management for all pages
 */

class PasscodeProtection {
  constructor() {
    this.sessionKey = 'capd_passcode_verified';
    this.isProtected = false;
  }

  /**
   * Initialize passcode protection on page load
   */
  async init() {
    // Check if already verified in this session
    if (sessionStorage.getItem(this.sessionKey) === 'true') {
      this.unlockPage();
      return;
    }

    // Show passcode modal and fetch protection status
    this.showPasscodeModal();
    await this.checkProtectionStatus();
  }

  /**
   * Fetch passcode protection status from server
   */
  async checkProtectionStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:6001/api/passcode'
        : '/api/passcode';

      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.isProtected = data.enabled !== false;

        if (!this.isProtected) {
          // Protection disabled - unlock immediately
          sessionStorage.setItem(this.sessionKey, 'true');
          this.unlockPage();
        }
      }
    } catch (error) {
      console.log('Passcode check: keeping modal visible (default safe mode)');
      this.isProtected = true;
    }
  }

  /**
   * Show the passcode modal
   */
  showPasscodeModal() {
    const modal = document.getElementById('passcodeModalContainer');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide the passcode modal
   */
  hidePasscodeModal() {
    const modal = document.getElementById('passcodeModalContainer');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }

  /**
   * Unlock the page after successful passcode entry
   */
  unlockPage() {
    this.hidePasscodeModal();
    sessionStorage.setItem(this.sessionKey, 'true');
    const pageContent = document.getElementById('pageContent');
    if (pageContent) {
      pageContent.style.display = '';
      pageContent.style.pointerEvents = 'auto';
    }
  }

  /**
   * Verify passcode with server
   */
  async verifyPasscode(passcode) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:6001/api/passcode/verify'
        : '/api/passcode/verify';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.verified === true;
      }
      return false;
    } catch (error) {
      console.error('Passcode verification error:', error);
      return false;
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const passcodeProtection = new PasscodeProtection();
    window.passcodeProtection = passcodeProtection;
    passcodeProtection.init();
  });
} else {
  const passcodeProtection = new PasscodeProtection();
  window.passcodeProtection = passcodeProtection;
  passcodeProtection.init();
}
