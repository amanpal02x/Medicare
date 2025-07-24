const mongoose = require('mongoose');
const Order = require('../models/Order');
const config = require('../config');

/**
 * Migration script to update existing orders with old rejection structure
 * to use the new rejectedByDeliveryBoys array
 */
async function migrateRejectedOrders() {
  try {
    console.log('Starting migration of rejected orders...');
    
    // Connect to database
    await mongoose.connect(config.mongoURI);
    console.log('Connected to database');

    // Find orders that have the old rejection structure
    const ordersWithOldRejection = await Order.find({
      'deliveryAssignment.assignmentStatus': 'rejected',
      'deliveryAssignment.rejectedBy': { $exists: true },
      'deliveryAssignment.rejectedByDeliveryBoys': { $exists: false }
    });

    console.log(`Found ${ordersWithOldRejection.length} orders with old rejection structure`);

    let migratedCount = 0;
    for (const order of ordersWithOldRejection) {
      try {
        // Create the new rejectedByDeliveryBoys array
        order.deliveryAssignment.rejectedByDeliveryBoys = [{
          deliveryBoy: order.deliveryAssignment.rejectedBy,
          rejectedAt: order.deliveryAssignment.rejectedAt || new Date(),
          reason: order.deliveryAssignment.rejectionReason || 'No reason provided'
        }];

        // Reset the assignment status to make it available again
        order.deliveryAssignment.assignmentStatus = 'assigned';
        order.deliveryAssignment.availableForAcceptance = true;
        order.deliveryAssignment.rejectedAt = null;
        order.deliveryAssignment.rejectedBy = null;
        order.deliveryAssignment.rejectionReason = null;
        order.deliveryBoy = null;

        await order.save();
        migratedCount++;
        console.log(`Migrated order ${order.orderNumber || order._id}`);
      } catch (error) {
        console.error(`Error migrating order ${order.orderNumber || order._id}:`, error);
      }
    }

    console.log(`Successfully migrated ${migratedCount} out of ${ordersWithOldRejection.length} orders`);

    // Also find orders that are marked as rejected but don't have rejectedBy
    const orphanedRejectedOrders = await Order.find({
      'deliveryAssignment.assignmentStatus': 'rejected',
      'deliveryAssignment.rejectedBy': { $exists: false },
      'deliveryAssignment.rejectedByDeliveryBoys': { $exists: false }
    });

    console.log(`Found ${orphanedRejectedOrders.length} orphaned rejected orders`);

    let fixedCount = 0;
    for (const order of orphanedRejectedOrders) {
      try {
        // Reset these orders to be available again
        order.deliveryAssignment.assignmentStatus = 'assigned';
        order.deliveryAssignment.availableForAcceptance = true;
        order.deliveryAssignment.rejectedByDeliveryBoys = [];

        await order.save();
        fixedCount++;
        console.log(`Fixed orphaned order ${order.orderNumber || order._id}`);
      } catch (error) {
        console.error(`Error fixing orphaned order ${order.orderNumber || order._id}:`, error);
      }
    }

    console.log(`Successfully fixed ${fixedCount} out of ${orphanedRejectedOrders.length} orphaned orders`);

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateRejectedOrders();
}

module.exports = { migrateRejectedOrders }; 