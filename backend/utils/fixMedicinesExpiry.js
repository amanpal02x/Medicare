const mongoose = require('mongoose');
const Order = require('../models/Order');

/**
 * Fix orders that are preparing but not properly assigned for delivery
 * This utility ensures that preparing orders are available for delivery boys
 */
async function fixPreparingOrders() {
  try {
    console.log('Starting to fix preparing orders...');
    
    // Find orders that are preparing but don't have proper delivery assignment
    const problematicOrders = await Order.find({
      status: 'preparing',
      $or: [
        { deliveryBoy: null },
        { 'deliveryAssignment.assignmentStatus': { $exists: false } },
        { 'deliveryAssignment.assignmentStatus': 'unassigned' }
      ]
    });

    console.log(`Found ${problematicOrders.length} orders that need fixing...`);

    let fixedCount = 0;
    for (const order of problematicOrders) {
      try {
        // Initialize delivery assignment if it doesn't exist
        if (!order.deliveryAssignment) {
          order.deliveryAssignment = {
            assignmentStatus: 'assigned',
            availableForAcceptance: true,
            assignedAt: new Date(),
            notificationSent: false
          };
        } else {
          // Update existing delivery assignment
          order.deliveryAssignment.assignmentStatus = 'assigned';
          order.deliveryAssignment.availableForAcceptance = true;
          if (!order.deliveryAssignment.assignedAt) {
            order.deliveryAssignment.assignedAt = new Date();
          }
        }

        await order.save();
        fixedCount++;
        console.log(`Fixed order ${order.orderNumber || order._id}`);
      } catch (error) {
        console.error(`Error fixing order ${order._id}:`, error.message);
      }
    }

    console.log(`Successfully fixed ${fixedCount} out of ${problematicOrders.length} orders`);
    return { total: problematicOrders.length, fixed: fixedCount };
  } catch (error) {
    console.error('Error in fixPreparingOrders:', error);
    throw error;
  }
}

/**
 * Get statistics about order assignment status
 */
async function getOrderAssignmentStats() {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: {
            status: '$status',
            assignmentStatus: '$deliveryAssignment.assignmentStatus',
            hasDeliveryBoy: { $cond: [{ $ifNull: ['$deliveryBoy', false] }, 'yes', 'no'] }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.status': 1, '_id.assignmentStatus': 1 } }
    ]);

    return stats;
  } catch (error) {
    console.error('Error getting order assignment stats:', error);
    throw error;
  }
}









module.exports = {
  fixPreparingOrders,
  getOrderAssignmentStats
}; 