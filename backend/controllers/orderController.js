const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { UserNotification } = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');

// Create notification for user
const createUserNotification = async (userId, message, orderId = null) => {
  try {
    const notification = new UserNotification({
      user: userId,
      message,
      link: orderId ? `/orders/${orderId}` : null,
      isRead: false
    });
    await notification.save();
    return notification;
  } catch (error) {
    // Error creating user notification
  }
};

// Create notification for pharmacists
const createPharmacistNotification = async (orderId, orderDetails) => {
  try {
    const { Notification } = require('../models/Notification');
    const notification = new Notification({
      user: null, // Will be assigned to available pharmacist
      type: 'new_order',
      isRead: false,
      order: orderId,
      priority: 'high',
      category: 'order',
      status: 'open',
      conversation: [{
        sender: orderDetails.user,
        message: `New order received: Order #${orderId.slice(-6)} - Total: ₹${orderDetails.total}`,
        timestamp: new Date()
      }]
    });
    await notification.save();
    
    // Emit socket event for new available order to all online delivery boys
    if (global.io) {
      global.io.to('delivery-boys').emit('newAvailableOrder', {
        orderId,
        orderNumber: orderDetails.orderNumber,
        message: `New delivery order available: Order #${orderDetails.orderNumber || orderId.slice(-6)}`
      });
    }
    
    return notification;
  } catch (error) {
    // Error creating pharmacist notification
  }
};

// Assign order to available pharmacist
const assignOrderToPharmacist = async (orderId) => {
  try {
    const Pharmacist = require('../models/Pharmacist');
    const availablePharmacist = await Pharmacist.findOne({ 
      status: 'approved', 
      isVerified: true 
    }).populate('user');
    
    if (availablePharmacist) {
      await Order.findByIdAndUpdate(orderId, { 
        pharmacist: availablePharmacist._id 
      });
      return availablePharmacist;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Place a new order from the user's cart
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ user: userId });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Manually populate items based on their type
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          if (item.itemType === 'medicine') {
            const Medicine = require('../models/Medicine');
            const medicine = await Medicine.findById(item.item);
            return {
              ...item.toObject(),
              item: medicine
            };
          } else if (item.itemType === 'product') {
            const Product = require('../models/Product');
            const product = await Product.findById(item.item);
            return {
              ...item.toObject(),
              item: product
            };
          }
          return null;
        } catch (err) {
          return null;
        }
      })
    );

    // Filter out null items
    const validCartItems = populatedItems.filter(item => item && item.item);
    

    
    if (validCartItems.length === 0) {
      return res.status(400).json({ message: 'No valid items found in cart' });
    }
    
    // Calculate totals with validation
    let subtotal = 0;
    const validItems = [];
    
    for (const item of validCartItems) {
      if (!item.item) {
        continue;
      }
      
      // Convert to object to access virtual fields
      const itemObj = item.item.toObject ? item.item.toObject() : item.item;
      const price = itemObj.discountedPrice || itemObj.price;
      
      if (!price || isNaN(price)) {
        continue;
      }
      
      subtotal += price * item.quantity;
      validItems.push({...item, item: itemObj});
    }
    
    if (validItems.length === 0) {
      return res.status(400).json({ message: 'No valid items found in cart' });
    }
    
    const tax = subtotal * 0.175; // 17.5% tax
    const total = subtotal + tax;

    // Separate medicines and products
    const medicines = validItems.filter(item => item.itemType === 'medicine').map(item => {
      const price = item.item.discountedPrice || item.item.price;
      return {
        medicine: item.item._id,
        quantity: item.quantity,
        price: price
      };
    });

    const products = validItems.filter(item => item.itemType === 'product').map(item => {
      const price = item.item.discountedPrice || item.item.price;
      return {
        product: item.item._id,
        quantity: item.quantity,
        price: price
      };
    });

    // Create order
    const order = new Order({
      user: userId,
      medicines: medicines.length > 0 ? medicines : undefined,
      products: products.length > 0 ? products : undefined,
      status: 'pending',
      statusTimestamps: { pending: new Date() },
      total: total,
      subtotal: subtotal,
      tax: tax,
      address: req.body.address,
      phone: req.body.phone,
      payment: {
        mode: req.body.payment.mode,
        status: req.body.payment.status,
        cardLast4: req.body.payment.cardLast4
      },
      tracking: {
        updates: [{
          status: 'Order Placed',
          description: 'Your order has been placed successfully and is being processed',
          timestamp: new Date()
        }]
      },
      statusHistory: [{
        status: 'pending',
        timestamp: new Date(),
        changedBy: { user: userId, role: 'customer' }
      }],
      // Initialize delivery assignment for future delivery
      deliveryAssignment: {
        assignmentStatus: 'unassigned',
        availableForAcceptance: false,
        notificationSent: false
      }
    });

    await order.save();
    
    // Assign order to pharmacist
    const assignedPharmacist = await assignOrderToPharmacist(order._id);
    
    // Create user notification
    const userMessage = `Your order #${order.orderNumber} has been placed successfully! Total: ₹${total.toFixed(2)}. We'll notify you when it's ready for shipment.`;
    await createUserNotification(userId, userMessage, order.orderNumber);
    
    // Create pharmacist notification
    const orderDetails = {
      user: userId,
      total: total.toFixed(2),
      items: validItems.length,
      address: req.body.address
    };
    await createPharmacistNotification(order.orderNumber, orderDetails);
    
    // Clear cart after placing order
    cart.items = [];
    await cart.save();
    
    // Emit Socket.IO events for real-time updates
    if (global.io) {
      // Emit to all connected pharmacists
      global.io.to('pharmacists').emit('newOrder', {
        _id: order._id,
        user: { name: req.user.name, email: req.user.email },
        total: total,
        status: 'pending',
        createdAt: order.createdAt,
        isUnassigned: !assignedPharmacist,
        isAssignedToMe: false,
        medicines: medicines,
        products: products,
        playSound: true, // Flag to trigger sound notification
        priority: 'high', // Priority level for notification
        soundType: 'pharmacist' // Specific sound type for pharmacists
      });
      
      // Emit to specific pharmacist if assigned
      if (assignedPharmacist) {
        global.io.to(`pharmacist-${assignedPharmacist._id}`).emit('orderAssigned', {
          _id: order._id,
          user: { name: req.user.name, email: req.user.email },
          total: total,
          status: 'pending',
          createdAt: order.createdAt,
          isUnassigned: false,
          isAssignedToMe: true,
          playSound: true, // Flag to trigger sound notification
          priority: 'high', // Priority level for notification
          soundType: 'pharmacist' // Specific sound type for pharmacists
        });
      }
      
      // Emit to user
      global.io.to(`user-${userId}`).emit('orderPlaced', {
        orderNumber: order.orderNumber,
        status: 'pending',
        message: 'Order placed successfully!'
      });
    }
    
    // Prepare response with order details
    const orderResponse = {
      order: order,
      message: 'Order placed successfully!',
      orderNumber: order.orderNumber,
      total: total.toFixed(2),
      assignedPharmacist: assignedPharmacist ? {
        name: assignedPharmacist.user.name,
        pharmacyName: assignedPharmacist.pharmacyName
      } : null
    };
    
    res.status(201).json(orderResponse);
  } catch (err) {
    res.status(500).json({ message: 'Server error while placing order' });
  }
};

// Get a specific order (must belong to user)
exports.getOrder = async (req, res) => {
  try {
    let order;
    // Try to find by ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      order = await Order.findOne({ _id: req.params.id, user: req.user.id })
        .populate('medicines.medicine')
        .populate('products.product')
        .populate('pharmacist')
        .populate('deliveryBoy');
    }
    // If not found, try by orderNumber
    if (!order) {
      order = await Order.findOne({ orderNumber: req.params.id, user: req.user.id })
        .populate('medicines.medicine')
        .populate('products.product')
        .populate('pharmacist')
        .populate('deliveryBoy');
    }
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error in getOrder:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update/cancel an order (must belong to user or assigned pharmacist)
exports.updateOrder = async (req, res) => {
  try {
    // Resolve pharmacist ObjectId if user is a pharmacist
    let pharmacistId = null;
    if (req.user.role === 'pharmacist') {
      const Pharmacist = require('../models/Pharmacist');
      const pharmacist = await Pharmacist.findOne({ user: req.user.id });
      if (pharmacist) pharmacistId = pharmacist._id;
    }
    // Build order query
    const orderQuery = {
      _id: req.params.id,
      $or: [
        { user: req.user.id },
        pharmacistId ? { pharmacist: pharmacistId } : null
      ].filter(Boolean)
    };
    // Allow user or assigned pharmacist to update
    const order = await Order.findOne(orderQuery);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (req.body.status) {
      order.status = req.body.status;
      if (!order.statusTimestamps) order.statusTimestamps = {};
      const statusKey = req.body.status.toLowerCase().replace(/ /g, '_');
      order.statusTimestamps[statusKey] = new Date();
      // Add to statusHistory
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: req.body.status,
        timestamp: new Date(),
        changedBy: { user: req.user.id, role: req.user.role || 'customer' }
      });
      // Add tracking update
      order.tracking.updates.push({
        status: req.body.status,
        description: req.body.description || `Order status updated to ${req.body.status}`,
        timestamp: new Date()
      });
      // Create notification for status change
      const statusMessage = `Your order #${order.orderNumber} status has been updated to ${req.body.status}`;
      await createUserNotification(req.user.id, statusMessage, order._id);
      // Emit Socket.IO event for real-time update
      if (global.io) {
        global.io.to(`user-${order.user}`).emit('orderStatusUpdated', {
          orderId: order._id,
          status: req.body.status,
          statusTimestamps: order.statusTimestamps,
          statusHistory: order.statusHistory
        });
      }
    }
    
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Track order (must belong to user)
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order.tracking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('medicines.medicine')
      .populate('products.product')
      .populate('pharmacist')
      .populate('deliveryBoy')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error in getUserOrders:', err); // Log the actual error
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

exports.createOrderFromPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const Prescription = require('../models/Prescription');
    const prescription = await Prescription.findById(prescriptionId).populate('user');
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    if (!prescription.medicines || prescription.medicines.length === 0)
      return res.status(400).json({ message: 'No medicines in prescription' });
    if (prescription.ordered)
      return res.status(400).json({ message: 'Order already placed for this prescription' });

    // Create order
    const Order = require('../models/Order');
    const order = new Order({
      user: prescription.user._id,
      medicines: prescription.medicines,
      totalAmount: prescription.totalAmount,
      prescription: prescription._id,
      status: 'placed',
      placedBy: req.user.id,
      placedAt: new Date()
    });
    await order.save();

    // Mark prescription as ordered
    prescription.ordered = true;
    await prescription.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 