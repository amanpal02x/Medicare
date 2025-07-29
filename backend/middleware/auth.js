const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Added this import for the new_code

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  // Also check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  console.log('Auth middleware:', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    url: req.url,
    method: req.method
  });
  
  if (!token) {
    console.log('No token found, returning 401');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { userId: decoded.id, role: decoded.role });
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
}; 