/**
 * CAPD Content Management System
 * Handles all admin panel functionality
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  displayUsername();
  loadAllData();
  setupEventListeners();
});

/**
 * Display username in header
 */
function displayUsername() {
  const user = localStorage.getItem('adminUser');
  document.getElementById('username').textContent = user;
  document.getElementById('adminUsername').textContent = user;
}

/**
 * Load all data from localStorage
 */
function loadAllData() {
  // Initialize channels from JSON if empty in localStorage
  initializeChannelsIfEmpty();

  loadNewsArticles();
  loadChannels();
  loadSchedule();
  loadAnnouncements();
}

/**
 * Initialize channels from JSON file if not in localStorage
 */
async function initializeChannelsIfEmpty() {
  const stored = localStorage.getItem('channels');
  if (!stored || JSON.parse(stored).length === 0) {
    try {
      const res = await fetch("../data/channels.json");
      const data = await res.json();
      localStorage.setItem('channels', JSON.stringify(data.channels));
    } catch (e) {
      console.log("Note: channels.json not found, using empty channels array");
    }
  }
}

/**
 * Setup form event listeners
 */
function setupEventListeners() {
  // News Form
  document.getElementById('articleForm').addEventListener('submit', saveArticle);

  // Channel Form
  document.getElementById('formChannel').addEventListener('submit', saveChannel);

  // Schedule Form
  document.getElementById('formProgram').addEventListener('submit', saveProgram);

  // Announcements Form
  document.getElementById('formAnnounce').addEventListener('submit', saveAnnouncement);
}

/**
 * ==================== NEWS MANAGEMENT ====================
 */

function showNewsForm() {
  document.getElementById('newsForm').classList.remove('hidden');
  document.getElementById('articleTitle').focus();
}

function hideNewsForm() {
  document.getElementById('newsForm').classList.add('hidden');
  document.getElementById('articleForm').reset();
}

function loadNewsArticles() {
  const data = JSON.parse(localStorage.getItem('articles')) || [];
  const table = document.getElementById('newsTable');

  if (data.length === 0) {
    table.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No articles yet</td></tr>';
    return;
  }

  table.innerHTML = data.map((article, idx) => `
    <tr>
      <td class="px-6 py-4">${article.title}</td>
      <td class="px-6 py-4">${article.author}</td>
      <td class="px-6 py-4">${article.category}</td>
      <td class="px-6 py-4">${article.date}</td>
      <td class="px-6 py-4 text-center">
        <button onclick="editArticle(${idx})" class="text-blue-600 hover:underline mr-2">Edit</button>
        <button onclick="deleteArticle(${idx})" class="text-red-600 hover:underline">Delete</button>
      </td>
    </tr>
  `).join('');
}

function saveArticle(e) {
  e.preventDefault();

  const article = {
    id: 'art-' + Date.now(),
    title: document.getElementById('articleTitle').value,
    author: document.getElementById('articleAuthor').value,
    category: document.getElementById('articleCategory').value,
    date: document.getElementById('articleDate').value,
    description: document.getElementById('articleDesc').value,
    content: document.getElementById('articleContent').value,
    image: document.getElementById('articleImage').value || 'assets/images/default.jpg',
    featured: false
  };

  let articles = JSON.parse(localStorage.getItem('articles')) || [];
  articles.push(article);
  localStorage.setItem('articles', JSON.stringify(articles));

  // Also update articles.json equivalent
  updateArticlesJson(articles);

  hideNewsForm();
  loadNewsArticles();
  alert('Article saved successfully!');
}

function deleteArticle(idx) {
  if (confirm('Are you sure you want to delete this article?')) {
    let articles = JSON.parse(localStorage.getItem('articles')) || [];
    articles.splice(idx, 1);
    localStorage.setItem('articles', JSON.stringify(articles));
    updateArticlesJson(articles);
    loadNewsArticles();
    alert('Article deleted!');
  }
}

function editArticle(idx) {
  let articles = JSON.parse(localStorage.getItem('articles')) || [];
  const article = articles[idx];

  document.getElementById('articleTitle').value = article.title;
  document.getElementById('articleAuthor').value = article.author;
  document.getElementById('articleCategory').value = article.category;
  document.getElementById('articleDate').value = article.date;
  document.getElementById('articleDesc').value = article.description;
  document.getElementById('articleContent').value = article.content;
  document.getElementById('articleImage').value = article.image;

  showNewsForm();
}

/**
 * ==================== CHANNEL MANAGEMENT ====================
 */

function showChannelForm() {
  document.getElementById('channelForm').classList.remove('hidden');
  document.getElementById('channelName').focus();
}

function hideChannelForm() {
  document.getElementById('channelForm').classList.add('hidden');
  document.getElementById('formChannel').reset();
  document.getElementById('editChannelIndex').value = '';
}

function loadChannels() {
  const data = JSON.parse(localStorage.getItem('channels')) || [];
  const container = document.getElementById('channelsContainer');
  const select = document.getElementById('progChannel');

  // Populate channel selector for schedule
  select.innerHTML = data.map(ch => `<option value="${ch.id}">${ch.name}</option>`).join('');

  if (data.length === 0) {
    container.innerHTML = '<p class="text-gray-500 col-span-full">No channels yet</p>';
    return;
  }

  container.innerHTML = data.map((channel, idx) => `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h4 class="text-lg font-bold">${channel.number}. ${channel.name}</h4>
          <p class="text-gray-600 text-sm">${channel.description}</p>
        </div>
        <span class="text-xs font-bold px-3 py-1 rounded ${channel.status === 'live' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}">
          ${channel.status.toUpperCase()}
        </span>
      </div>
      <div class="text-sm text-gray-600 mb-4">
        <p><strong>Stream URL:</strong> ${channel.streamUrl.substring(0, 40)}...</p>
        <p><strong>Viewers:</strong> ${channel.viewers}</p>
      </div>
      <div class="flex gap-2">
        <button onclick="editChannel(${idx})" class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm">Edit</button>
        <button onclick="deleteChannel(${idx})" class="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded text-sm">Delete</button>
      </div>
    </div>
  `).join('');
}

function saveChannel(e) {
  e.preventDefault();

  const editIndex = document.getElementById('editChannelIndex').value;
  const channel = {
    id: editIndex !== '' ? JSON.parse(localStorage.getItem('channels'))[editIndex].id : 'ch-' + Date.now(),
    name: document.getElementById('channelName').value,
    number: parseInt(document.getElementById('channelNum').value),
    description: document.getElementById('channelDesc').value,
    streamUrl: document.getElementById('streamUrl').value,
    status: document.getElementById('channelStatus').value,
    viewers: parseInt(document.getElementById('viewers').value),
    poster: 'assets/images/channel-default.jpg'
  };

  let channels = JSON.parse(localStorage.getItem('channels')) || [];

  if (editIndex !== '') {
    // Update existing channel
    channels[parseInt(editIndex)] = channel;
  } else {
    // Add new channel
    channels.push(channel);
  }

  localStorage.setItem('channels', JSON.stringify(channels));

  updateChannelsJson(channels);

  hideChannelForm();
  loadChannels();
  alert('Channel saved successfully!');
}

function deleteChannel(idx) {
  if (confirm('Delete this channel?')) {
    let channels = JSON.parse(localStorage.getItem('channels')) || [];
    channels.splice(idx, 1);
    localStorage.setItem('channels', JSON.stringify(channels));
    updateChannelsJson(channels);
    loadChannels();
  }
}

function editChannel(idx) {
  let channels = JSON.parse(localStorage.getItem('channels')) || [];
  const channel = channels[idx];

  document.getElementById('channelName').value = channel.name;
  document.getElementById('channelNum').value = channel.number;
  document.getElementById('channelDesc').value = channel.description;
  document.getElementById('streamUrl').value = channel.streamUrl;
  document.getElementById('channelStatus').value = channel.status;
  document.getElementById('viewers').value = channel.viewers;
  document.getElementById('editChannelIndex').value = idx;

  showChannelForm();
}

/**
 * ==================== SCHEDULE MANAGEMENT ====================
 */

function showScheduleForm() {
  document.getElementById('scheduleForm').classList.remove('hidden');
  document.getElementById('progTitle').focus();
}

function hideScheduleForm() {
  document.getElementById('scheduleForm').classList.add('hidden');
  document.getElementById('formProgram').reset();
}

function loadSchedule() {
  const data = JSON.parse(localStorage.getItem('schedule')) || [];
  const table = document.getElementById('scheduleTable');

  if (data.length === 0) {
    table.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No programs scheduled</td></tr>';
    return;
  }

  table.innerHTML = data.map((program, idx) => {
    const channels = JSON.parse(localStorage.getItem('channels')) || [];
    const channel = channels.find(ch => ch.id === program.channelId);

    return `
      <tr>
        <td class="px-6 py-4">${program.title}</td>
        <td class="px-6 py-4">${channel ? channel.name : 'Unknown'}</td>
        <td class="px-6 py-4">${program.startTime} - ${program.endTime}</td>
        <td class="px-6 py-4">${program.host}</td>
        <td class="px-6 py-4 text-center">
          <button onclick="editProgram(${idx})" class="text-blue-600 hover:underline mr-2">Edit</button>
          <button onclick="deleteProgram(${idx})" class="text-red-600 hover:underline">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function saveProgram(e) {
  e.preventDefault();

  const program = {
    id: 'prog-' + Date.now(),
    channelId: document.getElementById('progChannel').value,
    title: document.getElementById('progTitle').value,
    startTime: document.getElementById('progStart').value,
    endTime: document.getElementById('progEnd').value,
    duration: parseInt(document.getElementById('progDuration').value),
    description: document.getElementById('progDesc').value,
    host: document.getElementById('progHost').value,
    image: 'assets/images/program-default.jpg'
  };

  let schedule = JSON.parse(localStorage.getItem('schedule')) || [];
  schedule.push(program);
  localStorage.setItem('schedule', JSON.stringify(schedule));

  updateScheduleJson(schedule);

  hideScheduleForm();
  loadSchedule();
  alert('Program saved successfully!');
}

function deleteProgram(idx) {
  if (confirm('Delete this program?')) {
    let schedule = JSON.parse(localStorage.getItem('schedule')) || [];
    schedule.splice(idx, 1);
    localStorage.setItem('schedule', JSON.stringify(schedule));
    updateScheduleJson(schedule);
    loadSchedule();
  }
}

function editProgram(idx) {
  let schedule = JSON.parse(localStorage.getItem('schedule')) || [];
  const program = schedule[idx];

  document.getElementById('progChannel').value = program.channelId;
  document.getElementById('progTitle').value = program.title;
  document.getElementById('progStart').value = program.startTime;
  document.getElementById('progEnd').value = program.endTime;
  document.getElementById('progDuration').value = program.duration;
  document.getElementById('progDesc').value = program.description;
  document.getElementById('progHost').value = program.host;

  showScheduleForm();
}

/**
 * ==================== ANNOUNCEMENTS MANAGEMENT ====================
 */

function showAnnounceForm() {
  document.getElementById('announceForm').classList.remove('hidden');
  document.getElementById('annTitle').focus();
}

function hideAnnounceForm() {
  document.getElementById('announceForm').classList.add('hidden');
  document.getElementById('formAnnounce').reset();
}

function loadAnnouncements() {
  const data = JSON.parse(localStorage.getItem('announcements')) || [];
  const container = document.getElementById('announcementsContainer');

  if (data.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No announcements</p>';
    return;
  }

  container.innerHTML = data.map((ann, idx) => {
    const priorityColor = ann.priority === 'high' ? 'red' : ann.priority === 'medium' ? 'yellow' : 'blue';
    const typeEmoji = ann.type === 'breaking' ? '🔴' : ann.type === 'news' ? '📰' : ann.type === 'event' ? '📅' : '📢';

    return `
      <div class="bg-white rounded-lg shadow p-4 border-l-4 border-${priorityColor}-500">
        <div class="flex justify-between items-start">
          <div class="flex-grow">
            <h4 class="font-bold text-lg">${typeEmoji} ${ann.title}</h4>
            <p class="text-gray-600 text-sm mb-2">${ann.content}</p>
            <p class="text-xs text-gray-500">Posted: ${new Date(ann.timestamp).toLocaleString()}</p>
          </div>
          <div class="flex gap-2 ml-4">
            <button onclick="editAnnouncement(${idx})" class="text-blue-600 hover:underline text-sm">Edit</button>
            <button onclick="deleteAnnouncement(${idx})" class="text-red-600 hover:underline text-sm">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function saveAnnouncement(e) {
  e.preventDefault();

  const expiresInHours = parseInt(document.getElementById('annExpire').value);
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

  const announcement = {
    id: 'ann-' + Date.now(),
    type: document.getElementById('annType').value,
    title: document.getElementById('annTitle').value,
    content: document.getElementById('annContent').value,
    timestamp: new Date().toISOString(),
    priority: document.getElementById('annPriority').value,
    expiresAt: expiresAt,
    icon: document.getElementById('annType').value === 'breaking' ? 'alert' : 'info'
  };

  let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
  announcements.push(announcement);
  localStorage.setItem('announcements', JSON.stringify(announcements));

  updateAnnouncementsJson(announcements);

  hideAnnounceForm();
  loadAnnouncements();
  alert('Announcement posted!');
}

function deleteAnnouncement(idx) {
  if (confirm('Delete this announcement?')) {
    let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    announcements.splice(idx, 1);
    localStorage.setItem('announcements', JSON.stringify(announcements));
    updateAnnouncementsJson(announcements);
    loadAnnouncements();
  }
}

function editAnnouncement(idx) {
  let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
  const ann = announcements[idx];

  document.getElementById('annTitle').value = ann.title;
  document.getElementById('annType').value = ann.type;
  document.getElementById('annContent').value = ann.content;
  document.getElementById('annPriority').value = ann.priority;

  showAnnounceForm();
}

/**
 * ==================== SECTION NAVIGATION ====================
 */

function showSection(sectionId) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });

  // Show selected section
  document.getElementById(sectionId).classList.remove('hidden');

  // Update nav button styles
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('nav-active');
  });
  event.target.classList.add('nav-active');

  // Reload data
  if (sectionId === 'news') loadNewsArticles();
  if (sectionId === 'channels') loadChannels();
  if (sectionId === 'schedule') loadSchedule();
  if (sectionId === 'announcements') loadAnnouncements();
}

/**
 * ==================== DATA IMPORT/EXPORT ====================
 */

function exportData() {
  const data = {
    articles: JSON.parse(localStorage.getItem('articles')) || [],
    channels: JSON.parse(localStorage.getItem('channels')) || [],
    schedule: JSON.parse(localStorage.getItem('schedule')) || [],
    announcements: JSON.parse(localStorage.getItem('announcements')) || [],
    exportedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `capd-backup-${new Date().getTime()}.json`;
  link.click();
  alert('Data exported successfully!');
}

function importData() {
  const file = document.getElementById('importFile').files[0];
  if (!file) {
    alert('Please select a file');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      localStorage.setItem('articles', JSON.stringify(data.articles || []));
      localStorage.setItem('channels', JSON.stringify(data.channels || []));
      localStorage.setItem('schedule', JSON.stringify(data.schedule || []));
      localStorage.setItem('announcements', JSON.stringify(data.announcements || []));

      loadAllData();
      alert('Data imported successfully!');
    } catch (error) {
      alert('Error importing data: ' + error.message);
    }
  };
  reader.readAsText(file);
}

function clearCache() {
  if (confirm('Clear all cached data?')) {
    localStorage.removeItem('articles');
    localStorage.removeItem('channels');
    localStorage.removeItem('schedule');
    localStorage.removeItem('announcements');
    loadAllData();
    alert('Cache cleared!');
  }
}

/**
 * ==================== UTILITIES ====================
 */

function logout() {
  localStorage.removeItem('adminUser');
  localStorage.removeItem('loginTime');
  window.location.href = 'index.html';
}

/**
 * Update JSON files in data folder
 */
function updateArticlesJson(articles) {
  const data = { articles: articles };
  // In production, this would POST to the server
  console.log('Updating articles.json', data);
}

function updateChannelsJson(channels) {
  const data = { channels: channels };
  console.log('Updating channels.json', data);
}

function updateScheduleJson(schedule) {
  const data = { schedule: schedule };
  console.log('Updating schedule.json', data);
}

function updateAnnouncementsJson(announcements) {
  const data = { announcements: announcements };
  console.log('Updating announcements.json', data);
}

/**
 * ==================== STREAMING SETUP ====================
 */

/**
 * Select streaming platform and show configuration
 */
function selectPlatform(platform) {
  // Hide all platforms
  document.getElementById('youtubeSetup').classList.add('hidden');
  document.getElementById('twitchSetup').classList.add('hidden');
  document.getElementById('obsSetup').classList.add('hidden');
  document.getElementById('customSetup').classList.add('hidden');

  // Show selected platform
  if (platform === 'youtube') {
    document.getElementById('youtubeSetup').classList.remove('hidden');
  } else if (platform === 'twitch') {
    document.getElementById('twitchSetup').classList.remove('hidden');
  } else if (platform === 'obs') {
    document.getElementById('obsSetup').classList.remove('hidden');
  } else if (platform === 'custom') {
    document.getElementById('customSetup').classList.remove('hidden');
  }

  // Load existing configuration if any
  loadStreamingConfig();
}

/**
 * Toggle visibility of YouTube stream key
 */
function toggleYoutubeKeyVisibility() {
  const keyInput = document.getElementById('youtubeStreamKey');
  const keyDisplay = document.getElementById('youtubeKeyDisplay');

  if (keyInput.type === 'password') {
    keyInput.type = 'text';
    keyDisplay.textContent = keyInput.value || '••••••••••••••••';
  } else {
    keyInput.type = 'password';
    keyDisplay.textContent = '••••••••••••••••';
  }
}

/**
 * Toggle visibility of Twitch stream key
 */
function toggleTwitchKeyVisibility() {
  const keyInput = document.getElementById('twitchStreamKey');
  const keyDisplay = document.getElementById('twitchKeyDisplay');

  if (keyInput.type === 'password') {
    keyInput.type = 'text';
    keyDisplay.textContent = keyInput.value || '••••••••••••••••';
  } else {
    keyInput.type = 'password';
    keyDisplay.textContent = '••••••••••••••••';
  }
}

/**
 * Toggle visibility of OBS stream key
 */
function toggleObsKeyVisibility() {
  const keyInput = document.getElementById('obsStreamKey');

  if (keyInput.type === 'password') {
    keyInput.type = 'text';
  } else {
    keyInput.type = 'password';
  }
}

/**
 * Toggle visibility of Custom stream key
 */
function toggleCustomKeyVisibility() {
  const keyInput = document.getElementById('customStreamKey');

  if (keyInput.type === 'password') {
    keyInput.type = 'text';
  } else {
    keyInput.type = 'password';
  }
}

/**
 * Copy stream key to clipboard
 */
function copyToClipboard(elementId, platform) {
  const element = document.getElementById(elementId);
  const text = element.value;

  if (!text) {
    alert('Please enter your stream key first!');
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    alert('Stream key copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    element.select();
    document.execCommand('copy');
    alert('Stream key copied to clipboard!');
  });
}

/**
 * Generate OBS configuration display
 */
function generateObsConfig() {
  const server = document.getElementById('obsServer').value;
  const streamKey = document.getElementById('obsStreamKey').value;
  const bitrate = document.getElementById('obsBitrate').value;
  const fps = document.getElementById('obsFps').value;
  const resolution = document.getElementById('obsResolution').value;
  const preset = document.getElementById('obsPreset').value;

  if (!server || !streamKey) {
    alert('Please enter server and stream key!');
    return;
  }

  const config = `
OBS Configuration
================

Server:     ${server}
Stream Key: ${streamKey}

Output Settings:
- Bitrate:  ${bitrate} kbps
- FPS:      ${fps}
- Resolution: ${resolution}
- Preset:   ${preset}

Instructions:
1. Open OBS Studio
2. File → Settings → Stream
3. Service: Custom
4. Server: ${server}
5. Stream Key: ${streamKey}
6. Click OK
7. File → Settings → Output
8. Set Bitrate to ${bitrate} kbps
9. Click OK
10. Click "Start Streaming"
  `;

  alert(config);
}

/**
 * Save streaming configuration
 */
function saveStreamingConfig(platform) {
  let config = {
    platform: platform,
    timestamp: new Date().toISOString()
  };

  if (platform === 'youtube') {
    const streamKey = document.getElementById('youtubeStreamKey').value;
    const videoId = document.getElementById('youtubeVideoId').value;

    if (!streamKey && !videoId) {
      alert('Please enter your YouTube Stream Key or Video ID!');
      return;
    }

    config.streamKey = streamKey;
    config.videoId = videoId;
    config.server = 'rtmps://a.rtmp.youtube.com/live2';
  } else if (platform === 'twitch') {
    const streamKey = document.getElementById('twitchStreamKey').value;
    const channelName = document.getElementById('twitchChannelName').value;

    if (!streamKey && !channelName) {
      alert('Please enter your Twitch Stream Key or Channel Name!');
      return;
    }

    config.streamKey = streamKey;
    config.channelName = channelName;
    config.server = 'rtmp://live-iad.twitch.tv/app';
  } else if (platform === 'obs') {
    const server = document.getElementById('obsServer').value;
    const streamKey = document.getElementById('obsStreamKey').value;
    const bitrate = document.getElementById('obsBitrate').value;
    const fps = document.getElementById('obsFps').value;
    const resolution = document.getElementById('obsResolution').value;
    const preset = document.getElementById('obsPreset').value;

    if (!server || !streamKey) {
      alert('Please enter server and stream key!');
      return;
    }

    config.server = server;
    config.streamKey = streamKey;
    config.bitrate = bitrate;
    config.fps = fps;
    config.resolution = resolution;
    config.preset = preset;
  } else if (platform === 'custom') {
    const provider = document.getElementById('customProvider').value;
    const rtmpServer = document.getElementById('customRtmpServer').value;
    const streamKey = document.getElementById('customStreamKey').value;
    const hlsUrl = document.getElementById('customHlsUrl').value;
    const bitrate = document.getElementById('customBitrate').value;
    const fps = document.getElementById('customFps').value;

    if (!rtmpServer || !streamKey) {
      alert('Please enter RTMP server and stream key!');
      return;
    }

    config.provider = provider;
    config.server = rtmpServer;
    config.streamKey = streamKey;
    config.hlsUrl = hlsUrl;
    config.bitrate = bitrate;
    config.fps = fps;
  }

  // Save to localStorage
  localStorage.setItem('streamingConfig', JSON.stringify(config));

  // Display configuration
  displayStreamingConfig(config);

  alert('✅ Streaming configuration saved successfully!');
}

/**
 * Load streaming configuration
 */
function loadStreamingConfig() {
  const config = localStorage.getItem('streamingConfig');
  if (config) {
    try {
      const parsedConfig = JSON.parse(config);
      displayStreamingConfig(parsedConfig);
    } catch (e) {
      console.error('Error loading streaming config:', e);
    }
  }
}

/**
 * Display current streaming configuration
 */
function displayStreamingConfig(config) {
  const display = document.getElementById('streamingConfigDisplay');
  let html = '';

  html += `<div class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">`;
  html += `<p class="text-sm text-gray-600"><strong>Platform:</strong> ${config.platform.toUpperCase()}</p>`;
  html += `<p class="text-xs text-gray-500 mt-2">Last Updated: ${new Date(config.timestamp).toLocaleString()}</p>`;
  html += `</div>`;

  html += `<div class="bg-white rounded-lg p-4 border border-gray-300">`;

  if (config.platform === 'youtube') {
    html += `<p class="mb-2"><strong>Platform:</strong> YouTube Live</p>`;
    if (config.server) html += `<p class="mb-2"><strong>Server:</strong> <code class="bg-gray-100 px-2 py-1">${config.server}</code></p>`;
    if (config.streamKey) html += `<p class="mb-2"><strong>Stream Key:</strong> <code class="bg-gray-100 px-2 py-1">••••••••••••••••</code></p>`;
    if (config.videoId) html += `<p class="mb-2"><strong>Video/Stream URL:</strong> <code class="bg-gray-100 px-2 py-1 text-xs">${config.videoId}</code></p>`;
  } else if (config.platform === 'twitch') {
    html += `<p class="mb-2"><strong>Platform:</strong> Twitch</p>`;
    if (config.server) html += `<p class="mb-2"><strong>Server:</strong> <code class="bg-gray-100 px-2 py-1">${config.server}</code></p>`;
    if (config.streamKey) html += `<p class="mb-2"><strong>Stream Key:</strong> <code class="bg-gray-100 px-2 py-1">••••••••••••••••</code></p>`;
    if (config.channelName) html += `<p class="mb-2"><strong>Channel:</strong> <code class="bg-gray-100 px-2 py-1">${config.channelName}</code></p>`;
  } else if (config.platform === 'obs') {
    html += `<p class="mb-2"><strong>Platform:</strong> OBS Studio (Custom Server)</p>`;
    if (config.server) html += `<p class="mb-2"><strong>Server:</strong> <code class="bg-gray-100 px-2 py-1 text-xs">${config.server}</code></p>`;
    if (config.streamKey) html += `<p class="mb-2"><strong>Stream Key:</strong> <code class="bg-gray-100 px-2 py-1">••••••••••••••••</code></p>`;
    html += `<p class="mb-2"><strong>Output Settings:</strong></p>`;
    html += `<ul class="list-disc list-inside text-sm text-gray-600">`;
    if (config.bitrate) html += `<li>Bitrate: ${config.bitrate} kbps</li>`;
    if (config.fps) html += `<li>FPS: ${config.fps}</li>`;
    if (config.resolution) html += `<li>Resolution: ${config.resolution}</li>`;
    if (config.preset) html += `<li>Preset: ${config.preset}</li>`;
    html += `</ul>`;
  } else if (config.platform === 'custom') {
    html += `<p class="mb-2"><strong>Platform:</strong> Custom RTMP/HLS</p>`;
    if (config.provider) html += `<p class="mb-2"><strong>Provider:</strong> ${config.provider}</p>`;
    if (config.server) html += `<p class="mb-2"><strong>RTMP Server:</strong> <code class="bg-gray-100 px-2 py-1 text-xs">${config.server}</code></p>`;
    if (config.streamKey) html += `<p class="mb-2"><strong>Stream Key:</strong> <code class="bg-gray-100 px-2 py-1">••••••••••••••••</code></p>`;
    if (config.hlsUrl) html += `<p class="mb-2"><strong>HLS URL:</strong> <code class="bg-gray-100 px-2 py-1 text-xs">${config.hlsUrl}</code></p>`;
    html += `<p class="mb-2"><strong>Parameters:</strong></p>`;
    html += `<ul class="list-disc list-inside text-sm text-gray-600">`;
    if (config.bitrate) html += `<li>Bitrate: ${config.bitrate} kbps</li>`;
    if (config.fps) html += `<li>FPS: ${config.fps}</li>`;
    html += `</ul>`;
  }

  html += `<div class="mt-4 pt-4 border-t">`;
  html += `<button onclick="selectPlatform('${config.platform}')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">`;
  html += `📝 Edit Configuration`;
  html += `</button>`;
  html += `</div>`;
  html += `</div>`;

  display.innerHTML = html;
}
