const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { uploadSingle } = require('../middleware/cloudinaryUpload');
const auth = require('../middleware/auth');
const { verifyInviteToken } = require('../controllers/authController');

// Registration now supports inviteToken for pharmacist and deliveryBoy roles
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, uploadSingle('profilePhoto'), authController.updateProfile);
router.get('/verify-invite-token', verifyInviteToken);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// Address management
router.get('/addresses', auth, authController.getAddresses);
router.post('/addresses', auth, authController.addAddress);
router.delete('/addresses/:addressId', auth, authController.removeAddress);

module.exports = router; 