require('dotenv').config();

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/medicare',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Cloudinary configuration
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_FOLDER || 'medicarex'
  },
  
  // Frontend URLs based on environment
  frontendUrl: isDevelopment 
    ? (process.env.FRONTEND_URL_DEV || 'http://localhost:3000')
    : (process.env.FRONTEND_URL_PROD || 'https://medicare-nine-alpha.vercel.app'),
    
  // CORS origins
  corsOrigins: isDevelopment 
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : ['https://medicare-nine-alpha.vercel.app'],
}; 