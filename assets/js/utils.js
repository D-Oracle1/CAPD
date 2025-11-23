/**
 * CAPD Digital TV - Utility Functions
 * Provides helper functions for the platform
 */

const Utils = {
  /**
   * Fetch data from JSON files with error handling
   */
  async fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  },

  /**
   * Format time in HH:MM format
   */
  formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  },

  /**
   * Format date to readable format
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return this.formatDate(dateString);
  },

  /**
   * Create HTML element with attributes
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else if (key === 'data') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    if (content) element.innerHTML = content;
    return element;
  },

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Get URL search parameter
   */
  getSearchParam(param) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param);
  },

  /**
   * Show notification/toast message
   */
  showNotification(message, type = 'info') {
    const notification = this.createElement('div', {
      class: `notification notification-${type} fixed bottom-4 right-4 p-4 rounded shadow-lg bg-${
        type === 'success' ? 'green' :
        type === 'error' ? 'red' :
        type === 'warning' ? 'yellow' : 'blue'
      }-500 text-white max-w-sm z-50`
    }, message);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  /**
   * Check if program is currently live
   */
  isProgramLive(startTime, endTime) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= startTime && currentTime <= endTime;
  },

  /**
   * Get time until next program
   */
  getTimeUntil(startTime) {
    const [targetHours, targetMinutes] = startTime.split(':').map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHours, targetMinutes);

    if (target < now) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    return `${hours}h ${minutes}m`;
  }
};
