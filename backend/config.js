require('dotenv').config();

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/medicare',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Frontend URLs based on environment
  frontendUrl: isDevelopment 
    ? (process.env.FRONTEND_URL_DEV || 'http://localhost:3000')
    : (process.env.FRONTEND_URL_PROD || 'https://medicare-nine-alpha.vercel.app'),
    
  // CORS origins
  corsOrigins: isDevelopment 
    ? ['http://localhost:3000', 'http://127.0.0.1:3000']
    : ['https://medicare-nine-alpha.vercel.app'],
}; 