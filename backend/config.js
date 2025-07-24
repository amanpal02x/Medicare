require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/medicare',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
}; 