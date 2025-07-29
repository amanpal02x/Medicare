const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

// Function to upload a single file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'medicarex') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error.message);
    return null;
  }
};

// Function to migrate all images in uploads directory
const migrateUploadsDirectory = async () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Uploads directory does not exist');
    return;
  }

  const files = fs.readdirSync(uploadsDir);
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });

  console.log(`Found ${imageFiles.length} image files to migrate`);

  const results = [];
  
  for (const file of imageFiles) {
    const filePath = path.join(uploadsDir, file);
    console.log(`Uploading ${file}...`);
    
    const cloudinaryUrl = await uploadToCloudinary(filePath);
    
    if (cloudinaryUrl) {
      results.push({
        originalFile: file,
        originalPath: `/uploads/${file}`,
        cloudinaryUrl: cloudinaryUrl
      });
      console.log(`✅ Uploaded: ${file} -> ${cloudinaryUrl}`);
    } else {
      console.log(`❌ Failed to upload: ${file}`);
    }
  }

  // Save migration results
  const migrationResultsPath = path.join(__dirname, 'migration-results.json');
  fs.writeFileSync(migrationResultsPath, JSON.stringify(results, null, 2));
  
  console.log(`\nMigration completed! Results saved to: ${migrationResultsPath}`);
  console.log(`Successfully migrated: ${results.length}/${imageFiles.length} files`);
  
  return results;
};

// Function to update database URLs (example for Medicine model)
const updateDatabaseUrls = async (migrationResults) => {
  // This is an example - you'll need to implement this for each model
  // that stores image URLs
  
  console.log('\nTo update database URLs, you can use the migration results:');
  console.log('Example SQL/NoSQL queries:');
  
  migrationResults.forEach(result => {
    console.log(`UPDATE medicines SET image = '${result.cloudinaryUrl}' WHERE image = '${result.originalPath}';`);
    console.log(`UPDATE products SET image = '${result.cloudinaryUrl}' WHERE image = '${result.originalPath}';`);
    console.log(`UPDATE users SET profilePhoto = '${result.cloudinaryUrl}' WHERE profilePhoto = '${result.originalPath}';`);
  });
};

// Main execution
if (require.main === module) {
  console.log('Starting Cloudinary migration...');
  
  // Check if Cloudinary is configured
  if (!config.cloudinary.cloud_name || !config.cloudinary.api_key || !config.cloudinary.api_secret) {
    console.error('❌ Cloudinary configuration missing! Please set up your .env file.');
    console.error('Required variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  migrateUploadsDirectory()
    .then(results => {
      if (results && results.length > 0) {
        updateDatabaseUrls(results);
      }
    })
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  uploadToCloudinary,
  migrateUploadsDirectory,
  updateDatabaseUrls
};