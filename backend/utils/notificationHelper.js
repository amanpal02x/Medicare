const { UserNotification } = require('../models/Notification');

/**
 * Send a notification to a user
 * @param {string} userId - The user ID to send notification to
 * @param {string} message - The notification message
 * @param {string} link - Optional link for the notification
 * @param {string} type - Notification type (default: 'general')
 * @param {Object} additionalData - Additional data to store with notification
 */
async function sendNotification(userId, message, link = null, type = 'general', additionalData = {}) {
  try {
    const notification = new UserNotification({
      user: userId,
      message,
      link,
      type,
      ...additionalData
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
          createdAt: notification.createdAt,
          ...additionalData
        }
      });
    }

    return notification;
  } catch (error) {
    throw error;
  }
}

/**
 * Send order-related notifications
 */
async function sendOrderNotification(userId, orderNumber, status, link = null) {
  const messages = {
    'pending': `Your order #${orderNumber} has been placed and is being processed.`,
    'accepted': `Your order #${orderNumber} has been accepted and is being preparing.`,
    'preparing': `Your order #${orderNumber} is ready for delivery!`,
    'out_for_delivery': `Your order #${orderNumber} is out for delivery.`,
    'delivered': `Your order #${orderNumber} has been delivered successfully!`,
    'cancelled': `Your order #${orderNumber} has been cancelled.`,
    'expired': `Your order #${orderNumber} has expired. Please place a new order.`
  };

  const message = messages[status] || `Your order #${orderNumber} status has been updated to ${status}.`;
  
  return sendNotification(userId, message, link, 'order_status_update', {
    orderNumber,
    status
  });
}

/**
 * Send payment-related notifications
 */
async function sendPaymentNotification(userId, orderNumber, status, amount, link = null) {
  const messages = {
    'paid': `Payment of ₹${amount} for order #${orderNumber} has been received successfully.`,
    'failed': `Payment of ₹${amount} for order #${orderNumber} has failed. Please try again.`,
    'refunded': `A refund of ₹${amount} for order #${orderNumber} has been processed.`
  };

  const message = messages[status] || `Payment status for order #${orderNumber} has been updated.`;
  
  return sendNotification(userId, message, link, 'payment_received', {
    orderNumber,
    status,
    amount
  });
}

/**
 * Send delivery-related notifications
 */
async function sendDeliveryNotification(userId, orderNumber, status, deliveryBoyName = null, link = null) {
  const messages = {
    'assigned': `Your order #${orderNumber} has been assigned to a delivery agent.`,
    'accepted': `Your order #${orderNumber} has been accepted by ${deliveryBoyName || 'a delivery agent'}.`,
    'out_for_delivery': `Your order #${orderNumber} is out for delivery with ${deliveryBoyName || 'our delivery agent'}.`,
    'delivered': `Your order #${orderNumber} has been delivered successfully!`,
    'expired': `Your order #${orderNumber} has expired and is no longer available for delivery.`
  };

  const message = messages[status] || `Delivery status for order #${orderNumber} has been updated.`;
  
  return sendNotification(userId, message, link, 'order_delivered', {
    orderNumber,
    status,
    deliveryBoyName
  });
}

/**
 * Send support-related notifications
 */
async function sendSupportNotification(userId, ticketId, message, adminName = null, link = null) {
  return sendNotification(userId, message, link, 'support', {
    ticketId,
    adminName
  });
}

/**
 * Send prescription-related notifications
 */
async function sendPrescriptionNotification(userId, prescriptionId, status, link = null) {
  const messages = {
    'pending': 'Your prescription is under review.',
    'approved': 'Your prescription has been approved and is ready for pickup.',
    'rejected': 'Your prescription has been rejected. Please check the details.',
    'dispensed': 'Your prescription has been dispensed and is ready for delivery.'
  };

  const message = messages[status] || `Your prescription status has been updated to ${status}.`;
  
  return sendNotification(userId, message, link, 'prescription_update', {
    prescriptionId,
    status
  });
}

module.exports = {
  sendNotification,
  sendOrderNotification,
  sendPaymentNotification,
  sendDeliveryNotification,
  sendSupportNotification,
  sendPrescriptionNotification
}; 