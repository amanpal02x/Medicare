const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Pharmacist = require('../models/Pharmacist');
const multer = require('multer');
const path = require('path');
// Removed: const { requireAuth, requireAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'support-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.get('/dashboard', auth, role('admin'), adminController.dashboard);
router.get('/users', auth, role('admin'), adminController.getUsers);
router.put('/users/:id/block', auth, role('admin'), adminController.blockUser);
router.get('/pharmacies', auth, role('admin'), adminController.getPharmacies);
router.put('/pharmacies/:id/verify', auth, role('admin'), adminController.verifyPharmacy);
router.get('/analytics', auth, role('admin'), adminController.analytics);
router.get('/settings', auth, role('admin'), adminController.getSettings);
router.put('/settings', auth, role('admin'), adminController.updateSettings);
// Orders - specific routes first
router.get('/orders/for-assignment', auth, role('admin'), adminController.getOrdersForAssignment);
router.get('/orders/unassigned', auth, role('admin'), adminController.getUnassignedOrders);
router.put('/orders/:orderId/assign-delivery', auth, role('admin'), adminController.assignDeliveryBoy);
router.put('/orders/:id/auto-assign', auth, role('admin'), adminController.autoAssignDeliveryBoy);
router.put('/orders/:id/status', auth, role('admin'), adminController.updateOrderStatus);
router.put('/orders/bulk-assign', auth, role('admin'), adminController.bulkAssignDeliveryBoys);
router.get('/orders', auth, role('admin'), adminController.getOrders);
router.get('/orders/:id', auth, role('admin'), adminController.getOrderById);
router.get('/medicines', auth, role('admin'), adminController.getMedicines);
router.post('/medicines', auth, role('admin'), adminController.addMedicine);
router.put('/medicines/:id', auth, role('admin'), adminController.updateMedicine);
router.delete('/medicines/:id', auth, role('admin'), adminController.deleteMedicine);
router.get('/prescriptions', auth, role('admin'), adminController.getPrescriptions);
router.put('/prescriptions/:id/approve', auth, role('admin'), adminController.approvePrescription);
router.put('/prescriptions/:id/reject', auth, role('admin'), adminController.rejectPrescription);
// Deliveries
router.get('/deliveries', auth, role('admin'), adminController.getDeliveries);
router.put('/deliveries/:id/assign', auth, role('admin'), adminController.assignDeliveryBoy);
router.put('/deliveries/:id/status', auth, role('admin'), adminController.updateDeliveryStatus);
// Payments & Refunds
router.get('/payments', auth, role('admin'), adminController.getPayments);
router.get('/refunds', auth, role('admin'), adminController.getRefunds);
router.put('/refunds/:id', auth, role('admin'), adminController.updateRefundStatus);
// Support ticket routes are for admin only. User-facing support query submission will be in a separate route.
router.get('/support', auth, role('admin'), adminController.getSupportTickets);
router.put('/support/:id/reply', auth, role('admin'), upload.array('files', 5), adminController.replySupportTicket);
router.put('/support/:id/close', auth, role('admin'), adminController.closeSupportTicket);
router.get('/delivery-boys', auth, role('admin'), adminController.getDeliveryBoys);
router.get('/delivery-boys/:id', auth, role('admin'), adminController.getDeliveryBoyById);
router.put('/delivery-boys/:id/status', auth, role('admin'), adminController.updateDeliveryBoyStatus);
router.put('/delivery-boys/:id/approve', auth, role('admin'), adminController.approveDeliveryBoy);
router.put('/delivery-boys/:id/suspend', auth, role('admin'), adminController.suspendDeliveryBoy);
router.get('/delivery-boys/:id/performance', auth, role('admin'), adminController.getDeliveryBoyPerformance);
router.get('/delivery-boys/:id/earnings', auth, role('admin'), adminController.getDeliveryBoyEarnings);
router.get('/delivery-boys/:id/orders', auth, role('admin'), adminController.getDeliveryBoyOrders);
router.get('/delivery-statistics', auth, role('admin'), adminController.getDeliveryStatistics);
router.get('/delivery-performance', auth, role('admin'), adminController.getDeliveryPerformanceOverview);
// router.get('/delivery-boys/nearby', auth, role('admin'), adminController.getNearbyDeliveryBoys);
router.get('/delivery-boys/:id/location-history', auth, role('admin'), adminController.getDeliveryBoyLocationHistory);
router.put('/delivery-boys/:id/work-area', auth, role('admin'), adminController.updateDeliveryBoyWorkArea);
router.get('/delivery-boys/:id/documents', auth, role('admin'), adminController.getDeliveryBoyDocuments);
router.put('/delivery-boys/:id/documents/:type/verify', auth, role('admin'), adminController.verifyDeliveryBoyDocument);
router.delete('/delivery-boys/:id', auth, role('admin'), adminController.deleteDeliveryBoy);
router.get('/delivery-boys/:id/reviews', auth, role('admin'), adminController.getDeliveryBoyReviews);
router.post('/delivery-boys/:id/notifications', auth, role('admin'), adminController.sendNotificationToDeliveryBoy);
router.get('/delivery-boys/:id/schedule', auth, role('admin'), adminController.getDeliveryBoySchedule);
router.put('/delivery-boys/:id/schedule', auth, role('admin'), adminController.updateDeliveryBoySchedule);
router.get('/delivery-boys/:id/analytics', auth, role('admin'), adminController.getDeliveryBoyAnalytics);
router.put('/delivery-boys/bulk-status', auth, role('admin'), adminController.bulkUpdateDeliveryBoyStatus);
router.get('/delivery-boys/export', auth, role('admin'), adminController.exportDeliveryBoyData);
// Pharmacist approval routes
router.get('/pending-pharmacists', auth, role('admin'), adminController.getPendingPharmacists);
router.put('/pharmacists/:id/approve', auth, role('admin'), adminController.approvePharmacist);
router.put('/pharmacists/:id/reject', auth, role('admin'), adminController.rejectPharmacist);
// TEMPORARY DEBUG ENDPOINT
router.get('/all-pharmacists', auth, role('admin'), adminController.getApprovedPharmacists);
router.delete('/pharmacists/:id/force', auth, role('admin'), adminController.forceDeletePharmacist);
router.get('/user-count', auth, role('admin'), adminController.getUserCount);
router.put('/support/:id/assign', auth, role('admin'), adminController.assignSupportTicket);
router.put('/support/:id/status', auth, role('admin'), adminController.updateSupportTicketStatus);

// New delivery assignment routes
// router.get('/delivery-boys/available', auth, role('admin'), adminController.getAvailableDeliveryBoys);
router.get('/delivery-boys/available', auth, role('admin'), adminController.getAvailableDeliveryBoys);
router.post('/orders/auto-assign', auth, role('admin'), adminController.autoAssignOrders);
router.get('/delivery-assignment/stats', auth, role('admin'), adminController.getDeliveryAssignmentStats);
router.get('/delivery-assignment/rejection-stats', auth, role('admin'), adminController.getRejectionStats);

// Fix preparing orders utility
router.post('/fix-preparing-orders', auth, role('admin'), async (req, res) => {
  const { fixPreparingOrders, getOrderAssignmentStats } = require('../utils/fixMedicinesExpiry');
  const result = await fixPreparingOrders();
  res.json(result);
});

// Fix out_for_delivery orders without delivery boy
router.post('/fix-out-for-delivery-without-delivery-boy', auth, role('admin'), async (req, res) => {
  try {
    const { fixOutForDeliveryWithoutDeliveryBoy } = require('../utils/fixMedicinesExpiry');
    const result = await fixOutForDeliveryWithoutDeliveryBoy();
    res.json({ message: `Fixed ${result.fixed} out of ${result.total} orders`, result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fix out_for_delivery orders', details: err.message });
  }
});

// Get order assignment statistics
router.get('/order-assignment-stats', auth, role('admin'), async (req, res) => {
  try {
    const { getOrderAssignmentStats } = require('../utils/fixMedicinesExpiry');
    const stats = await getOrderAssignmentStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get order assignment stats', details: err.message });
  }
});

// Fix order delivery assignment issues
router.post('/fix-order-assignment', auth, role('admin'), async (req, res) => {
  try {
    const { fixOrderDeliveryAssignment } = require('../utils/fixMedicinesExpiry');
    const result = await fixOrderDeliveryAssignment();
    res.json({ 
      message: 'Order assignment issues fixed successfully',
      result 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fix order assignment issues', details: err.message });
  }
});

// Alias for delivery-assignment-stats to support frontend expectation
router.get('/delivery-assignment-stats', auth, role('admin'), require('../controllers/adminController').getDeliveryAssignmentStats);

// New routes for comprehensive management
// Pharmacist management routes
router.get('/pharmacists', auth, role('admin'), adminController.getAllPharmacists);
router.get('/pharmacists/:id', auth, role('admin'), adminController.getPharmacistById);
router.put('/pharmacists/:id/status', auth, role('admin'), adminController.updatePharmacistStatus);
router.get('/pharmacist-statistics', auth, role('admin'), adminController.getPharmacistStatistics);

// User management routes
router.get('/all-users', auth, role('admin'), adminController.getAllUsers);
router.get('/users/:id', auth, role('admin'), adminController.getUserById);
router.put('/users/:id/block', auth, role('admin'), adminController.blockUser);
router.get('/user-statistics', auth, role('admin'), adminController.getUserStatistics);

// Delivery boy statistics
router.get('/delivery-boy-statistics', auth, role('admin'), adminController.getDeliveryBoyStatistics);

// POST /api/admin/invite-token
router.post('/invite-token', auth, role('admin'), adminController.generateInviteToken);
// GET /api/admin/invite-tokens
router.get('/invite-tokens', auth, role('admin'), adminController.getInviteTokens);

module.exports = router; 