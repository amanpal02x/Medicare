const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// Public routes
router.post('/register', deliveryController.register);

// Protected routes - require authentication and delivery boy role
router.post('/profile', auth, role('deliveryBoy'), deliveryController.createProfile);
router.get('/profile', auth, role('deliveryBoy'), deliveryController.getProfile);
router.put('/profile', auth, role('deliveryBoy'), upload.single('profilePhoto'), deliveryController.updateProfile);

// Document upload routes
router.post('/documents/:documentType', 
  auth, 
  role('deliveryBoy'), 
  upload.single('document'), 
  deliveryController.uploadDocuments
);

// Order management routes
router.get('/orders', auth, role('deliveryBoy'), deliveryController.getOrders);
router.get('/orders/:id', auth, role('deliveryBoy'), deliveryController.getOrderDetails);
router.put('/orders/:id/status', auth, role('deliveryBoy'), deliveryController.updateOrderStatus);

// Order assignment routes
router.get('/available-orders', auth, role('deliveryBoy'), deliveryController.getAvailableOrders);
router.post('/orders/:orderId/accept', auth, role('deliveryBoy'), deliveryController.acceptOrder);
router.post('/orders/:orderId/reject', auth, role('deliveryBoy'), deliveryController.rejectOrder);

// Location and availability routes
router.put('/location', auth, role('deliveryBoy'), deliveryController.updateLocation);
router.put('/availability', auth, role('deliveryBoy'), deliveryController.toggleAvailability);
router.put('/online-status', auth, role('deliveryBoy'), deliveryController.updateOnlineStatus);

// Earnings and performance routes
router.get('/earnings', auth, role('deliveryBoy'), deliveryController.getEarnings);
router.get('/performance', auth, role('deliveryBoy'), deliveryController.getPerformance);

// Nearby orders for auto-assignment
router.get('/nearby-orders', auth, role('deliveryBoy'), deliveryController.getNearbyOrders);

// Add location and online status update (GeoJSON)
router.put('/location-geo', auth, role('deliveryBoy'), deliveryController.updateLocationAndStatus);
// Get nearby orders (GeoJSON)
router.get('/nearby-orders-geo', auth, role('deliveryBoy'), deliveryController.getNearbyOrders);

module.exports = router; 