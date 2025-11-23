/**
 * CAPD Digital TV - Reusable Components
 * Eliminates code duplication across pages
 */

const Components = {
  /**
   * Create header/navigation bar
   */
  createHeader() {
    return `
      <header class="bg-gradient-to-r from-gray-900 to-black text-white p-4 shadow-lg sticky top-0 z-40">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-lg">TV</div>
            <div>
              <h1 class="text-2xl font-bold">CAPD Digital TV</h1>
              <p class="text-xs text-gray-400">Community Broadcasting Platform</p>
            </div>
          </div>
          <nav class="flex gap-6 text-sm">
            <a href="index.html" class="hover:text-red-500 transition">Home</a>
            <a href="live.html" class="hover:text-red-500 transition">Live</a>
            <a href="schedule.html" class="hover:text-red-500 transition">Schedule</a>
            <a href="news.html" class="hover:text-red-500 transition">News</a>
            <a href="about.html" class="hover:text-red-500 transition">About</a>
          </nav>
        </div>
      </header>
    `;
  },

  /**
   * Create footer
   */
  createFooter() {
    return `
      <footer class="bg-gray-900 text-gray-400 mt-12 border-t border-gray-700">
        <div class="max-w-7xl mx-auto p-6">
          <div class="grid grid-cols-3 gap-8 mb-8">
            <div>
              <h4 class="text-white font-bold mb-4">About CAPD</h4>
              <p class="text-sm leading-relaxed">Community Action and Development Partners bringing quality content and information to every household.</p>
            </div>
            <div>
              <h4 class="text-white font-bold mb-4">Quick Links</h4>
              <ul class="text-sm space-y-2">
                <li><a href="#" class="hover:text-red-500 transition">Contact Us</a></li>
                <li><a href="#" class="hover:text-red-500 transition">Terms & Conditions</a></li>
                <li><a href="#" class="hover:text-red-500 transition">Privacy Policy</a></li>
                <li><a href="#" class="hover:text-red-500 transition">Feedback</a></li>
              </ul>
            </div>
            <div>
              <h4 class="text-white font-bold mb-4">Contact</h4>
              <p class="text-sm">📧 info@capd.ng</p>
              <p class="text-sm">📱 +234 801 234 5678</p>
              <p class="text-sm">🕐 24/7 Service</p>
            </div>
          </div>
          <div class="border-t border-gray-700 pt-6 text-center text-xs">
            <p>&copy; 2025 CAPD Communications. All rights reserved.</p>
          </div>
        </div>
      </footer>
    `;
  },

  /**
   * Create animated typewriter hero section
   */
  createHeroSection(title, subtitle) {
    return `
      <section class="bg-gradient-to-b from-red-900 to-gray-900 text-white py-12 relative overflow-hidden">
        <div class="max-w-4xl mx-auto px-4 text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-4">${title}</h1>
          <p class="text-xl md:text-2xl text-red-300" id="typewriter">${subtitle}</p>
          <div class="mt-4 flex gap-2 justify-center">
            <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-red-300">Live Broadcasting</span>
          </div>
        </div>
      </section>
    `;
  },

  /**
   * Create channel card
   */
  createChannelCard(channel) {
    const statusClass = channel.status === 'live' ? 'bg-red-600' : 'bg-gray-600';
    const liveIndicator = channel.status === 'live' ? '<span class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded animate-pulse">● LIVE</span>' : '';

    return `
      <div class="channel-card bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition transform cursor-pointer" data-channel-id="${channel.id}">
        <div class="relative overflow-hidden bg-black aspect-video">
          <img src="${channel.poster}" alt="${channel.name}" class="w-full h-full object-cover opacity-70 hover:opacity-100 transition">
          ${liveIndicator}
        </div>
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <div>
              <p class="text-xs text-gray-400">Channel ${channel.number}</p>
              <h3 class="text-lg font-bold text-white">${channel.name}</h3>
            </div>
            <span class="text-xs ${statusClass} px-2 py-1 rounded">${channel.status.toUpperCase()}</span>
          </div>
          <p class="text-sm text-gray-300 mb-3">${channel.description}</p>
          <div class="flex justify-between items-center text-xs text-gray-400">
            <span>👥 ${channel.viewers} viewers</span>
            <button class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition">Watch</button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Create program grid item
   */
  createProgramItem(program) {
    const isLive = Utils.isProgramLive(program.startTime, program.endTime);
    const liveClass = isLive ? 'ring-2 ring-red-500' : '';
    const timeUntil = isLive ? 'LIVE NOW' : `Starts ${Utils.getTimeUntil(program.startTime)}`;

    return `
      <div class="program-card bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition ${liveClass}">
        <div class="relative bg-black aspect-video overflow-hidden">
          <img src="${program.image}" alt="${program.title}" class="w-full h-full object-cover opacity-80 hover:opacity-100 transition">
          ${isLive ? '<div class="absolute inset-0 bg-red-900 bg-opacity-30 flex items-center justify-center"><span class="bg-red-600 text-white px-3 py-1 rounded animate-pulse">● LIVE</span></div>' : ''}
        </div>
        <div class="p-4">
          <p class="text-xs text-gray-400 mb-1">${Utils.formatTime(program.startTime)} - ${Utils.formatTime(program.endTime)}</p>
          <h3 class="text-lg font-bold text-white mb-2">${program.title}</h3>
          <p class="text-sm text-gray-300 mb-3">${program.description}</p>
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-400">🎙️ ${program.host}</span>
            <span class="text-red-400 font-semibold">${timeUntil}</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Create news article card
   */
  createArticleCard(article) {
    const featuredClass = article.featured ? 'ring-2 ring-red-500' : '';
    const featuredBadge = article.featured ? '<span class="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">FEATURED</span>' : '';

    return `
      <a href="news.html?id=${article.id}" class="article-card bg-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition group ${featuredClass}">
        <div class="relative bg-black aspect-video overflow-hidden">
          <img src="${article.image}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300">
          ${featuredBadge}
        </div>
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">${article.category}</span>
            <span class="text-xs text-gray-400">${Utils.formatDate(article.date)}</span>
          </div>
          <h3 class="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition">${article.title}</h3>
          <p class="text-sm text-gray-300 mb-3 line-clamp-2">${article.description}</p>
          <div class="text-xs text-gray-400">By ${article.author}</div>
        </div>
      </a>
    `;
  },

  /**
   * Create announcement/ticker item
   */
  createAnnouncement(announcement) {
    const iconMap = {
      'alert': '⚠️',
      'info': 'ℹ️',
      'calendar': '📅',
      'check': '✅',
      'clock': '🕐'
    };
    const icon = iconMap[announcement.icon] || '📢';
    const priorityClass = announcement.priority === 'high' ? 'bg-red-900 border-red-600' :
                         announcement.priority === 'medium' ? 'bg-yellow-900 border-yellow-600' :
                         'bg-blue-900 border-blue-600';

    return `
      <div class="announcement bg-gray-800 border-l-4 ${priorityClass} p-4 rounded-r mb-3 text-white animate-slideIn">
        <div class="flex gap-3">
          <span class="text-2xl flex-shrink-0">${icon}</span>
          <div class="flex-grow">
            <h4 class="font-bold mb-1">${announcement.title}</h4>
            <p class="text-sm text-gray-300 mb-2">${announcement.content}</p>
            <p class="text-xs text-gray-500">${Utils.formatRelativeTime(announcement.timestamp)}</p>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Create comment element
   */
  createComment(comment) {
    return `
      <div class="comment bg-gray-700 rounded p-4 mb-3">
        <div class="flex gap-3 mb-2">
          <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
            ${comment.author.charAt(0).toUpperCase()}
          </div>
          <div class="flex-grow">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-white">${comment.author}</p>
                <p class="text-xs text-gray-400">${Utils.formatRelativeTime(comment.timestamp)}</p>
              </div>
            </div>
          </div>
        </div>
        <p class="text-gray-200 text-sm">${comment.text}</p>
      </div>
    `;
  },

  /**
   * Create loading skeleton
   */
  createSkeleton(type = 'card') {
    if (type === 'card') {
      return `
        <div class="animate-pulse bg-gray-800 rounded-lg overflow-hidden">
          <div class="bg-gray-700 aspect-video"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-gray-700 rounded w-3/4"></div>
            <div class="h-3 bg-gray-700 rounded"></div>
            <div class="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      `;
    }
  }
};
