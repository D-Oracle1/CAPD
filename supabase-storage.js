/**
 * Supabase Storage Helper
 * Handles file uploads to Supabase Storage
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('./supabase-client.js');

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Upload file to Supabase Storage
 * @param {Buffer} fileBuffer - File buffer data
 * @param {string} fileName - Name of the file
 * @param {string} bucketName - Supabase bucket name (default: 'gallery')
 * @param {string} folderPath - Folder path in bucket (e.g., 'category-id/')
 * @returns {Promise<{url: string, path: string, error: string|null}>}
 */
async function uploadToSupabase(fileBuffer, fileName, bucketName = 'gallery', folderPath = '') {
  try {
    // Create or ensure bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('Error listing buckets:', bucketError);
      return { url: null, path: null, error: 'Failed to access storage' };
    }

    // Check if bucket exists
    const bucketExists = buckets.some(b => b.name === bucketName);

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800 // 50MB limit per file
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return { url: null, path: null, error: 'Failed to create storage bucket' };
      }

      console.log('✅ Created new bucket:', bucketName);
    }

    // Generate unique filename to avoid collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const uniqueFileName = `${baseName}-${timestamp}-${randomStr}${ext}`;
    const fullPath = folderPath ? `${folderPath}${uniqueFileName}` : uniqueFileName;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fullPath, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: getMimeType(fileName)
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, path: null, error: error.message };
    }

    // Generate public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fullPath);

    console.log(`✅ File uploaded: ${publicUrl}`);

    return {
      url: publicUrl,
      path: fullPath,
      error: null,
      fileName: uniqueFileName,
      size: fileBuffer.length
    };
  } catch (error) {
    console.error('Supabase upload error:', error);
    return { url: null, path: null, error: error.message };
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
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @param {number} maxSize - Maximum size in bytes (default: 50MB)
 * @returns {boolean}
 */
function validateFileSize(fileSize, maxSize = 52428800) {
  return fileSize <= maxSize;
}

module.exports = {
  uploadToSupabase,
  deleteFromSupabase,
  getMimeType,
  validateFileType,
  validateFileSize
};
