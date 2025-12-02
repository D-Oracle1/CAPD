const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToSupabase, deleteFromSupabase, validateFileType, validateFileSize } = require('./supabase-storage');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  credentials: false,
  maxAge: 86400
}));

// Parse JSON request bodies
app.use(express.json({ limit: '5gb' }));
app.use(express.urlencoded({ limit: '5gb', extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.mkv', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${ext}`));
    }
  }
});

// IMPORTANT: Register API routes BEFORE static file middleware
// Otherwise static middleware will intercept /api/* requests and return 404

// Convert Google Drive sharing URL to direct playable URL
function convertGoogleDriveUrl(url) {
  if (!url.includes('drive.google.com')) {
    return url;
  }

  let fileId = null;

  // Format: https://drive.google.com/file/d/{FILE_ID}/view
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)\//);
  if (match1) {
    fileId = match1[1];
  }

  // Format: https://drive.google.com/open?id={FILE_ID}
  const match2 = url.match(/id=([a-zA-Z0-9-_]+)/);
  if (!fileId && match2) {
    fileId = match2[1];
  }

  if (fileId) {
    // Return direct playable URL using export=download for video streaming
    // This returns the actual file instead of an HTML preview page
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return url;
}

// Proxy endpoint for Google Drive streams
// Usage: /api/gdrive/stream?url=<encoded-google-drive-url>
app.get('/api/gdrive/stream', (req, res) => {
  const streamUrl = req.query.url;

  if (!streamUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const decodedUrl = decodeURIComponent(streamUrl);
    const directUrl = convertGoogleDriveUrl(decodedUrl);

    console.log('🔗 Google Drive stream requested');
    console.log('Original URL:', decodedUrl.substring(0, 50) + '...');
    console.log('Direct URL:', directUrl.substring(0, 50) + '...');

    // Create proxy middleware for Google Drive with streaming support
    const proxy = createProxyMiddleware({
      target: directUrl,
      changeOrigin: true,
      followRedirects: true,
      logLevel: 'warn',
      // Add custom headers for video streaming
      onProxyRes: (proxyRes, req, res) => {
        // Allow video streaming and range requests
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

        // Ensure proper content type for video
        if (proxyRes.headers['content-type']) {
          res.setHeader('Content-Type', proxyRes.headers['content-type']);
        } else {
          res.setHeader('Content-Type', 'video/mp4');
        }
      },
      onError: (err, req, res) => {
        console.error('❌ Google Drive proxy error:', err.message);
        res.status(500).json({ error: 'Failed to stream from Google Drive' });
      }
    });

    proxy(req, res);
  } catch (error) {
    console.error('❌ Google Drive proxy error:', error);
    res.status(500).json({ error: 'Invalid Google Drive URL' });
  }
});

// Proxy endpoint for streaming URLs
// Usage: /api/stream?url=<encoded-url>
app.get('/api/stream', (req, res) => {
  const streamUrl = req.query.url;

  if (!streamUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const decodedUrl = decodeURIComponent(streamUrl);

    // Check if it's a Google Drive URL and handle it
    if (decodedUrl.includes('drive.google.com')) {
      const directUrl = convertGoogleDriveUrl(decodedUrl);
      console.log('📁 Detected Google Drive URL, converting...');
      return res.redirect(`/api/gdrive/stream?url=${encodeURIComponent(directUrl)}`);
    }

    // Validate URL format
    if (!decodedUrl.match(/^https?:\/\//i)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Create proxy middleware dynamically
    const proxy = createProxyMiddleware({
      target: decodedUrl,
      changeOrigin: true,
      ws: true,
      logLevel: 'warn',
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Streaming server error' });
      }
    });

    proxy(req, res);
  } catch (error) {
    console.error('Stream proxy error:', error);
    res.status(500).json({ error: 'Invalid request' });
  }
});

// Stream proxy for HLS/DASH manifests and segments
app.use('/api/proxy', createProxyMiddleware({
  router: (req) => {
    const streamUrl = req.query.url;
    if (streamUrl) {
      return decodeURIComponent(streamUrl);
    }
    return null;
  },
  changeOrigin: true,
  logLevel: 'warn',
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Streaming server error' });
  }
}));

// ========== PASSCODE MANAGEMENT ENDPOINTS ==========

// Get passcode settings
app.get('/api/passcode', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, 'data', 'settings.json');
    let settings = { passcode: { enabled: false, code: null } };

    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
    }

    res.json({
      enabled: settings.passcode?.enabled || false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error loading passcode settings:', error);
    res.json({ enabled: false });
  }
});

// Verify passcode
app.post('/api/passcode/verify', (req, res) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({ verified: false, error: 'Passcode required' });
    }

    const settingsPath = path.join(__dirname, 'data', 'settings.json');
    let settings = { passcode: { enabled: false, code: null } };

    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
    }

    if (!settings.passcode?.enabled) {
      return res.json({ verified: true }); // If not enabled, allow access
    }

    const correct = settings.passcode?.code === passcode;
    res.json({ verified: correct });
  } catch (error) {
    console.error('Error verifying passcode:', error);
    res.status(500).json({ verified: false, error: 'Verification failed' });
  }
});

// Save passcode settings (Admin only)
app.post('/api/passcode/settings', (req, res) => {
  try {
    const { enabled, passcode } = req.body;

    const settingsPath = path.join(__dirname, 'data', 'settings.json');
    const dataDir = path.dirname(settingsPath);

    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let settings = { passcode: { enabled: false, code: null } };

    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      settings = JSON.parse(data);
    }

    settings.passcode = {
      enabled: enabled === true,
      code: passcode || null,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');

    console.log(`✅ Passcode settings updated - Enabled: ${enabled}`);
    res.json({ success: true, message: 'Passcode settings updated' });
  } catch (error) {
    console.error('Error saving passcode settings:', error);
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Supabase connectivity check
app.get('/api/supabase-check', async (req, res) => {
  try {
    console.log('🔍 Checking Supabase connectivity...');
    const { createClient } = require('@supabase/supabase-js');
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('./supabase-client.js');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Try to list buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Supabase connection failed',
        error: error.message,
        details: error
      });
    }

    const galleryBucketExists = buckets.some(b => b.name === 'gallery');

    res.json({
      status: 'ok',
      supabaseUrl: SUPABASE_URL,
      bucketsCount: buckets.length,
      buckets: buckets.map(b => b.name),
      galleryBucketExists: galleryBucketExists,
      message: galleryBucketExists ? '✅ Gallery bucket exists' : '⚠️ Gallery bucket not found'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Supabase check failed',
      error: error.message
    });
  }
});

// Get all channels (from JSON file)
app.get('/api/channels', (req, res) => {
  try {
    const channelsPath = path.join(__dirname, 'data', 'channels.json');
    const channelsData = fs.readFileSync(channelsPath, 'utf8');
    const data = JSON.parse(channelsData);
    res.json({ channels: data.channels || [] });
  } catch (error) {
    console.error('Error loading channels:', error);
    res.status(500).json({ error: 'Failed to load channels', channels: [] });
  }
});

// Save/Update all channels (from admin panel)
app.post('/api/channels', (req, res) => {
  try {
    const { channels } = req.body;

    if (!Array.isArray(channels)) {
      return res.status(400).json({ error: 'Channels must be an array' });
    }

    // Save to JSON file
    const channelsPath = path.join(__dirname, 'data', 'channels.json');
    const data = { channels };
    fs.writeFileSync(channelsPath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`✅ Saved ${channels.length} channels to JSON file`);
    res.json({
      message: 'Channels updated successfully',
      channels: channels
    });
  } catch (error) {
    console.error('Error saving channels:', error);
    res.status(500).json({ error: 'Failed to save channels' });
  }
});

// Get all settings (from JSON file)
app.get('/api/settings', (req, res) => {
  try {
    const settingsPath = path.join(__dirname, 'data', 'settings.json');
    const settingsData = fs.readFileSync(settingsPath, 'utf8');
    const data = JSON.parse(settingsData);
    res.json({ settings: data });
  } catch (error) {
    console.error('Error loading settings:', error);
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

// Save/Update settings (from admin panel)
app.post('/api/settings', (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings must be an object' });
    }

    // Save to JSON file
    const settingsPath = path.join(__dirname, 'data', 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');

    console.log('✅ Saved application settings to JSON file');
    res.json({
      message: 'Settings updated successfully',
      settings: settings
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Get active RTMP streams
app.get('/api/streams', (req, res) => {
  const fs = require('fs');
  const streamsFile = path.join(__dirname, '.streams.json');

  try {
    if (fs.existsSync(streamsFile)) {
      const streams = JSON.parse(fs.readFileSync(streamsFile, 'utf8'));
      res.json({ streams: streams, count: Object.keys(streams).length });
    } else {
      res.json({ streams: {}, count: 0 });
    }
  } catch (error) {
    res.json({ streams: {}, count: 0, error: error.message });
  }
});

// Get specific stream info
app.get('/api/streams/:name', (req, res) => {
  const fs = require('fs');
  const streamsFile = path.join(__dirname, '.streams.json');
  const streamName = req.params.name;

  try {
    if (fs.existsSync(streamsFile)) {
      const streams = JSON.parse(fs.readFileSync(streamsFile, 'utf8'));
      const stream = streams[streamName];

      if (stream) {
        res.json(stream);
      } else {
        res.status(404).json({ error: 'Stream not found', name: streamName });
      }
    } else {
      res.status(404).json({ error: 'Stream not found', name: streamName });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== GALLERY MANAGEMENT ENDPOINTS ==========

// Helper function to read gallery data
function readGallery() {
  try {
    const galleryPath = path.join(__dirname, 'data', 'gallery.json');
    if (!fs.existsSync(galleryPath)) {
      return { categories: [], media: [] };
    }
    const data = fs.readFileSync(galleryPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading gallery:', error);
    return { categories: [], media: [] };
  }
}

// Helper function to save gallery data
function saveGallery(data) {
  try {
    const galleryPath = path.join(__dirname, 'data', 'gallery.json');
    fs.writeFileSync(galleryPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving gallery:', error);
    return false;
  }
}

// Get all categories (filters public ones if not admin)
app.get('/api/gallery/categories', (req, res) => {
  try {
    const gallery = readGallery();
    const isAdmin = req.query.admin === 'true';

    const categories = isAdmin
      ? gallery.categories
      : gallery.categories.filter(cat => cat.isPublic);

    // Count media per category
    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      mediaCount: gallery.media.filter(m => m.categoryId === cat.id).length
    }));

    res.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get media in a category
app.get('/api/gallery/categories/:id/media', (req, res) => {
  try {
    const gallery = readGallery();
    const categoryId = req.params.id;
    const isAdmin = req.query.admin === 'true';

    const category = gallery.categories.find(cat => cat.id === categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (!isAdmin && !category.isPublic) {
      return res.status(403).json({ error: 'Category is not public' });
    }

    const media = gallery.media.filter(m => m.categoryId === categoryId);
    res.json({ media });
  } catch (error) {
    console.error('Error getting category media:', error);
    res.status(500).json({ error: 'Failed to get media' });
  }
});

// Create new category
app.post('/api/gallery/categories', (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const gallery = readGallery();
    const newCategory = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: name.trim(),
      description: description || '',
      isPublic: isPublic !== false,
      createdAt: new Date().toISOString(),
      mediaCount: 0,
      thumbnail: null
    };

    gallery.categories.push(newCategory);
    saveGallery(gallery);

    console.log(`✅ Created category: ${newCategory.name}`);
    res.json({ category: newCategory, message: 'Category created successfully' });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category (toggle public/private, edit name/description)
app.put('/api/gallery/categories/:id', (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, description, isPublic } = req.body;

    const gallery = readGallery();
    const categoryIndex = gallery.categories.findIndex(cat => cat.id === categoryId);

    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (name !== undefined) gallery.categories[categoryIndex].name = name.trim();
    if (description !== undefined) gallery.categories[categoryIndex].description = description;
    if (isPublic !== undefined) gallery.categories[categoryIndex].isPublic = isPublic;

    saveGallery(gallery);

    console.log(`✅ Updated category: ${categoryId}`);
    res.json({ category: gallery.categories[categoryIndex], message: 'Category updated' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category and its media
app.delete('/api/gallery/categories/:id', (req, res) => {
  try {
    const categoryId = req.params.id;
    const gallery = readGallery();

    // Find and delete all media in this category
    const mediaToDelete = gallery.media.filter(m => m.categoryId === categoryId);
    for (const media of mediaToDelete) {
      if (media.supabasePath) {
        deleteFromSupabase(media.supabasePath).catch(err =>
          console.error('Error deleting file from storage:', err)
        );
      }
    }

    // Remove media from gallery
    gallery.media = gallery.media.filter(m => m.categoryId !== categoryId);

    // Remove category
    gallery.categories = gallery.categories.filter(cat => cat.id !== categoryId);

    saveGallery(gallery);

    console.log(`✅ Deleted category: ${categoryId}`);
    res.json({ message: 'Category and all media deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Upload media to category
app.post('/api/gallery/upload', upload.single('file'), async (req, res) => {
  try {
    const { categoryId, categoryName, mediaName, mediaDescription, isNewCategory } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const gallery = readGallery();

    // Create category if new
    let finalCategoryId = categoryId;
    if (isNewCategory === 'true' && categoryName) {
      const newCategory = {
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name: categoryName.trim(),
        description: '',
        isPublic: true,
        createdAt: new Date().toISOString(),
        mediaCount: 0,
        thumbnail: null
      };
      gallery.categories.push(newCategory);
      finalCategoryId = newCategory.id;
      console.log(`✅ Created new category during upload: ${categoryName}`);
    } else if (!finalCategoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    // Verify category exists
    if (!gallery.categories.find(cat => cat.id === finalCategoryId)) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Upload to Supabase
    console.log(`🔄 Uploading file to Supabase: ${req.file.originalname}`);
    const uploadResult = await uploadToSupabase(
      req.file.buffer,
      req.file.originalname,
      'gallery',
      `${finalCategoryId}/`
    );

    if (uploadResult.error) {
      console.error(`❌ Supabase upload failed: ${uploadResult.error}`);
      return res.status(500).json({ error: `Upload failed: ${uploadResult.error}` });
    }

    if (!uploadResult.url) {
      console.error('❌ Upload succeeded but no URL returned');
      return res.status(500).json({ error: 'Upload succeeded but could not generate file URL' });
    }

    // Determine media type
    const ext = path.extname(req.file.originalname).toLowerCase();
    const isVideo = ['.mp4', '.mov', '.mkv', '.webm'].includes(ext);
    const mediaType = isVideo ? 'video' : 'photo';

    // Create media record
    const newMedia = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      categoryId: finalCategoryId,
      name: mediaName || path.basename(req.file.originalname, ext),
      description: mediaDescription || '',
      type: mediaType,
      url: uploadResult.url,
      supabasePath: uploadResult.path,
      fileSize: uploadResult.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'admin'
    };

    gallery.media.push(newMedia);

    // Update category thumbnail if not set
    const category = gallery.categories.find(cat => cat.id === finalCategoryId);
    if (category && !category.thumbnail && mediaType === 'photo') {
      category.thumbnail = uploadResult.url;
    }

    saveGallery(gallery);

    console.log(`✅ Uploaded ${mediaType}: ${req.file.originalname}`);
    res.json({
      media: newMedia,
      message: 'File uploaded successfully',
      categoryCreated: isNewCategory === 'true',
      newCategoryId: isNewCategory === 'true' ? finalCategoryId : null
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: `Upload error: ${error.message}` });
  }
});

// Delete media
app.delete('/api/gallery/media/:id', async (req, res) => {
  try {
    const mediaId = req.params.id;
    const gallery = readGallery();

    const mediaIndex = gallery.media.findIndex(m => m.id === mediaId);
    if (mediaIndex === -1) {
      return res.status(404).json({ error: 'Media not found' });
    }

    const media = gallery.media[mediaIndex];

    // Delete from Supabase
    if (media.supabasePath) {
      await deleteFromSupabase(media.supabasePath);
    }

    // Remove from gallery
    gallery.media.splice(mediaIndex, 1);
    saveGallery(gallery);

    console.log(`✅ Deleted media: ${media.name}`);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

// Update media metadata
app.put('/api/gallery/media/:id', (req, res) => {
  try {
    const mediaId = req.params.id;
    const { name, description } = req.body;

    const gallery = readGallery();
    const mediaIndex = gallery.media.findIndex(m => m.id === mediaId);

    if (mediaIndex === -1) {
      return res.status(404).json({ error: 'Media not found' });
    }

    if (name !== undefined) gallery.media[mediaIndex].name = name.trim();
    if (description !== undefined) gallery.media[mediaIndex].description = description;

    saveGallery(gallery);

    console.log(`✅ Updated media: ${mediaId}`);
    res.json({ media: gallery.media[mediaIndex], message: 'Media updated' });
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

// NOW register static files AFTER all API routes
// This ensures /api/* routes are handled before static file middleware tries to serve them
app.use(express.static(path.join(__dirname), {
  setHeaders: (res, filePath) => {
    // Add CORS headers to all static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    // For streaming files, add range headers support
    if (filePath.match(/\.(m3u8|ts|mp4|mkv|webm)$/i)) {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  }
}));

// Serve HLS streams from RTMP server
app.use('/hls', express.static(path.join(__dirname, 'hls'), {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Accept-Ranges', 'bytes');

    // Proper MIME types for HLS
    if (filePath.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    } else if (filePath.endsWith('.ts')) {
      res.setHeader('Content-Type', 'video/mp2t');
    }
  }
}));

// Start server with error handling
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 CAPD Streaming Proxy Server running on http://localhost:${PORT}`);
  console.log(`📺 Serve your TV page at http://localhost:${PORT}/tv.html`);
  console.log(`🔧 API endpoints:`);
  console.log(`   - Stream proxy: http://localhost:${PORT}/api/stream?url=<encoded-url>`);
  console.log(`   - Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[Server] Port ${PORT} in use, retrying in 3 seconds...`);
    setTimeout(() => server.listen(PORT, '127.0.0.1'), 3000);
  } else {
    console.error('[Server] Error:', err);
    process.exit(1);
  }
});
