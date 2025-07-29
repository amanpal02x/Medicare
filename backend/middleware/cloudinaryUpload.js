const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const config = require('../config');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('[Cloudinary Debug] Created uploads directory:', uploadsDir);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});
console.log('[Cloudinary] Configured with cloud_name:', config.cloudinary.cloud_name);

// Configure local storage for temporary file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

// File filter to allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/mov',
    'video/avi',
    'video/mkv'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

// Create multer upload instance for temporary storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for videos
  }
});

// Function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder = config.cloudinary.folder) => {
  try {
    console.log('[Cloudinary Debug] Starting upload with folder:', folder);
    console.log('[Cloudinary Debug] File info:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    });
    
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    };

    console.log('[Cloudinary Debug] Upload options:', JSON.stringify(uploadOptions, null, 2));
    console.log('[Cloudinary Debug] Cloudinary config:', {
      cloud_name: config.cloudinary.cloud_name,
      api_key: config.cloudinary.api_key ? '***' + config.cloudinary.api_key.slice(-4) : 'NOT_SET',
      api_secret: config.cloudinary.api_secret ? '***' + config.cloudinary.api_secret.slice(-4) : 'NOT_SET'
    });

    const result = await cloudinary.uploader.upload(file.path, uploadOptions);
    
    console.log('[Cloudinary Debug] Upload successful:', {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format
    });
    
    // Clean up temporary file
    const fs = require('fs');
    fs.unlinkSync(file.path);
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('[Cloudinary Debug] Upload error details:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
      error: error
    });
    
    // Clean up temporary file even on error
    try {
      const fs = require('fs');
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (cleanupError) {
      console.error('[Cloudinary Debug] Failed to cleanup temp file:', cleanupError.message);
    }
    
    throw error;
  }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

// Helper function to extract public ID from URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Extract public ID from Cloudinary URL
  const match = url.match(/\/v\d+\/([^\/]+)\./);
  if (match) {
    return match[1];
  }
  
  // If it's already a public ID
  if (url.includes('cloudinary.com')) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
  }
  
  return null;
};

// Middleware to handle single file upload
const uploadSingle = (fieldName) => {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        console.log('[Cloudinary Debug] uploadSingle middleware called for field:', fieldName);
        console.log('[Cloudinary Debug] Request file:', req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : 'No file uploaded');
        
        if (req.file) {
          console.log('[Cloudinary Debug] Starting Cloudinary upload...');
          const result = await uploadToCloudinary(req.file);
          req.cloudinaryResult = result;
          console.log('[Cloudinary Debug] Cloudinary upload completed successfully');
        } else {
          console.log('[Cloudinary Debug] No file to upload to Cloudinary');
        }
        next();
      } catch (error) {
        console.error('[Cloudinary Debug] Error in uploadSingle middleware:', error.message);
        next(error);
      }
    }
  ];
};

// Middleware to handle multiple file uploads
const uploadMultiple = (fieldName, maxCount = 10) => {
  return [
    upload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        if (req.files && req.files.length > 0) {
          const results = [];
          for (const file of req.files) {
            const result = await uploadToCloudinary(file);
            results.push(result);
          }
          req.cloudinaryResults = results;
        }
        next();
      } catch (error) {
        next(error);
      }
    }
  ];
};

module.exports = {
  upload,
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  uploadSingle,
  uploadMultiple
};