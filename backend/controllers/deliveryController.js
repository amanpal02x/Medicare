const DeliveryBoy = require('../models/DeliveryBoy');
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new delivery boy
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      dateOfBirth,
      gender,
      address,
      inviteToken
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !password || !vehicleType || !vehicleNumber) {
      return res.status(400).json({ 
        message: 'Missing required fields: fullName, email, phone, password, vehicleType, vehicleNumber' 
      });
    }

    // Check if invite token is provided and valid
    if (!inviteToken) {
      return res.status(400).json({ message: 'Invite token required for delivery boy registration' });
    }

    const InviteToken = require('../models/InviteToken');
    const tokenDoc = await InviteToken.findOne({ token: inviteToken, role: 'deliveryBoy', status: 'unused' });
    if (!tokenDoc) {
      return res.status(400).json({ message: 'Invalid or already used invite token' });
    }
    if (tokenDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invite token expired' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name: fullName, // Add the name field
      email,
      password: hashedPassword,
      role: 'deliveryBoy'
    });
    await user.save();

    // Create delivery boy profile with pending_approval status
    const deliveryBoy = new DeliveryBoy({
      user: user._id,
      personalInfo: {
        fullName,
        phone,
        email,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
        gender,
        address
      },
      vehicleInfo: {
        vehicleType,
        vehicleNumber
      },
      status: 'pending_approval' // Set initial status to pending_approval
    });
    
    try {
      await deliveryBoy.save();
    } catch (profileError) {
      // If profile creation fails, delete the user and return error
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ message: 'Failed to create delivery profile' });
    }

    // Mark invite token as used
    await InviteToken.findOneAndUpdate(
      { token: inviteToken },
      { status: 'used', usedBy: user._id, usedAt: new Date() }
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Delivery boy registered successfully. Please wait for admin approval.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get delivery boy profile
exports.getProfile = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id })
      .populate('user', 'email');

    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }



    res.json({ deliveryBoy });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery boy profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      personalInfo,
      vehicleInfo,
      workDetails,
      bankDetails,
      settings
    } = req.body;

    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    // Handle profile photo upload
    if (req.file) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.profilePhoto = `/uploads/${req.file.filename}`;
        await user.save();
      }
    }

    // Utility to remove undefined keys from an object
    const omitUndefined = obj => Object.fromEntries(
      Object.entries(obj || {}).filter(([_, v]) => v !== undefined)
    );

    if (personalInfo) {
      const existingPersonalInfo = deliveryBoy.personalInfo || {};
      deliveryBoy.personalInfo = {
        ...omitUndefined(existingPersonalInfo),
        ...omitUndefined(personalInfo)
      };
      if (deliveryBoy.personalInfo.address === undefined || deliveryBoy.personalInfo.address === null) {
        deliveryBoy.personalInfo.address = {};
      }
    }
    // Final fallback: ensure address is always an object
    if (deliveryBoy.personalInfo.address === undefined) {
      delete deliveryBoy.personalInfo.address;
      deliveryBoy.personalInfo.address = {};
    }
    if (!deliveryBoy.personalInfo.address || typeof deliveryBoy.personalInfo.address !== 'object') {
      deliveryBoy.personalInfo.address = {};
    }
    if (vehicleInfo) {
      deliveryBoy.vehicleInfo = { ...deliveryBoy.vehicleInfo, ...vehicleInfo };
    }
    if (workDetails) {
      deliveryBoy.workDetails = { ...deliveryBoy.workDetails, ...workDetails };
    }
    if (bankDetails) {
      deliveryBoy.bankDetails = { ...deliveryBoy.bankDetails, ...bankDetails };
    }
    if (settings) {
      deliveryBoy.settings = { ...deliveryBoy.settings, ...settings };
    }

    await deliveryBoy.save();
    res.json({ message: 'Profile updated successfully', deliveryBoy });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload documents
exports.uploadDocuments = async (req, res) => {
  try {
    const { documentType } = req.params;
    const fileUrl = req.file?.path;

    if (!fileUrl) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    // Update the specific document
    deliveryBoy.documents[documentType] = fileUrl;
    await deliveryBoy.save();

    res.json({ message: 'Document uploaded successfully', documentUrl: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get assigned orders
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    let query = { deliveryBoy: deliveryBoy._id };
    if (status) {
      if (status === 'active') {
        query.status = { $in: ['preparing', 'out_for_delivery', 'accepted'] };
      } else {
        query.status = status;
      }
    }

    const orders = await Order.find(query)
      .populate('user', 'personalInfo.fullName personalInfo.phone personalInfo.email')
      .populate('pharmacist', 'personalInfo.pharmacyName personalInfo.fullName')
      .populate('medicines.medicine', 'name description image')
      .populate('products.product', 'name description image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    const order = await Order.findOne({ _id: id, deliveryBoy: deliveryBoy._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow status update if order is already out_for_delivery
    if (order.status !== 'out_for_delivery') {
      return res.status(400).json({ message: 'You can only update the status after the pharmacist has marked the order as out for delivery.' });
    }

    // Validate allowed statuses for delivery boys
    const allowedStatuses = ['on_the_way', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Delivery boys can only update orders to: ${allowedStatuses.join(', ')}` 
      });
    }

    // Update order status
    order.status = status;
    if (notes) {
      order.deliveryNotes = notes;
    }

    // Update timestamps based on status
    if (status === 'accepted' && !order.acceptedAt) {
      order.acceptedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
      // Calculate delivery time and update performance
      if (order.acceptedAt) {
        const deliveryTime = (order.deliveredAt - order.acceptedAt) / (1000 * 60); // in minutes
        await deliveryBoy.updatePerformance(deliveryTime, true);
      }
    }

    // Update status timestamps
    if (order.statusTimestamps) {
      order.statusTimestamps[status] = new Date();
    }

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      changedBy: {
        user: req.user.id,
        role: 'deliveryBoy'
      }
    });

    await order.save();

    // Send notification to user and pharmacist
    if (global.io) {
      global.io.to(`user-${order.user}`).emit('orderUpdate', {
        orderNumber: order.orderNumber,
        status,
        message: `Your order has been ${status}`
      });

      global.io.to(`pharmacist-${order.pharmacist}`).emit('orderUpdate', {
        orderNumber: order.orderNumber,
        status,
        message: `Order ${order.orderNumber} has been ${status}`
      });
    }

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept order assignment
exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    if (deliveryBoy.status !== 'active') {
      return res.status(400).json({ message: 'Your account is not active' });
    }

    // Check if delivery boy is online
    if (!deliveryBoy.availability?.isOnline) {
      return res.status(400).json({ message: 'You must be online to accept orders' });
    }

    // Check current order limit
    const maxOrders = deliveryBoy.workDetails?.maxOrdersPerDay || 5;
    if (deliveryBoy.workDetails?.currentOrders >= maxOrders) {
      return res.status(400).json({ 
        message: `You have reached your daily order limit (${maxOrders}). Please complete some deliveries first.` 
      });
    }

    // Prevent accepting new order if delivery boy has a 'preparing' order
    const preparingOrder = await Order.findOne({
      deliveryBoy: deliveryBoy._id,
      status: 'preparing'
    });
    if (preparingOrder) {
      return res.status(400).json({
        message: 'You must complete your current preparing order before accepting a new one.'
      });
    }

    // ATOMIC: Try to claim the order only if it's still available
    const now = new Date();
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        $or: [
          // Orders that are explicitly assigned and available for acceptance
          {
            'deliveryAssignment.assignmentStatus': 'assigned',
            'deliveryAssignment.availableForAcceptance': true,
            'deliveryAssignment.acceptedBy': null,
            status: 'preparing'
          },
          // Orders that are preparing but not yet assigned to any delivery boy
          {
            status: 'preparing',
            deliveryBoy: null,
            'deliveryAssignment.assignmentStatus': { $in: ['unassigned', 'assigned'] }
          }
        ],
        // Exclude orders that this delivery boy has already rejected
        $or: [
          { 'deliveryAssignment.rejectedByDeliveryBoys': { $exists: false } },
          { 'deliveryAssignment.rejectedByDeliveryBoys': { $size: 0 } },
          {
            'deliveryAssignment.rejectedByDeliveryBoys': {
              $not: {
                $elemMatch: {
                  deliveryBoy: deliveryBoy._id
                }
              }
            }
          }
        ]
      },
      {
        $set: {
          deliveryBoy: deliveryBoy._id,
          'deliveryAssignment.acceptedAt': now,
          'deliveryAssignment.acceptedBy': deliveryBoy._id,
          'deliveryAssignment.assignmentStatus': 'accepted',
          'deliveryAssignment.availableForAcceptance': false,
          'deliveryAssignment.assignedAt': now,
          'deliveryAssignment.assignedBy': deliveryBoy._id // Self-assigned
        }
      },
      { new: true }
    )
    .populate('user', 'personalInfo.fullName personalInfo.phone personalInfo.email');

    if (!order) {
      return res.status(400).json({ message: 'Order has already been accepted by another delivery agent or is not available.' });
    }

    // Update delivery boy current orders
    deliveryBoy.workDetails.currentOrders += 1;
    await deliveryBoy.save();

    // Send notifications
    if (global.io) {
      // Notify admin
      global.io.to('admin').emit('orderAccepted', {
        orderNumber: order.orderNumber,
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.personalInfo.fullName,
          phone: deliveryBoy.personalInfo.phone
        },
        message: `Order ${order.orderNumber} has been accepted by ${deliveryBoy.personalInfo.fullName}`,
        playSound: true, // Flag to trigger sound notification
        priority: 'normal', // Priority level for notification
        soundType: 'delivery' // Specific sound type for delivery personnel
      });

      // Notify user
      global.io.to(`user-${order.user._id}`).emit('orderUpdate', {
        orderNumber: order.orderNumber,
        status: 'out_for_delivery',
        message: `Your order is out for delivery with ${deliveryBoy.personalInfo.fullName}`,
        deliveryBoy: {
          name: deliveryBoy.personalInfo.fullName,
          phone: deliveryBoy.personalInfo.phone
        }
      });

      // Notify pharmacist
      if (order.pharmacist) {
        global.io.to(`pharmacist-${order.pharmacist}`).emit('orderUpdate', {
          orderNumber: order.orderNumber,
          status: 'out_for_delivery',
          message: `Order ${order.orderNumber} is out for delivery with ${deliveryBoy.personalInfo.fullName}`,
          playSound: true, // Flag to trigger sound notification
          priority: 'normal', // Priority level for notification
          soundType: 'pharmacist' // Specific sound type for pharmacists
        });
      }

      // Notify all delivery boys to remove this order from their notifications
      global.io.to('delivery-boys').emit('orderNoLongerAvailable', {
        orderNumber: order.orderNumber
      });
    }

    res.json({ 
      message: 'Order accepted successfully! You can now proceed with the delivery.',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        customerInfo: {
          name: order.user.personalInfo?.fullName || 'Customer',
          phone: order.phone,
          email: order.user.personalInfo?.email,
          address: order.address
        },
        deliveryBoy: {
          name: deliveryBoy.personalInfo.fullName,
          phone: deliveryBoy.personalInfo.phone
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject order assignment
exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    const order = await Order.findById(orderId)
      .populate('user', 'personalInfo.fullName personalInfo.phone');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is available for rejection (either assigned, available for acceptance, or preparing without delivery boy)
    if (order.deliveryAssignment.assignmentStatus !== 'assigned' && 
        !order.deliveryAssignment.availableForAcceptance &&
        !(order.status === 'preparing' && !order.deliveryBoy)) {
      return res.status(400).json({ message: 'Order is not available for rejection' });
    }

    // Check if this delivery boy has already rejected this order
    const alreadyRejected = order.deliveryAssignment.rejectedByDeliveryBoys?.some(
      rejection => rejection.deliveryBoy.toString() === deliveryBoy._id.toString()
    );

    if (alreadyRejected) {
      return res.status(400).json({ message: 'You have already rejected this order' });
    }

    // Add this delivery boy to the rejected list instead of marking entire order as rejected
    if (!order.deliveryAssignment.rejectedByDeliveryBoys) {
      order.deliveryAssignment.rejectedByDeliveryBoys = [];
    }
    
    order.deliveryAssignment.rejectedByDeliveryBoys.push({
      deliveryBoy: deliveryBoy._id,
      rejectedAt: new Date(),
      reason: reason || 'No reason provided'
    });

    // Keep the order available for other delivery boys
    // Only mark as rejected if all available delivery boys have rejected it
    // For now, we'll keep it available unless explicitly assigned to this delivery boy
    if (order.deliveryAssignment.assignedBy && order.deliveryAssignment.assignedBy.toString() === deliveryBoy._id.toString()) {
      // If this delivery boy was specifically assigned, mark as rejected
      order.deliveryAssignment.assignmentStatus = 'rejected';
      order.deliveryAssignment.availableForAcceptance = false;
      order.deliveryAssignment.rejectedAt = new Date();
      order.deliveryAssignment.rejectedBy = deliveryBoy._id;
      order.deliveryAssignment.rejectionReason = reason || 'No reason provided';
      order.deliveryBoy = null;
    }
    // Otherwise, keep the order available for other delivery boys

    // Add to status history
    order.statusHistory.push({
      status: 'rejected_by_delivery',
      timestamp: new Date(),
      changedBy: {
        user: req.user.id,
        role: 'deliveryBoy'
      },
      notes: reason || 'Order ignored by delivery agent'
    });

    await order.save();

    // Send notification to admin
    if (global.io) {
      global.io.to('admin').emit('orderRejected', {
        orderNumber: order.orderNumber,
        deliveryBoy: {
          id: deliveryBoy._id,
          name: deliveryBoy.personalInfo.fullName,
          phone: deliveryBoy.personalInfo.phone
        },
        reason: reason || 'No reason provided',
        message: `Order ${order.orderNumber} was ignored by ${deliveryBoy.personalInfo.fullName}`,
        timestamp: new Date(),
        stillAvailable: order.deliveryAssignment.assignmentStatus !== 'rejected'
      });
    }

    res.json({ 
      message: 'Order rejected successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        stillAvailable: order.deliveryAssignment.assignmentStatus !== 'rejected'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get available orders for acceptance
exports.getAvailableOrders = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    if (deliveryBoy.status !== 'active') {
      return res.status(400).json({ message: 'Your account is not active' });
    }

    // Check if delivery boy is online
    if (!deliveryBoy.availability?.isOnline) {
      return res.json({ 
        message: 'You need to be online to see available orders',
        data: [],
        requiresOnline: true
      });
    }

    // Import timeout handler
    const { getRemainingTime } = require('../utils/orderTimeoutHandler');
    const now = new Date();

    // Find orders available for acceptance - only those not expired
    const availableOrders = await Order.find({
      $and: [
        {
          $or: [
            // Orders that are explicitly assigned and available for acceptance
            {
              'deliveryAssignment.assignmentStatus': 'assigned',
              'deliveryAssignment.availableForAcceptance': true,
              'deliveryAssignment.acceptedBy': null,
              status: 'preparing'
            },
            // Orders that are preparing and unassigned (regardless of availableForAcceptance)
            {
              status: 'preparing',
              deliveryBoy: null,
              'deliveryAssignment.assignmentStatus': 'unassigned'
            },
            // Orders that are preparing and assigned but not yet accepted
            {
              status: 'preparing',
              deliveryBoy: null,
              'deliveryAssignment.assignmentStatus': 'assigned',
              'deliveryAssignment.acceptedBy': null
            }
          ]
        },
        // Check expiration time
        {
          $or: [
            { 'deliveryAssignment.expiresAt': { $gt: now } },
            { 'deliveryAssignment.expiresAt': { $exists: false } },
            { 'deliveryAssignment.expiresAt': null }
          ]
        },
        // Exclude orders that this delivery boy has already rejected
        {
          $or: [
            { 'deliveryAssignment.rejectedByDeliveryBoys': { $exists: false } },
            { 'deliveryAssignment.rejectedByDeliveryBoys': { $size: 0 } },
            {
              'deliveryAssignment.rejectedByDeliveryBoys': {
                $not: {
                  $elemMatch: {
                    deliveryBoy: deliveryBoy._id
                  }
                }
              }
            }
          ]
        }
      ]
    })
    .populate('user', 'personalInfo.fullName personalInfo.phone personalInfo.email')
    .populate('pharmacist', 'personalInfo.pharmacyName personalInfo.fullName')
    .populate('medicines.medicine', 'name description image price')
    .populate('products.product', 'name description image price')
    .sort({ 'deliveryAssignment.assignedAt': 1, createdAt: -1 })
    .limit(20);

    res.json({
      message: 'Available orders retrieved successfully',
      data: availableOrders,
      requiresOnline: false
    });
  } catch (error) {
    console.error('Error in getAvailableOrders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update online status
exports.updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    deliveryBoy.availability.isOnline = isOnline;
    deliveryBoy.availability.lastSeen = new Date();
    await deliveryBoy.save();

    // Send notification to admin about status change
    if (global.io) {
      global.io.to('admin').emit('deliveryBoyStatusChange', {
        deliveryBoyId: deliveryBoy._id,
        name: deliveryBoy.personalInfo.fullName,
        isOnline,
        message: `${deliveryBoy.personalInfo.fullName} is now ${isOnline ? 'online' : 'offline'}`
      });
    }

    res.json({ 
      message: `Status updated to ${isOnline ? 'online' : 'offline'}`,
      isOnline: deliveryBoy.availability.isOnline
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update current location
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    await deliveryBoy.updateLocation(lat, lng, address);

    res.json({ 
      message: 'Location updated successfully',
      location: deliveryBoy.location.current
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update delivery boy location and online status (GeoJSON)
exports.updateLocationAndStatus = async (req, res) => {
  try {
    const { lat, lng, online } = req.body;
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    if (!deliveryBoy) return res.status(404).json({ message: 'Delivery boy not found' });
    
    // Store GeoJSON point for geospatial queries
    deliveryBoy.locationGeo = { type: 'Point', coordinates: [lng, lat] };
    if (typeof online === 'boolean') deliveryBoy.availability.isOnline = online;
    // Also update current location fields for backward compatibility
    deliveryBoy.location.current = {
      lat,
      lng,
      address: deliveryBoy.location.current?.address || '',
      lastUpdated: new Date()
    };
    await deliveryBoy.save();
    
    // Emit socket event for online status change
    if (global.io && typeof online === 'boolean') {
      global.io.to(`delivery-${deliveryBoy._id}`).emit('onlineStatusUpdate', {
        deliveryBoyId: deliveryBoy._id,
        isOnline: online,
        timestamp: new Date()
      });
    }
    
    res.json({ message: 'Location and status updated', deliveryBoy });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get nearby orders for delivery boy (based on GeoJSON location)
exports.getNearbyOrders = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });
    // Find orders with location near the delivery boy
    const orders = await Order.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get earnings
exports.getEarnings = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });

    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    let earnings = {};
    switch (period) {
      case 'today':
        earnings = { today: deliveryBoy.earnings.today };
        break;
      case 'week':
        earnings = { thisWeek: deliveryBoy.earnings.thisWeek };
        break;
      case 'month':
        earnings = { thisMonth: deliveryBoy.earnings.thisMonth };
        break;
      default:
        earnings = deliveryBoy.earnings;
    }

    res.json(earnings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get performance stats
exports.getPerformance = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });

    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    const performance = {
      ...deliveryBoy.performance,
      successRate: deliveryBoy.successRate,
      averageRating: deliveryBoy.ratings.average,
      totalRatings: deliveryBoy.ratings.totalRatings
    };

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle availability status
exports.toggleAvailability = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });

    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    deliveryBoy.status = deliveryBoy.status === 'active' ? 'inactive' : 'active';
    await deliveryBoy.save();

    res.json({ 
      message: `Status updated to ${deliveryBoy.status}`,
      status: deliveryBoy.status 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get individual order details
exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    const order = await Order.findOne({ _id: id, deliveryBoy: deliveryBoy._id })
      .populate('user', 'personalInfo.fullName personalInfo.phone personalInfo.email')
      .populate('pharmacist', 'personalInfo.pharmacyName personalInfo.fullName personalInfo.phone')
      .populate('medicines.medicine', 'name description image price')
      .populate('products.product', 'name description image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get nearby orders (for auto-assignment)
exports.getNearbyOrders = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10 } = req.query;
    const deliveryBoy = await DeliveryBoy.findOne({ user: req.user.id });

    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy profile not found' });
    }

    // Find orders without delivery boy assigned
    const orders = await Order.find({
      status: 'preparing',
      deliveryBoy: null
    }).populate('user', 'personalInfo.fullName personalInfo.phone personalInfo.address');

    // Filter orders by distance (simplified calculation)
    const nearbyOrders = orders.filter(order => {
      const orderLat = order.deliveryAddress?.lat;
      const orderLng = order.deliveryAddress?.lng;
      
      if (!orderLat || !orderLng) return false;

      const distance = Math.sqrt(
        Math.pow(lat - orderLat, 2) + Math.pow(lng - orderLng, 2)
      ) * 111; // Rough conversion to km

      return distance <= maxDistance;
    });

    res.json(nearbyOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create delivery boy profile for existing user
exports.createProfile = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      vehicleType,
      vehicleNumber,
      dateOfBirth,
      gender,
      address
    } = req.body;

    // Check if delivery boy profile already exists
    const existingProfile = await DeliveryBoy.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Delivery boy profile already exists' });
    }

    // Get user details
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create delivery boy profile
    const deliveryBoyData = {
      user: user._id,
      personalInfo: {
        fullName: fullName || user.name,
        phone: phone || user.phone || '',
        email: user.email,
        dateOfBirth: dateOfBirth || new Date(),
        gender: gender || 'male',
        address: address || {
          street: user.address || '',
          city: user.city || '',
          state: user.state || '',
          pincode: user.pincode || '',
          country: 'India'
        }
      },
      vehicleInfo: {
        vehicleType: vehicleType || 'bike',
        vehicleNumber: vehicleNumber || ''
      }
    };
    const deliveryBoy = new DeliveryBoy(deliveryBoyData);
    await deliveryBoy.save();

    res.status(201).json({
      message: 'Delivery boy profile created successfully',
      deliveryBoy
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};