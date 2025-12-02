/**
 * Supabase Storage Helper
 * Handles file uploads to Supabase Storage
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = require('./supabase-client.js');

// Initialize Supabase client with service role key (has permission to create buckets)
// Add longer timeout for large file uploads
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: {
    headers: {
      'X-Client-Info': 'supabase-js/2.0.0'
    }
  },
  auth: {
    persistSession: false
  }
});

/**
 * Upload file to Supabase Storage with retry logic for large files
 * @param {Buffer} fileBuffer - File buffer data
 * @param {string} fileName - Name of the file
 * @param {string} bucketName - Supabase bucket name (default: 'gallery')
 * @param {string} folderPath - Folder path in bucket (e.g., 'category-id/')
 * @returns {Promise<{url: string, path: string, error: string|null}>}
 */
async function uploadToSupabase(fileBuffer, fileName, bucketName = 'gallery', folderPath = '') {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Starting upload (attempt ${attempt}/${maxRetries}) for file: ${fileName} (${fileBuffer.length} bytes)`);
      return await uploadWithRetry(fileBuffer, fileName, bucketName, folderPath);
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Upload attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed
  console.error(`❌ Upload failed after ${maxRetries} attempts:`, lastError.message);
  return {
    url: null,
    path: null,
    error: `Upload failed after ${maxRetries} attempts: ${lastError.message}`
  };
}

/**
 * Internal upload function with timeout
 */
async function uploadWithRetry(fileBuffer, fileName, bucketName, folderPath) {
  const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB chunks
  const MAX_REQUEST_SIZE = 100 * 1024 * 1024; // 100MB max for single request

  // For files larger than 100MB, use chunked upload
  if (fileBuffer.length > MAX_REQUEST_SIZE) {
    console.log(`📦 File is ${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB - using chunked upload`);
    return await uploadChunked(fileBuffer, fileName, bucketName, folderPath, CHUNK_SIZE);
  }

  try {
    console.log(`📤 Starting upload for file: ${fileName} (${fileBuffer.length} bytes)`);

    // Check if bucket exists, create if needed
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    const bucketExists = buckets && buckets.some(b => b.name === bucketName);

    if (!bucketExists) {
      console.log(`📦 Creating missing bucket: ${bucketName}`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true
      });

      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
        throw new Error(`Failed to create storage bucket: ${createError.message}`);
      }

      console.log(`✅ Bucket created: ${bucketName}`);
    }

    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const uniqueFileName = `${baseName}-${timestamp}-${randomStr}${ext}`;
    const fullPath = folderPath ? `${folderPath}${uniqueFileName}` : uniqueFileName;

    console.log(`📁 Full path: ${fullPath}`);

    // Upload file with proper error handling
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: getMimeType(fileName)
      });

    if (error) {
      console.error('❌ Upload error details:', {
        message: error.message,
        status: error.status,
        statusCode: error.statusCode,
        fullError: error
      });
      throw new Error(`Upload failed: ${error.message || 'Unknown error'}`);
    }

    if (!data || !data.path) {
      console.error('❌ No path returned from upload');
      throw new Error('Upload succeeded but no path returned');
    }

    // Generate public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullPath);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      console.error('❌ Could not generate public URL');
      throw new Error('File uploaded but could not generate URL');
    }

    console.log(`✅ File uploaded successfully: ${publicUrl}`);

    return {
      url: publicUrl,
      path: fullPath,
      error: null,
      fileName: uniqueFileName,
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('❌ Supabase upload exception:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      url: null,
      path: null,
      error: `Upload exception: ${error.message}`
    };
  }
}

/**
 * Delete file from Supabase Storage
 * @param {string} filePath - Full path to file in bucket
 * @param {string} bucketName - Bucket name
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
async function deleteFromSupabase(filePath, bucketName = 'gallery') {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    console.log(`✅ File deleted: ${filePath}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Supabase delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get MIME type from filename
 * @param {string} fileName - File name
 * @returns {string} MIME type
 */
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.pdf': 'application/pdf'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Validate file type
 * @param {string} fileName - File name
 * @param {string[]} allowedTypes - Array of allowed extensions (e.g., ['.jpg', '.png'])
 * @returns {boolean}
 */
function validateFileType(fileName, allowedTypes = []) {
  if (allowedTypes.length === 0) {
    // Default allowed types
    const defaultAllowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.mkv', '.webm'];
    allowedTypes = defaultAllowed;
  }

  const ext = path.extname(fileName).toLowerCase();
  return allowedTypes.includes(ext);
}

/**
 * Upload large file in chunks to work around Supabase's 100MB request limit
 * @param {Buffer} fileBuffer - File buffer data
 * @param {string} fileName - Name of the file
 * @param {string} bucketName - Bucket name
 * @param {string} folderPath - Folder path in bucket
 * @param {number} chunkSize - Size of each chunk (50MB default)
 * @returns {Promise<{url: string, path: string, error: string|null}>}
 */
async function uploadChunked(fileBuffer, fileName, bucketName, folderPath, chunkSize) {
  try {
    const fileSize = fileBuffer.length;
    const numChunks = Math.ceil(fileSize / chunkSize);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const uniqueName = `${baseName}-${timestamp}-${randomStr}`;
    const fullPath = folderPath ? `${folderPath}${uniqueName}` : uniqueName;

    console.log(`📊 Uploading ${numChunks} chunks of ${(chunkSize / 1024 / 1024).toFixed(0)}MB each`);

    // Upload each chunk
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = fileBuffer.slice(start, end);
      const chunkFile = i === numChunks - 1
        ? `${fullPath}${ext}` // Last chunk is the actual file
        : `${fullPath}.chunk${i}`; // Other chunks have .chunk extension

      console.log(`📤 Uploading chunk ${i + 1}/${numChunks} (${(chunk.length / 1024 / 1024).toFixed(1)}MB)...`);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(chunkFile, chunk, {
          cacheControl: '3600',
          upsert: false,
          contentType: i === numChunks - 1 ? getMimeType(fileName) : 'application/octet-stream'
        });

      if (error) {
        throw new Error(`Chunk ${i} upload failed: ${error.message}`);
      }

      console.log(`✅ Chunk ${i + 1} uploaded`);
    }

    // Get URL of the main file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(`${fullPath}${ext}`);

    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      throw new Error('Could not generate public URL for chunked upload');
    }

    console.log(`✅ File uploaded in ${numChunks} chunks: ${publicUrl}`);

    return {
      url: publicUrl,
      path: `${fullPath}${ext}`,
      error: null,
      fileName: `${uniqueName}${ext}`,
      size: fileSize,
      chunked: true,
      chunkCount: numChunks
    };
  } catch (error) {
    console.error(`❌ Chunked upload failed: ${error.message}`);
    throw error;
  }
}

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum size in bytes (default: 5GB)
 * @returns {boolean}
 */
function validateFileSize(fileSize, maxSize = 5 * 1024 * 1024 * 1024) {
  return fileSize <= maxSize;
}

module.exports = {
  uploadToSupabase,
  deleteFromSupabase,
  getMimeType,
  validateFileType,
  validateFileSize
};
