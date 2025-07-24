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

/**
 * Fix orders that are out_for_delivery but have no delivery boy assigned
 * Sets them back to 'preparing' and makes them available for assignment
 */
async function fixOutForDeliveryWithoutDeliveryBoy() {
  try {
    console.log('Starting to fix out_for_delivery orders without delivery boy...');
    const problematicOrders = await Order.find({
      status: 'out_for_delivery',
      $or: [
        { deliveryBoy: null },
        { deliveryBoy: { $exists: false } }
      ]
    });
    console.log(`Found ${problematicOrders.length} problematic orders.`);
    let fixedCount = 0;
    for (const order of problematicOrders) {
      order.status = 'preparing';
      if (!order.deliveryAssignment) {
        order.deliveryAssignment = {};
      }
      order.deliveryAssignment.assignmentStatus = 'assigned';
      order.deliveryAssignment.availableForAcceptance = true;
      order.deliveryAssignment.acceptedBy = null;
      order.deliveryAssignment.acceptedAt = null;
      order.deliveryAssignment.rejectedAt = null;
      order.deliveryAssignment.rejectedBy = null;
      order.deliveryAssignment.rejectionReason = null;
      order.deliveryAssignment.assignedAt = new Date();
      order.deliveryAssignment.expiresAt = null;
      order.deliveryBoy = null;
      await order.save();
      fixedCount++;
      console.log(`Fixed order ${order.orderNumber || order._id}`);
    }
    console.log(`Successfully fixed ${fixedCount} out of ${problematicOrders.length} orders.`);
    return { total: problematicOrders.length, fixed: fixedCount };
  } catch (error) {
    console.error('Error in fixOutForDeliveryWithoutDeliveryBoy:', error);
    throw error;
  }
}

/**
 * Fix orders that are missing deliveryAssignment field or have incorrect assignment status
 */
async function fixOrderDeliveryAssignment() {
  try {
    console.log('🔧 Starting to fix order delivery assignment issues...');
    
    // Find orders that are preparing but missing deliveryAssignment field
    const ordersWithoutAssignment = await Order.find({
      status: 'preparing',
      $or: [
        { deliveryAssignment: { $exists: false } },
        { 'deliveryAssignment.assignmentStatus': { $exists: false } }
      ]
    });

    console.log(`📦 Found ${ordersWithoutAssignment.length} orders without proper delivery assignment`);

    for (const order of ordersWithoutAssignment) {
      // Initialize deliveryAssignment if it doesn't exist
      if (!order.deliveryAssignment) {
        order.deliveryAssignment = {
          assignmentStatus: 'unassigned',
          availableForAcceptance: false,
          notificationSent: false
        };
      } else if (!order.deliveryAssignment.assignmentStatus) {
        // Set assignment status if missing
        order.deliveryAssignment.assignmentStatus = 'unassigned';
      }

      await order.save();
      console.log(`✅ Fixed order ${order.orderNumber} (${order._id})`);
    }

    // Find orders that are preparing but have no delivery boy assigned
    const unassignedPreparingOrders = await Order.find({
      status: 'preparing',
      deliveryBoy: null,
      'deliveryAssignment.assignmentStatus': { $ne: 'unassigned' }
    });

    console.log(`📦 Found ${unassignedPreparingOrders.length} preparing orders with incorrect assignment status`);

    for (const order of unassignedPreparingOrders) {
      order.deliveryAssignment.assignmentStatus = 'unassigned';
      order.deliveryAssignment.availableForAcceptance = false;
      await order.save();
      console.log(`✅ Fixed assignment status for order ${order.orderNumber} (${order._id})`);
    }

    console.log('✅ Order delivery assignment fix completed');
    return {
      fixedWithoutAssignment: ordersWithoutAssignment.length,
      fixedIncorrectStatus: unassignedPreparingOrders.length
    };
  } catch (error) {
    console.error('❌ Error fixing order delivery assignment:', error);
    throw error;
  }
}

module.exports = {
  fixPreparingOrders,
  getOrderAssignmentStats,
  fixOutForDeliveryWithoutDeliveryBoy,
  fixOrderDeliveryAssignment
}; 