const { Notification, UserNotification } = require('../models/Notification');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await UserNotification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark all notifications as read
exports.markNotificationsRead = async (req, res) => {
  try {
    await UserNotification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

// Mark a specific notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await UserNotification.findOneAndUpdate(
      { _id: notificationId, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// Clear seen (read) notifications
exports.clearSeenNotifications = async (req, res) => {
  try {
    const result = await UserNotification.deleteMany({
      user: req.user.id,
      isRead: true
    });

    res.json({ 
      message: `Cleared ${result.deletedCount} seen notifications`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear seen notifications' });
  }
};

// Clear all notifications for a user
exports.clearAllNotifications = async (req, res) => {
  try {
    await UserNotification.deleteMany({ user: req.user.id });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
};

// Send a notification to a user
exports.sendNotification = async (req, res) => {
  try {
    const { userId, message, link, type = 'general' } = req.body;

    const notification = new UserNotification({
      user: userId,
      message,
      link,
      type
    });

    await notification.save();

    // Send real-time notification via Socket.IO
    if (global.io) {
      global.io.to(`user-${userId}`).emit('newNotification', {
        notification: {
          _id: notification._id,
          message: notification.message,
          link: notification.link,
          type: notification.type,
          createdAt: notification.createdAt
        }
      });
    }

    res.json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notification' });
  }
};

// Get notification count for a user
exports.getNotificationCount = async (req, res) => {
  try {
    const unreadCount = await UserNotification.countDocuments({
      user: req.user.id,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get notification count' });
  }
};

// Test notification endpoint
exports.testNotification = async (req, res) => {
  try {
    const { sendNotification } = require('../utils/notificationHelper');
    
    const notification = await sendNotification(
      req.user.id,
      'This is a test notification from the server!',
      '/notifications',
      'test'
    );

    res.json({ 
      message: 'Test notification sent successfully',
      notification 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send test notification' });
  }
}; 