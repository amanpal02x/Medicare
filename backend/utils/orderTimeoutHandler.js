const mongoose = require('mongoose');
const Order = require('../models/Order');
const { sendDeliveryNotification } = require('./notificationHelper');

/**
 * Check and expire orders that have timed out (20 seconds after assignment)
 */
async function checkAndExpireOrders() {
  try {
    const now = new Date();
    
    // Find orders that are available for acceptance but have expired
    const expiredOrders = await Order.find({
      'deliveryAssignment.assignmentStatus': 'assigned',
      'deliveryAssignment.availableForAcceptance': true,
      'deliveryAssignment.expiresAt': { $lt: now },
      'deliveryAssignment.acceptedBy': null
    }).populate('user', 'personalInfo.fullName personalInfo.phone');



    for (const order of expiredOrders) {
      try {
        // Mark order as cancelled due to no delivery agent
        order.deliveryAssignment.assignmentStatus = 'expired';
        order.deliveryAssignment.availableForAcceptance = false;
        order.deliveryAssignment.expiresAt = null;
        order.status = 'cancelled';
        order.statusTimestamps.cancelled = new Date();
        order.cancellationReason = 'Order cancelled due to unavailability of delivery agents.';

        // Add to status history
        order.statusHistory.push({
          status: 'cancelled',
          timestamp: new Date(),
          changedBy: {
            user: null,
            role: 'system'
          },
          notes: 'Order cancelled due to unavailability of delivery agents.'
        });

        await order.save();

        // Send notifications
        try {
          // Send notification to user
          await sendDeliveryNotification(
            order.user._id,
            order.orderNumber,
            'cancelled',
            null,
            `/orders/${order._id}`,
            'Order cancelled due to unavailability of delivery agents.'
          );
        } catch (error) {
          // Error sending user notification
        }

        // Send Socket.IO notifications for real-time updates
        if (global.io) {
          // Notify all delivery boys that this order is no longer available
          global.io.to('delivery-boys').emit('orderCancelled', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            message: `Order ${order.orderNumber} has been cancelled due to unavailability of delivery agents.`
          });

          // Notify admin
          global.io.to('admin').emit('orderCancelled', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            message: `Order ${order.orderNumber} cancelled due to unavailability of delivery agents.`,
            customerInfo: {
              name: order.user.personalInfo?.fullName || 'Customer',
              phone: order.phone
            }
          });

          // Notify pharmacist if assigned
          if (order.pharmacist) {
            global.io.to(`pharmacist-${order.pharmacist}`).emit('orderUpdate', {
              orderId: order._id,
              status: 'cancelled',
              message: `Order ${order.orderNumber} cancelled due to unavailability of delivery agents.`,
              orderNumber: order.orderNumber
            });
          }
        }

      } catch (error) {
        // Error cancelling order
      }
    }

    return expiredOrders.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Set expiration time for an order (20 seconds from now)
 */
function setOrderExpiration(order) {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + 900); // 15 minutes from now
  order.deliveryAssignment.expiresAt = expiresAt;
  return expiresAt;
}

/**
 * Get remaining time for an order in seconds
 */
function getRemainingTime(order) {
  if (!order.deliveryAssignment.expiresAt) return 900; // 24 hours in seconds if not set
  
  const now = new Date();
  const expiresAt = new Date(order.deliveryAssignment.expiresAt);
  const remainingMs = expiresAt.getTime() - now.getTime();
  
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

module.exports = {
  checkAndExpireOrders,
  setOrderExpiration,
  getRemainingTime
}; 