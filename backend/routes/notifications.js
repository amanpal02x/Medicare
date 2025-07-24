const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get all notifications for the authenticated user
router.get('/', auth, notificationController.getNotifications);

// Mark all notifications as read
router.patch('/read', auth, notificationController.markNotificationsRead);

// Mark a specific notification as read
router.patch('/:notificationId/read', auth, notificationController.markNotificationRead);

// Clear seen (read) notifications
router.delete('/clear-seen', auth, notificationController.clearSeenNotifications);

// Clear all notifications for the current user
router.delete('/clear-all', auth, notificationController.clearAllNotifications);

// Get notification count
router.get('/count', auth, notificationController.getNotificationCount);

// Send a notification (admin only)
router.post('/', auth, notificationController.sendNotification);

// Test notification endpoint
router.post('/test', auth, notificationController.testNotification);

module.exports = router; 