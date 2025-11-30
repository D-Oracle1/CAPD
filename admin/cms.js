/**
 * CAPD Content Management System
 * Handles all admin panel functionality
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  displayUsername();
  loadAllData();
  setupEventListeners();
  updateDateTime();
  setInterval(updateDateTime, 1000); // Update time every second
});

/**
 * Update date and time on dashboard
 */
function updateDateTime() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  const dayNum = String(now.getDate()).padStart(2, '0');

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = String(hours).padStart(2, '0') + ':' + minutes;

  if (document.getElementById('currentDay')) document.getElementById('currentDay').textContent = dayNum;
  if (document.getElementById('currentDayName')) document.getElementById('currentDayName').textContent = dayName;
  if (document.getElementById('currentTime')) document.getElementById('currentTime').textContent = timeStr;
  if (document.getElementById('currentAMPM')) document.getElementById('currentAMPM').textContent = ampm;
}

/**
 * Display username in header
 */
function displayUsername() {
  const user = localStorage.getItem('adminUser');
  document.getElementById('username').textContent = user;
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
  loadMediaLibrary();
  loadProjects();
  updateDashboardCounts();
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

  // Media Upload Form
  document.getElementById('formMediaUpload').addEventListener('submit', saveMedia);

  // Project Form
  document.getElementById('formProject').addEventListener('submit', saveProject);
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

async function loadChannels() {
  try {
    // ALWAYS load from database (server API) - database is single source of truth
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api/channels'
      : '/api/channels';

    console.log('📥 Loading channels from database:', apiUrl);
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      const data = result.channels || [];
      console.log('✅ Loaded', data.length, 'channels from database');
      return renderChannels(data);
    } else {
      throw new Error(`Server returned ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to load channels from database:', error.message);
    const container = document.getElementById('channelsContainer');
    if (container) {
      container.innerHTML = `<p class="text-red-600 col-span-full">Error loading channels: ${error.message}. Ensure the server is running on port 3000.</p>`;
    }
  }
}

function renderChannels(data) {
  // DO NOT store in localStorage - database is single source of truth
  // localStorage should only be used for UI state, not data persistence

  const container = document.getElementById('channelsContainer');
  const select = document.getElementById('progChannel');

  // Populate channel selector for schedule
  select.innerHTML = data.map(ch => `<option value="${ch.id}">${ch.name}</option>`).join('');

  if (data.length === 0) {
    container.innerHTML = '<p class="text-gray-500 col-span-full">No channels yet</p>';
    return;
  }

  container.innerHTML = data.map((channel) => `
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-start mb-4">
        <div>
          <h4 class="text-lg font-bold">${channel.number}. ${channel.name}</h4>
          <p class="text-gray-600 text-sm">${channel.description}</p>
        </div>
        <span class="text-xs font-bold px-3 py-1 rounded ${channel.status === 'live' || channel.status === 'online' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}">
          ${(channel.status || 'offline').toUpperCase()}
        </span>
      </div>
      <div class="text-sm text-gray-600 mb-4">
        <p><strong>Stream URL:</strong> ${channel.streamUrl.substring(0, 40)}...</p>
        <p><strong>Viewers:</strong> ${channel.viewers || 0}</p>
      </div>
      <div class="flex gap-2">
        <button onclick="editChannelById('${channel.id}')" class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm">Edit</button>
        <button onclick="deleteChannelById('${channel.id}')" class="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded text-sm">Delete</button>
      </div>
    </div>
  `).join('');

  updateDashboardCounts();
}

async function saveChannel(e) {
  e.preventDefault();

  try {
    const streamType = document.getElementById('streamType').value;
    const editChannelIndex = document.getElementById('editChannelIndex').value;

    // Get thumbnail data (base64) if uploaded
    const thumbnailData = document.getElementById('thumbnailData').value;

    const channel = {
      id: editChannelIndex !== '' ? document.getElementById('editChannelIndex').dataset.channelId : 'ch-' + Date.now(),
      name: document.getElementById('channelName').value,
      number: parseInt(document.getElementById('channelNum').value),
      description: document.getElementById('channelDesc').value,
      streamUrl: document.getElementById('streamUrl').value,
      type: streamType,
      status: document.getElementById('channelStatus').value,
      viewers: parseInt(document.getElementById('viewers').value) || 0,
      poster: 'assets/images/channel-default.jpg',
      thumbnail: thumbnailData || null  // Store base64 thumbnail
    };

    // Load CURRENT channels from database (not localStorage)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api/channels'
      : '/api/channels';

    // Step 1: Load latest channels from database
    console.log('📥 Loading current channels from database...');
    const getResponse = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!getResponse.ok) {
      throw new Error('Failed to load channels from database. Ensure server is running on port 3000.');
    }

    const getResult = await getResponse.json();
    let channels = getResult.channels || [];

    // Step 2: Update the channel in the list
    if (editChannelIndex !== '') {
      // Update existing channel
      channels = channels.map(ch => ch.id === channel.id ? channel : ch);
      console.log('✏️ Updated channel:', channel.name);
    } else {
      // Add new channel
      channels.push(channel);
      console.log('➕ Added new channel:', channel.name);
    }

    // Step 3: Save UPDATED channels to database
    const postTimeoutId = setTimeout(() => controller.abort(), 5000);
    console.log('💾 Saving channels to database...');

    const saveResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channels }),
      signal: controller.signal
    });
    clearTimeout(postTimeoutId);

    if (!saveResponse.ok) {
      throw new Error(`Failed to save: ${saveResponse.status}`);
    }

    console.log('✅ Channels saved to database');

    hideChannelForm();
    // Step 4: Reload from database to confirm changes persisted
    await loadChannels();
    alert('✅ Channel saved successfully to database!');
  } catch (error) {
    console.error('❌ Error saving channel:', error);
    alert('Error saving channel: ' + error.message + '\n\nEnsure the server is running on port 3000.');
  }
}

async function deleteChannelById(channelId) {
  if (!confirm('Delete this channel?')) return;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api/channels'
      : '/api/channels';

    // Step 1: Load latest channels from database
    console.log('📥 Loading current channels from database...');
    const getResponse = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!getResponse.ok) {
      throw new Error('Failed to load channels from database. Ensure server is running on port 3000.');
    }

    const getResult = await getResponse.json();
    let channels = getResult.channels || [];

    // Step 2: Remove the channel from the list
    const channelToDelete = channels.find(ch => ch.id === channelId);
    if (!channelToDelete) {
      throw new Error('Channel not found in database');
    }

    channels = channels.filter(ch => ch.id !== channelId);
    console.log('🗑️  Removed channel:', channelToDelete.name);

    // Step 3: Save UPDATED channels to database
    const postTimeoutId = setTimeout(() => controller.abort(), 5000);
    console.log('💾 Saving updated channels to database...');

    const saveResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channels }),
      signal: controller.signal
    });
    clearTimeout(postTimeoutId);

    if (!saveResponse.ok) {
      throw new Error(`Failed to delete: ${saveResponse.status}`);
    }

    console.log('✅ Channel deleted from database');

    // Step 4: Reload from database to confirm deletion
    await loadChannels();
    alert('✅ Channel deleted successfully from database!');
  } catch (error) {
    console.error('❌ Error deleting channel:', error);
    alert('Error deleting channel: ' + error.message + '\n\nEnsure the server is running on port 3000.');
  }
}

async function editChannelById(channelId) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api/channels'
      : '/api/channels';

    // Load channels from database (not localStorage)
    console.log('📥 Loading channels from database to edit...');
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to load channels from database');
    }

    const result = await response.json();
    const channels = result.channels || [];
    const channel = channels.find(ch => ch.id === channelId);

    if (!channel) {
      alert('Channel not found in database');
      return;
    }

    // Populate form with channel data from database
    document.getElementById('channelName').value = channel.name;
    document.getElementById('channelNum').value = channel.number;
    document.getElementById('channelDesc').value = channel.description;
    document.getElementById('streamUrl').value = channel.streamUrl;
    document.getElementById('streamType').value = channel.type || 'rtmp';
    document.getElementById('channelStatus').value = channel.status;
    document.getElementById('viewers').value = channel.viewers;
    document.getElementById('editChannelIndex').value = channelId;
    document.getElementById('editChannelIndex').dataset.channelId = channelId;

    // Load thumbnail if it exists
    if (channel.thumbnail) {
      loadThumbnailForChannel(channel);
    } else {
      clearThumbnail();
    }

    updateStreamUrlPlaceholder();
    showChannelForm();
  } catch (error) {
    console.error('❌ Error loading channel for editing:', error);
    alert('Error loading channel: ' + error.message);
  }
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
  window.location.href = '/admin/index.html';
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
  // Save channels to backend API
  const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api/channels'
    : '/api/channels';

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channels: channels })
  })
    .then(response => response.json())
    .then(data => {
      console.log('Channels saved to backend:', data);
    })
    .catch(error => {
      console.error('Error saving channels to backend:', error);
      console.log('Channels saved to localStorage only');
    });

  // Also keep localStorage backup
  localStorage.setItem('channels', JSON.stringify(channels));
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

/**
 * ==================== MEDIA LIBRARY MANAGEMENT ====================
 */

function showMediaUploadForm() {
  document.getElementById('mediaUploadForm').classList.remove('hidden');
  document.getElementById('mediaTitle').focus();
}

function hideMediaUploadForm() {
  document.getElementById('mediaUploadForm').classList.add('hidden');
  document.getElementById('formMediaUpload').reset();
}

function loadMediaLibrary() {
  const media = JSON.parse(localStorage.getItem('mediaLibrary')) || [];
  const container = document.getElementById('mediaContainer');

  if (media.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No media files yet. Upload your first media file!</div>';
    updateDashboardCounts();
    return;
  }

  container.innerHTML = media.map((item, idx) => {
    const iconMap = {
      'Image': '🖼️',
      'Video': '🎬',
      'Document': '📄'
    };
    const icon = Object.keys(iconMap).find(key => item.type.includes(key))
      ? iconMap[Object.keys(iconMap).find(key => item.type.includes(key))]
      : '📁';

    return `
      <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
        <div class="bg-gray-900 h-40 flex items-center justify-center text-5xl">
          ${icon}
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-900 mb-1 truncate">${item.title}</h3>
          <p class="text-xs text-gray-500 mb-2">${item.type}</p>
          ${item.category ? `<p class="text-xs bg-purple-100 text-purple-700 inline-block px-2 py-1 rounded mb-3">${item.category}</p>` : ''}
          <p class="text-sm text-gray-600 line-clamp-2 mb-3">${item.description || 'No description'}</p>
          <div class="flex gap-2">
            <button onclick="deleteMedia(${idx})" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  updateDashboardCounts();
}

function saveMedia(e) {
  e.preventDefault();

  const media = JSON.parse(localStorage.getItem('mediaLibrary')) || [];
  const newMedia = {
    type: document.getElementById('mediaType').value,
    title: document.getElementById('mediaTitle').value,
    description: document.getElementById('mediaDescription').value,
    url: document.getElementById('mediaUrl').value,
    category: document.getElementById('mediaCategory').value,
    uploadDate: new Date().toLocaleDateString()
  };

  media.push(newMedia);
  localStorage.setItem('mediaLibrary', JSON.stringify(media));

  hideMediaUploadForm();
  loadMediaLibrary();
  alert('Media file added successfully!');
}

function deleteMedia(idx) {
  if (confirm('Delete this media file?')) {
    const media = JSON.parse(localStorage.getItem('mediaLibrary')) || [];
    media.splice(idx, 1);
    localStorage.setItem('mediaLibrary', JSON.stringify(media));
    loadMediaLibrary();
  }
}

/**
 * ==================== PROJECTS MANAGEMENT ====================
 */

function showProjectForm() {
  document.getElementById('projectForm').classList.remove('hidden');
  document.getElementById('projectName').focus();
  document.getElementById('editProjectIndex').value = '';
}

function hideProjectForm() {
  document.getElementById('projectForm').classList.add('hidden');
  document.getElementById('formProject').reset();
}

function loadProjects() {
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const container = document.getElementById('projectsContainer');

  if (projects.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No projects yet. Add your first project!</div>';
    updateDashboardCounts();
    return;
  }

  container.innerHTML = projects.map((project, idx) => {
    const statusColors = {
      'Planning': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-green-100 text-green-700',
      'On Hold': 'bg-red-100 text-red-700'
    };

    return `
      <div class="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
        <div class="h-40 bg-gray-300 relative overflow-hidden">
          ${project.image ? `<img src="${project.image}" alt="${project.name}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center bg-gray-400 text-4xl">🏗️</div>'}
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-900 mb-2">${project.name}</h3>
          <p class="text-xs font-medium mb-2">
            <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded">${project.category}</span>
          </p>
          <p class="text-sm text-gray-600 line-clamp-2 mb-3">${project.description}</p>

          <!-- Progress Bar -->
          <div class="mb-3">
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-gray-700">Progress</span>
              <span class="text-xs font-bold text-gray-900">${project.progress}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${project.progress}%"></div>
            </div>
          </div>

          <p class="text-xs mb-3">
            <span class="font-medium">Status:</span>
            <span class="${statusColors[project.status] || 'bg-gray-100 text-gray-700'} px-2 py-1 rounded text-xs font-medium">${project.status}</span>
          </p>

          <div class="flex gap-2">
            <button onclick="editProject(${idx})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">Edit</button>
            <button onclick="deleteProject(${idx})" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  updateDashboardCounts();
}

function saveProject(e) {
  e.preventDefault();

  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const editIdx = document.getElementById('editProjectIndex').value;

  const projectData = {
    name: document.getElementById('projectName').value,
    category: document.getElementById('projectCategory').value,
    description: document.getElementById('projectDescription').value,
    status: document.getElementById('projectStatus').value,
    progress: parseInt(document.getElementById('projectProgress').value),
    image: document.getElementById('projectImage').value,
    createdDate: new Date().toLocaleDateString()
  };

  if (editIdx === '' || editIdx === null) {
    projects.push(projectData);
  } else {
    projects[parseInt(editIdx)] = projectData;
  }

  localStorage.setItem('projects', JSON.stringify(projects));
  hideProjectForm();
  loadProjects();
  alert('Project saved successfully!');
}

function editProject(idx) {
  const projects = JSON.parse(localStorage.getItem('projects')) || [];
  const project = projects[idx];

  document.getElementById('projectName').value = project.name;
  document.getElementById('projectCategory').value = project.category;
  document.getElementById('projectDescription').value = project.description;
  document.getElementById('projectStatus').value = project.status;
  document.getElementById('projectProgress').value = project.progress;
  document.getElementById('projectImage').value = project.image;
  document.getElementById('editProjectIndex').value = idx;

  showProjectForm();
}

function deleteProject(idx) {
  if (confirm('Delete this project?')) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.splice(idx, 1);
    localStorage.setItem('projects', JSON.stringify(projects));
    loadProjects();
  }
}

/**
 * Update dashboard counts
 */
function updateDashboardCounts() {
  const articles = JSON.parse(localStorage.getItem('articles')) || [];
  const media = JSON.parse(localStorage.getItem('mediaLibrary')) || [];
  const channels = JSON.parse(localStorage.getItem('channels')) || [];
  const projects = JSON.parse(localStorage.getItem('projects')) || [];

  document.getElementById('newsCount').textContent = articles.length;
  document.getElementById('mediaCount').textContent = media.length;
  document.getElementById('channelCount').textContent = channels.length;
  document.getElementById('projectCount').textContent = projects.length;

  // Update total content count
  const totalCount = articles.length + media.length + channels.length + projects.length;
  if (document.getElementById('totalContentCount')) {
    document.getElementById('totalContentCount').textContent = totalCount;
  }

  // Update last updated time
  if (document.getElementById('lastUpdated')) {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/**
 * ==================== STREAMING SETTINGS ====================
 */

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
  if (!text) {
    alert('Nothing to copy!');
    return;
  }

  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  }).catch(() => {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Copied to clipboard!');
  });
}

/**
 * Generate stream key and show configuration
 */
function generateStreamKey() {
  const streamName = document.getElementById('streamKeyInput').value.trim();

  if (!streamName) {
    alert('Please enter a stream name (e.g., main_channel, news_live)');
    return;
  }

  // Update the display
  const display = document.getElementById('generatedKeyDisplay');
  const rtmpUrl = document.getElementById('genRtmpUrl');
  const streamKey = document.getElementById('genStreamKey');
  const hlsUrl = document.getElementById('genHlsUrl');

  rtmpUrl.textContent = `rtmp://localhost:1935/live/${streamName}`;
  streamKey.textContent = streamName;
  hlsUrl.textContent = `http://localhost:8000/live/${streamName}/index.m3u8`;

  display.classList.remove('hidden');

  // Update the local stream key field
  document.getElementById('localStreamKey').value = streamName;
  document.getElementById('fullRtmpUrl').value = `rtmp://localhost:1935/live/${streamName}`;
}

/**
 * Auto-fill stream URL in channel form using generated key
 */
function autoFillStreamUrl() {
  const streamKeyInput = document.getElementById('streamKeyInput').value.trim();

  if (!streamKeyInput) {
    alert('Please generate a stream key first!');
    return;
  }

  // Fill the stream URL field with the generated RTMP URL
  document.getElementById('streamUrl').value = `rtmp://localhost:1935/live/${streamKeyInput}`;

  // Optionally scroll to show the filled field
  document.getElementById('streamUrl').focus();
  alert(`✅ Stream URL auto-filled! Now fill in other details and click "Save Channel"`);
}

/**
 * Save streaming settings to localStorage and sync with API
 */
async function saveStreamingSettings() {
  const streamName = document.getElementById('streamKeyInput').value.trim();

  if (!streamName) {
    alert('Please generate a stream key first');
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api/settings'
      : '/api/settings';

    const settingsToSave = {
      streaming: {
        rtmpServer: {
          address: 'rtmp://localhost:1935/live',
          port: 1935,
          status: 'online'
        },
        hlsServer: {
          address: 'http://localhost:8000',
          port: 8000,
          status: 'online'
        },
        savedStreamKey: streamName,
        timestamp: new Date().toISOString()
      }
    };

    // Step 1: Save settings to database
    console.log('💾 Saving settings to database...');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings: settingsToSave }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to save settings: ${response.status}`);
    }

    console.log('✅ Settings saved to database');

    // Step 2: Refresh display from database
    await displaySavedSettings();
    alert('✅ Streaming settings saved successfully to database!');
  } catch (error) {
    console.error('❌ Error saving streaming settings:', error);
    alert('Error saving settings: ' + error.message + '\n\nEnsure the server is running on port 3000.');
  }
}

/**
 * Display saved streaming settings (loaded from database)
 */
async function displaySavedSettings() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api/settings'
      : '/api/settings';

    // Load settings from database (not localStorage)
    console.log('📥 Loading settings from database...');
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to load settings from database');
    }

    const result = await response.json();
    const settings = result.settings;
    const display = document.getElementById('savedSettingsDisplay');

    if (!settings || !settings.streaming) {
      display.innerHTML = '<p class="text-gray-500">No saved streaming settings in database</p>';
      return;
    }

    // Build the settings display from database values
    const streamName = settings.streaming.savedStreamKey || 'N/A';
    const rtmpUrl = `rtmp://localhost:1935/live/${streamName}`;
    const hlsUrl = `http://localhost:8000/live/${streamName}/index.m3u8`;
    const timestamp = settings.streaming.timestamp || new Date().toISOString();

    display.innerHTML = `
      <div class="space-y-3 text-sm">
        <div class="bg-blue-50 border border-blue-200 rounded p-3">
          <strong class="text-blue-900">Stream Name:</strong>
          <code class="text-blue-700">${streamName}</code>
        </div>
        <div class="bg-green-50 border border-green-200 rounded p-3">
          <strong class="text-green-900">RTMP URL:</strong>
          <code class="text-green-700 break-all">${rtmpUrl}</code>
          <button onclick="copyToClipboard('${rtmpUrl}')" class="ml-2 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">📋 Copy</button>
        </div>
        <div class="bg-purple-50 border border-purple-200 rounded p-3">
          <strong class="text-purple-900">HLS URL:</strong>
          <code class="text-purple-700 break-all">${hlsUrl}</code>
          <button onclick="copyToClipboard('${hlsUrl}')" class="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs">📋 Copy</button>
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded p-3 text-xs">
          <strong>Last Saved:</strong> ${new Date(timestamp).toLocaleString()}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    const display = document.getElementById('savedSettingsDisplay');
    display.innerHTML = '<p class="text-red-600">Error loading settings from database</p>';
  }
}

/**
 * Clear saved streaming settings
 */
function clearStreamingSettings() {
  if (confirm('Are you sure you want to clear saved streaming settings?')) {
    localStorage.removeItem('streamingSettings');
    displaySavedSettings();
    document.getElementById('generatedKeyDisplay').classList.add('hidden');
    document.getElementById('streamKeyInput').value = '';
    document.getElementById('localStreamKey').value = '';
    alert('Streaming settings cleared');
  }
}

// Load saved settings when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadSettingsFromServer();
  displaySavedSettings();
  initializeViewCounterUI();
}, { once: true });

/**
 * Load settings from API server
 */
function loadSettingsFromServer() {
  try {
    const apiUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3000/api/settings'
      : '/api/settings';

    fetch(apiUrl, { method: 'GET', signal: AbortSignal.timeout(3000) })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Failed to load settings from API');
      })
      .then(data => {
        if (data.settings) {
          console.log('✅ Loaded settings from API server');
          // Cache settings in localStorage
          localStorage.setItem('appSettings', JSON.stringify(data.settings));
        }
      })
      .catch(err => {
        console.log('⚠️ Could not load settings from API, using localStorage cache:', err.message);
        // Try to load from localStorage fallback
        const cached = localStorage.getItem('appSettings');
        if (cached) {
          console.log('📦 Using cached settings from localStorage');
        }
      });
  } catch (error) {
    console.log('⚠️ Error loading settings:', error.message);
  }
}

/**
 * Stream Type Helper
 */
function updateStreamUrlPlaceholder() {
  const streamType = document.getElementById('streamType').value;
  const streamUrlInput = document.getElementById('streamUrl');
  const streamUrlHint = document.getElementById('streamUrlHint');

  const placeholders = {
    rtmp: 'rtmp://localhost:1935/live/stream_name',
    hls: 'https://example.com/live/stream/index.m3u8',
    youtube: 'https://youtube.com/live/VIDEO_ID',
    mp4: 'https://example.com/videos/stream.mp4'
  };

  const hints = {
    rtmp: 'Example: rtmp://localhost:1935/live/channel_name',
    hls: 'Example: https://example.com/live/stream/index.m3u8',
    youtube: 'Example: https://youtube.com/live/dQw4w9WgXcQ',
    mp4: 'Example: https://example.com/videos/livestream.mp4'
  };

  streamUrlInput.placeholder = placeholders[streamType] || placeholders.rtmp;
  streamUrlHint.textContent = hints[streamType] || hints.rtmp;
}

/**
 * View Counter Functions
 */

// Initialize the view counter UI
function initializeViewCounterUI() {
  const channels = JSON.parse(localStorage.getItem('channels')) || [];
  const select = document.getElementById('viewCounterChannel');

  if (select) {
    select.innerHTML = '<option value="">Choose a channel...</option>' +
      channels.map(ch => `<option value="${ch.id}">${ch.number}. ${ch.name}</option>`).join('');

    select.addEventListener('change', updateViewCounterDisplay);
  }
}

// Update the view counter display when a channel is selected
function updateViewCounterDisplay() {
  const select = document.getElementById('viewCounterChannel');
  const selectedId = select.value;

  if (!selectedId) {
    document.getElementById('currentViews').textContent = '0';
    document.getElementById('viewAction').textContent = 'Select a channel to proceed';
    return;
  }

  const channels = JSON.parse(localStorage.getItem('channels')) || [];
  const channel = channels.find(ch => ch.id === selectedId);

  if (channel) {
    document.getElementById('currentViews').textContent = (channel.viewers || 0).toLocaleString();
    document.getElementById('viewAction').textContent = `Managing views for: ${channel.name}`;
  }
}

// Increment views by a fixed amount
function incrementViews(amount) {
  const select = document.getElementById('viewCounterChannel');
  const selectedId = select.value;

  if (!selectedId) {
    alert('Please select a channel first');
    return;
  }

  let channels = JSON.parse(localStorage.getItem('channels')) || [];
  const channelIndex = channels.findIndex(ch => ch.id === selectedId);

  if (channelIndex !== -1) {
    channels[channelIndex].viewers = (channels[channelIndex].viewers || 0) + amount;
    localStorage.setItem('channels', JSON.stringify(channels));
    updateChannelsJson(channels);
    updateViewCounterDisplay();
  }
}

// Add custom number of views
function addCustomViews() {
  const select = document.getElementById('viewCounterChannel');
  const selectedId = select.value;
  const customCount = parseInt(document.getElementById('customViewCount').value) || 0;

  if (!selectedId) {
    alert('Please select a channel first');
    return;
  }

  if (customCount <= 0) {
    alert('Please enter a valid number');
    return;
  }

  let channels = JSON.parse(localStorage.getItem('channels')) || [];
  const channelIndex = channels.findIndex(ch => ch.id === selectedId);

  if (channelIndex !== -1) {
    channels[channelIndex].viewers = (channels[channelIndex].viewers || 0) + customCount;
    localStorage.setItem('channels', JSON.stringify(channels));
    updateChannelsJson(channels);
    updateViewCounterDisplay();
    document.getElementById('customViewCount').value = '';
    alert(`Added ${customCount} views!`);
  }
}

// Set exact view count
function setViewCount() {
  const select = document.getElementById('viewCounterChannel');
  const selectedId = select.value;
  const newCount = parseInt(document.getElementById('customViewCount').value) || 0;

  if (!selectedId) {
    alert('Please select a channel first');
    return;
  }

  if (newCount < 0) {
    alert('Please enter a valid number');
    return;
  }

  let channels = JSON.parse(localStorage.getItem('channels')) || [];
  const channelIndex = channels.findIndex(ch => ch.id === selectedId);

  if (channelIndex !== -1) {
    channels[channelIndex].viewers = newCount;
    localStorage.setItem('channels', JSON.stringify(channels));
    updateChannelsJson(channels);
    updateViewCounterDisplay();
    document.getElementById('customViewCount').value = '';
    alert(`Set view count to ${newCount}!`);
  }
}

// Reset views to 0
function resetViews() {
  const select = document.getElementById('viewCounterChannel');
  const selectedId = select.value;

  if (!selectedId) {
    alert('Please select a channel first');
    return;
  }

  if (!confirm('Are you sure you want to reset views to 0?')) {
    return;
  }

  let channels = JSON.parse(localStorage.getItem('channels')) || [];
  const channelIndex = channels.findIndex(ch => ch.id === selectedId);

  if (channelIndex !== -1) {
    channels[channelIndex].viewers = 0;
    localStorage.setItem('channels', JSON.stringify(channels));
    updateChannelsJson(channels);
    updateViewCounterDisplay();
    alert('Views reset to 0!');
  }
}

/**
 * Handle thumbnail upload
 */
function handleThumbnailUpload(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  // Check file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('File size must be less than 2MB');
    fileInput.value = '';
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file (PNG, JPG, WebP)');
    fileInput.value = '';
    return;
  }

  // Read file and convert to base64
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Data = e.target.result;

    // Store in hidden input
    document.getElementById('thumbnailData').value = base64Data;

    // Show preview
    const preview = document.getElementById('thumbnailPreview');
    const uploadHint = document.getElementById('thumbnailUploadHint');
    const clearBtn = document.getElementById('clearThumbnailBtn');

    document.getElementById('thumbnailImg').src = base64Data;
    preview.classList.remove('hidden');
    uploadHint.classList.add('hidden');
    clearBtn.classList.remove('hidden');

    console.log('📸 Thumbnail uploaded:', file.name);
  };

  reader.readAsDataURL(file);
}

/**
 * Clear thumbnail
 */
function clearThumbnail() {
  document.getElementById('thumbnailInput').value = '';
  document.getElementById('thumbnailData').value = '';

  const preview = document.getElementById('thumbnailPreview');
  const uploadHint = document.getElementById('thumbnailUploadHint');
  const clearBtn = document.getElementById('clearThumbnailBtn');

  preview.classList.add('hidden');
  uploadHint.classList.remove('hidden');
  clearBtn.classList.add('hidden');

  console.log('🗑️ Thumbnail cleared');
}

/**
 * Load thumbnail when editing a channel
 */
function loadThumbnailForChannel(channelData) {
  const thumbnailData = channelData.thumbnail;

  if (thumbnailData) {
    // Show preview
    const preview = document.getElementById('thumbnailPreview');
    const uploadHint = document.getElementById('thumbnailUploadHint');
    const clearBtn = document.getElementById('clearThumbnailBtn');

    document.getElementById('thumbnailImg').src = thumbnailData;
    document.getElementById('thumbnailData').value = thumbnailData;

    preview.classList.remove('hidden');
    uploadHint.classList.add('hidden');
    clearBtn.classList.remove('hidden');
  }
}

/**
 * Clear form when hiding channel form
 */
const originalHideChannelForm = window.hideChannelForm || function() {};
window.hideChannelForm = function() {
  clearThumbnail();
  document.getElementById('formChannel').reset();
  document.getElementById('channelForm').classList.add('hidden');
  originalHideChannelForm();
};

// ========== GALLERY MANAGEMENT FUNCTIONS ==========

let galleryData = { categories: [], media: [] };
let selectedMediaFile = null;
let createNewCategoryMode = false;

/**
 * Load gallery data from server
 */
async function loadGalleryData() {
  try {
    const response = await fetch('/api/gallery/categories?admin=true');
    const data = await response.json();
    galleryData.categories = data.categories || [];

    // Load all media
    const mediaResponse = await fetch('/api/gallery/categories?admin=true');
    const mediaData = await mediaResponse.json();

    updateCategorySelects();
    displayCategories();
    loadAllMedia();
  } catch (error) {
    console.error('Error loading gallery data:', error);
    alert('Failed to load gallery data');
  }
}

/**
 * Show gallery tab
 */
function showGalleryTab(tabName) {
  // Hide all tabs
  document.getElementById('galleryUploadTab').classList.add('hidden');
  document.getElementById('galleryCategoriesTab').classList.add('hidden');
  document.getElementById('galleryMediaTab').classList.add('hidden');

  // Show selected tab
  if (tabName === 'upload') {
    document.getElementById('galleryUploadTab').classList.remove('hidden');
    document.getElementById('galleryTabUpload').classList.add('bg-white/20');
    document.getElementById('galleryTabUpload').classList.remove('bg-white/10');
    document.getElementById('galleryTabCategories').classList.remove('bg-white/20');
    document.getElementById('galleryTabCategories').classList.add('bg-white/10');
    document.getElementById('galleryTabMedia').classList.remove('bg-white/20');
    document.getElementById('galleryTabMedia').classList.add('bg-white/10');
  } else if (tabName === 'categories') {
    document.getElementById('galleryCategoriesTab').classList.remove('hidden');
    displayCategories();
    document.getElementById('galleryTabCategories').classList.add('bg-white/20');
    document.getElementById('galleryTabCategories').classList.remove('bg-white/10');
    document.getElementById('galleryTabUpload').classList.remove('bg-white/20');
    document.getElementById('galleryTabUpload').classList.add('bg-white/10');
    document.getElementById('galleryTabMedia').classList.remove('bg-white/20');
    document.getElementById('galleryTabMedia').classList.add('bg-white/10');
  } else if (tabName === 'media') {
    document.getElementById('galleryMediaTab').classList.remove('hidden');
    loadAllMedia();
    document.getElementById('galleryTabMedia').classList.add('bg-white/20');
    document.getElementById('galleryTabMedia').classList.remove('bg-white/10');
    document.getElementById('galleryTabUpload').classList.remove('bg-white/20');
    document.getElementById('galleryTabUpload').classList.add('bg-white/10');
    document.getElementById('galleryTabCategories').classList.remove('bg-white/20');
    document.getElementById('galleryTabCategories').classList.add('bg-white/10');
  }
}

/**
 * Handle media file selection
 */
function handleMediaFileSelect(event) {
  const input = document.getElementById('mediaFileInput');
  const file = input.files[0];

  if (!file) return;

  selectedMediaFile = file;

  // Show preview
  const preview = document.getElementById('mediaPreview');
  const previewImg = document.getElementById('mediaPreviewImg');
  const previewVideo = document.getElementById('mediaPreviewVideo');

  const reader = new FileReader();
  reader.onload = (e) => {
    const isVideo = file.type.startsWith('video/');

    if (isVideo) {
      previewImg.classList.add('hidden');
      previewVideo.classList.remove('hidden');
      previewVideo.src = e.target.result;
    } else {
      previewVideo.classList.add('hidden');
      previewImg.classList.remove('hidden');
      previewImg.src = e.target.result;
    }

    preview.classList.remove('hidden');
  };

  reader.readAsDataURL(file);

  // Set default media name
  const fileName = file.name.split('.')[0];
  document.getElementById('mediaName').value = fileName;
}

/**
 * Drag and drop file upload
 */
document.addEventListener('DOMContentLoaded', function() {
  const dropZone = document.getElementById('uploadDropZone');
  if (!dropZone) return;

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('bg-purple-400/20');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('bg-purple-400/20');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('bg-purple-400/20');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      document.getElementById('mediaFileInput').files = files;
      handleMediaFileSelect();
    }
  });
});

/**
 * Toggle new category input
 */
function toggleNewCategory() {
  createNewCategoryMode = !createNewCategoryMode;
  const input = document.getElementById('newCategoryInput');
  const select = document.getElementById('galleryCategory');

  if (createNewCategoryMode) {
    input.classList.remove('hidden');
    select.classList.add('hidden');
    select.value = '';
  } else {
    input.classList.add('hidden');
    select.classList.remove('hidden');
    document.getElementById('newCategoryName').value = '';
  }
}

/**
 * Update category selects
 */
function updateCategorySelects() {
  const select = document.getElementById('galleryCategory');
  const filterSelect = document.getElementById('mediaFilterCategory');

  select.innerHTML = '<option value="">Select Category...</option>';
  filterSelect.innerHTML = '<option value="">All Categories</option>';

  galleryData.categories.forEach(cat => {
    const option1 = document.createElement('option');
    option1.value = cat.id;
    option1.textContent = `${cat.name} (${cat.mediaCount || 0})`;
    select.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = cat.id;
    option2.textContent = `${cat.name} (${cat.mediaCount || 0})`;
    filterSelect.appendChild(option2);
  });
}

/**
 * Upload media to category
 */
async function uploadMedia() {
  if (!selectedMediaFile) {
    alert('Please select a media file');
    return;
  }

  const mediaName = document.getElementById('mediaName').value.trim();
  const mediaDescription = document.getElementById('mediaDescription').value.trim();
  let categoryId = document.getElementById('galleryCategory').value;

  if (createNewCategoryMode) {
    const categoryName = document.getElementById('newCategoryName').value.trim();
    if (!categoryName) {
      alert('Please enter a category name');
      return;
    }
    categoryId = null;
  } else if (!categoryId) {
    alert('Please select or create a category');
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedMediaFile);
  formData.append('mediaName', mediaName);
  formData.append('mediaDescription', mediaDescription);
  formData.append('categoryId', categoryId);
  formData.append('categoryName', createNewCategoryMode ? document.getElementById('newCategoryName').value : '');
  formData.append('isNewCategory', createNewCategoryMode ? 'true' : 'false');

  try {
    // Show progress
    const progressDiv = document.getElementById('uploadProgress');
    progressDiv.classList.remove('hidden');

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 90) progress = 90;
      updateUploadProgress(progress);
    }, 200);

    const response = await fetch('/api/gallery/upload', {
      method: 'POST',
      body: formData
    });

    clearInterval(progressInterval);
    updateUploadProgress(100);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();

    // Success message
    setTimeout(() => {
      alert(`✅ ${result.media.type === 'video' ? 'Video' : 'Photo'} uploaded successfully!`);

      // Reset form
      document.getElementById('mediaFileInput').value = '';
      document.getElementById('mediaName').value = '';
      document.getElementById('mediaDescription').value = '';
      document.getElementById('newCategoryName').value = '';
      document.getElementById('newCategoryInput').classList.add('hidden');
      document.getElementById('galleryCategory').classList.remove('hidden');
      document.getElementById('mediaPreview').classList.add('hidden');
      progressDiv.classList.add('hidden');
      createNewCategoryMode = false;
      selectedMediaFile = null;

      // Reload gallery data
      loadGalleryData();
    }, 500);
  } catch (error) {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error.message}`);
    document.getElementById('uploadProgress').classList.add('hidden');
  }
}

/**
 * Update upload progress bar
 */
function updateUploadProgress(percent) {
  document.getElementById('uploadPercent').textContent = Math.round(percent) + '%';
  document.getElementById('uploadBar').style.width = percent + '%';
}

/**
 * Show create category form
 */
function showCreateCategoryForm() {
  document.getElementById('createCategoryForm').classList.remove('hidden');
}

/**
 * Cancel create category
 */
function cancelCreateCategory() {
  document.getElementById('createCategoryForm').classList.add('hidden');
  document.getElementById('catName').value = '';
  document.getElementById('catDescription').value = '';
  document.getElementById('catPublic').checked = true;
}

/**
 * Create category
 */
async function createCategory() {
  const name = document.getElementById('catName').value.trim();
  const description = document.getElementById('catDescription').value.trim();
  const isPublic = document.getElementById('catPublic').checked;

  if (!name) {
    alert('Please enter a category name');
    return;
  }

  try {
    const response = await fetch('/api/gallery/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, isPublic })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create category');
    }

    const result = await response.json();
    alert('✅ Category created successfully!');

    cancelCreateCategory();
    loadGalleryData();
  } catch (error) {
    console.error('Error creating category:', error);
    alert(`Failed to create category: ${error.message}`);
  }
}

/**
 * Display categories
 */
async function displayCategories() {
  try {
    const response = await fetch('/api/gallery/categories?admin=true');
    const data = await response.json();
    galleryData.categories = data.categories || [];

    const list = document.getElementById('categoriesList');
    list.innerHTML = '';

    if (galleryData.categories.length === 0) {
      list.innerHTML = '<p class="text-gray-400 col-span-full text-center py-8">No categories yet. Create one to get started!</p>';
      return;
    }

    galleryData.categories.forEach(category => {
      const card = document.createElement('div');
      card.className = 'bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition';
      card.innerHTML = `
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <h3 class="text-white font-bold text-lg">${category.name}</h3>
            <p class="text-gray-400 text-sm">${category.mediaCount || 0} items</p>
            ${category.description ? `<p class="text-gray-300 text-sm mt-2">${category.description}</p>` : ''}
          </div>
          <span class="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
            ${category.isPublic ? '🌐 Public' : '🔒 Private'}
          </span>
        </div>
        <div class="flex gap-2">
          <button onclick="toggleCategoryPublic('${category.id}', ${category.isPublic})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition">
            ${category.isPublic ? '🔒 Make Private' : '🌐 Make Public'}
          </button>
          <button onclick="deleteCategory('${category.id}')" class="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition">
            🗑️ Delete
          </button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error displaying categories:', error);
  }
}

/**
 * Toggle category public/private
 */
async function toggleCategoryPublic(categoryId, currentPublic) {
  try {
    const response = await fetch(`/api/gallery/categories/${categoryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublic: !currentPublic })
    });

    if (!response.ok) throw new Error('Failed to update');

    alert('✅ Category updated!');
    displayCategories();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

/**
 * Delete category
 */
async function deleteCategory(categoryId) {
  if (!confirm('Delete this category and all its media?')) return;

  try {
    const response = await fetch(`/api/gallery/categories/${categoryId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete');

    alert('✅ Category deleted!');
    loadGalleryData();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

/**
 * Load all media
 */
async function loadAllMedia() {
  try {
    const response = await fetch('/api/gallery/categories?admin=true');
    const data = await response.json();
    galleryData.categories = data.categories || [];

    const list = document.getElementById('mediaList');
    list.innerHTML = '';

    let allMedia = [];
    for (const category of galleryData.categories) {
      const mediaResponse = await fetch(`/api/gallery/categories/${category.id}/media?admin=true`);
      const mediaData = await mediaResponse.json();
      allMedia = allMedia.concat(mediaData.media || []);
    }

    if (allMedia.length === 0) {
      list.innerHTML = '<p class="text-gray-400 col-span-full text-center py-8">No media uploaded yet</p>';
      return;
    }

    allMedia.forEach(media => {
      const card = document.createElement('div');
      card.className = 'bg-white/10 rounded-lg overflow-hidden border border-white/20 hover:bg-white/15 transition';

      const category = galleryData.categories.find(c => c.id === media.categoryId);
      const mediaType = media.type === 'video' ? '🎬' : '📷';

      card.innerHTML = `
        <div class="aspect-square bg-black/50 overflow-hidden">
          ${media.type === 'video'
            ? `<video src="${media.url}" class="w-full h-full object-cover" style="background: #000;"></video>`
            : `<img src="${media.url}" alt="${media.name}" class="w-full h-full object-cover">`
          }
        </div>
        <div class="p-3">
          <p class="text-white font-bold text-sm truncate">${mediaType} ${media.name}</p>
          <p class="text-gray-400 text-xs">${category?.name || 'Unknown'}</p>
          <p class="text-gray-500 text-xs mt-1">${(media.fileSize / 1024 / 1024).toFixed(2)}MB</p>
          <button onclick="deleteMedia('${media.id}')" class="w-full bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded mt-2 font-medium transition">
            🗑️ Delete
          </button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading media:', error);
  }
}

/**
 * Filter media by category
 */
async function filterMediaByCategory() {
  const categoryId = document.getElementById('mediaFilterCategory').value;

  try {
    const list = document.getElementById('mediaList');
    list.innerHTML = '<p class="text-gray-400 col-span-full text-center">Loading...</p>';

    if (!categoryId) {
      loadAllMedia();
      return;
    }

    const response = await fetch(`/api/gallery/categories/${categoryId}/media?admin=true`);
    const data = await response.json();
    const media = data.media || [];

    list.innerHTML = '';

    if (media.length === 0) {
      list.innerHTML = '<p class="text-gray-400 col-span-full text-center py-8">No media in this category</p>';
      return;
    }

    media.forEach(m => {
      const card = document.createElement('div');
      card.className = 'bg-white/10 rounded-lg overflow-hidden border border-white/20 hover:bg-white/15 transition';
      const mediaType = m.type === 'video' ? '🎬' : '📷';

      card.innerHTML = `
        <div class="aspect-square bg-black/50 overflow-hidden">
          ${m.type === 'video'
            ? `<video src="${m.url}" class="w-full h-full object-cover"></video>`
            : `<img src="${m.url}" alt="${m.name}" class="w-full h-full object-cover">`
          }
        </div>
        <div class="p-3">
          <p class="text-white font-bold text-sm truncate">${mediaType} ${m.name}</p>
          <p class="text-gray-500 text-xs mt-1">${(m.fileSize / 1024 / 1024).toFixed(2)}MB</p>
          <button onclick="deleteMedia('${m.id}')" class="w-full bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded mt-2 font-medium transition">
            🗑️ Delete
          </button>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (error) {
    console.error('Error filtering media:', error);
  }
}

/**
 * Delete media
 */
async function deleteMedia(mediaId) {
  if (!confirm('Delete this media?')) return;

  try {
    const response = await fetch(`/api/gallery/media/${mediaId}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete');

    alert('✅ Media deleted!');
    loadAllMedia();
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

// Load gallery data when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadGalleryData();
});

// ========== MP4 UPLOAD FUNCTIONS ==========

let selectedMp4File = null;
let mp4UploadedUrl = null;

/**
 * Override updateStreamUrlPlaceholder to show/hide MP4 section
 */
const originalUpdateStreamUrlPlaceholder = window.updateStreamUrlPlaceholder || function() {};
window.updateStreamUrlPlaceholder = function() {
  const streamType = document.getElementById('streamType').value;
  const mp4Section = document.getElementById('mp4UploadSection');
  const streamUrlInput = document.getElementById('streamUrl');
  const hint = document.getElementById('streamUrlHint');

  if (streamType === 'mp4') {
    mp4Section.classList.remove('hidden');
    streamUrlInput.placeholder = 'Will be auto-filled from upload or paste URL here';
  } else {
    mp4Section.classList.add('hidden');
    clearMp4Upload();
  }

  originalUpdateStreamUrlPlaceholder();
};

/**
 * Toggle between URL and upload mode for MP4
 */
function toggleMp4Mode(mode) {
  const uploadSection = document.getElementById('mp4FileUploadSection');
  const streamUrl = document.getElementById('streamUrl');

  if (mode === 'upload') {
    uploadSection.classList.remove('hidden');
    streamUrl.placeholder = 'Will be auto-filled from file upload';
    streamUrl.disabled = true;
  } else {
    uploadSection.classList.add('hidden');
    streamUrl.placeholder = 'Paste your MP4 URL here';
    streamUrl.disabled = false;
    streamUrl.value = '';
    clearMp4Upload();
  }
}

/**
 * Handle MP4 file selection
 */
function handleMp4FileSelect(input) {
  const file = input.files[0];

  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('video/') && !file.name.endsWith('.mp4')) {
    alert('Please select a valid MP4 video file');
    return;
  }

  // Validate file size (50MB max)
  if (file.size > 52428800) {
    alert('File size exceeds 50MB limit');
    return;
  }

  selectedMp4File = file;

  // Show preview
  const preview = document.getElementById('mp4FilePreview');
  const videoPreview = document.getElementById('mp4VideoPreview');
  const fileName = document.getElementById('mp4FileName');

  const reader = new FileReader();
  reader.onload = (e) => {
    videoPreview.src = e.target.result;
    fileName.textContent = `📹 ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    preview.classList.remove('hidden');
  };

  reader.readAsDataURL(file);
}

/**
 * Clear MP4 upload
 */
function clearMp4Upload() {
  selectedMp4File = null;
  mp4UploadedUrl = null;
  document.getElementById('mp4FileInput').value = '';
  document.getElementById('mp4FilePreview').classList.add('hidden');
  document.getElementById('mp4UploadProgress').classList.add('hidden');
  document.getElementById('streamUrl').value = '';
}

/**
 * Upload MP4 to Supabase
 */
async function uploadMp4File() {
  if (!selectedMp4File) {
    alert('Please select an MP4 file');
    return false;
  }

  const progressDiv = document.getElementById('mp4UploadProgress');
  progressDiv.classList.remove('hidden');

  const formData = new FormData();
  formData.append('file', selectedMp4File);

  try {
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress > 90) progress = 90;
      updateMp4UploadProgress(progress);
    }, 200);

    const response = await fetch('/api/gallery/upload', {
      method: 'POST',
      body: formData
    });

    clearInterval(progressInterval);
    updateMp4UploadProgress(100);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    mp4UploadedUrl = result.media.url;

    // Auto-fill the stream URL
    document.getElementById('streamUrl').value = mp4UploadedUrl;

    console.log('✅ MP4 uploaded:', mp4UploadedUrl);
    alert('✅ MP4 file uploaded successfully!');

    return true;
  } catch (error) {
    console.error('Upload error:', error);
    alert(`Upload failed: ${error.message}`);
    progressDiv.classList.add('hidden');
    return false;
  }
}

/**
 * Update MP4 upload progress
 */
function updateMp4UploadProgress(percent) {
  document.getElementById('mp4UploadPercent').textContent = Math.round(percent) + '%';
  document.getElementById('mp4UploadBar').style.width = percent + '%';
}

/**
 * Override saveChannel to handle MP4 uploads
 */
const originalSaveChannel = window.saveChannel || function() {};
window.saveChannel = async function() {
  const streamType = document.getElementById('streamType').value;

  // If MP4 mode with file upload, upload file first
  if (streamType === 'mp4') {
    const mp4Mode = document.querySelector('input[name="mp4Mode"]:checked').value;
    if (mp4Mode === 'upload' && selectedMp4File && !mp4UploadedUrl) {
      const uploaded = await uploadMp4File();
      if (!uploaded) {
        return;
      }
    }
  }

  // Call original save function
  originalSaveChannel();
};
