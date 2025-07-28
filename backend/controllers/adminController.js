const Order = require('../models/Order');
const Sale = require('../models/Sale');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const mongoose = require('mongoose');
const DeliveryBoy = require('../models/DeliveryBoy');
const Invoice = require('../models/Invoice');
const { Notification: SupportTicket, UserNotification } = require('../models/Notification');
const Pharmacist = require('../models/Pharmacist');
const Category = require('../models/Category');
const Product = require('../models/Product');
const InviteToken = require('../models/InviteToken');
const crypto = require('crypto');

const dashboard = async (req, res) => {
  try {
    // 1. Total Orders Today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const totalOrdersToday = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

    // 2. Total Sales This Month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const salesThisMonth = await Sale.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalSalesThisMonth = salesThisMonth[0]?.total || 0;

    // 3. Out-of-Stock Alerts
    const outOfStock = await Medicine.find({ stock: { $lte: 0 } }).select('name');

    // 4. Top Selling Medicines (this month)
    const topSelling = await Sale.aggregate([
      { $match: { date: { $gte: startOfMonth }, itemType: 'Medicine' } },
      { $group: { _id: '$item', totalSold: { $sum: '$quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'medicines', localField: '_id', foreignField: '_id', as: 'medicine' } },
      { $unwind: '$medicine' },
      { $project: { _id: 0, name: '$medicine.name', totalSold: 1 } }
    ]);

    // 5. New Users This Week
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek }, role: 'user' });

    // 6. Pending Prescriptions
    const pendingPrescriptions = await Prescription.countDocuments({ status: 'pending' });

    res.json({
      totalOrdersToday,
      totalSalesThisMonth,
      outOfStock,
      topSelling,
      newUsersThisWeek,
      pendingPrescriptions
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' });
    // Ensure all users have a 'blocked' field
    const usersWithBlocked = users.map(u => ({
      ...u.toObject(),
      blocked: typeof u.blocked === 'undefined' ? false : u.blocked
    }));
    res.json(usersWithBlocked);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const blockUser = async (req, res) => {
  try {
    // Get the current user to check their blocked status
    const currentUser = await User.findById(req.params.id);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Toggle the blocked status
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: !currentUser.blocked },
      { new: true }
    );
    
    // Send notification to user
    if (global.io) {
      global.io.to(`user-${user._id}`).emit('accountStatus', {
        blocked: user.blocked,
        message: user.blocked ? 'Your account has been blocked' : 'Your account has been unblocked'
      });
    }
    
    res.json({ 
      message: `User ${user.blocked ? 'blocked' : 'unblocked'} successfully`, 
      user 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

const getPharmacies = (req, res) => res.send('Get pharmacies');
const verifyPharmacy = (req, res) => res.send('Verify pharmacy');
const analytics = async (req, res) => {
  try {
    // Example: return order count by month, sales by month, user growth, etc.
    const orderStats = await Order.aggregate([
      { $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 }
      } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    const salesStats = await Invoice.aggregate([
      { $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        total: { $sum: '$netTotal' }
      } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json({ orderStats, salesStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
const getSettings = (req, res) => res.send('Get admin settings');
const updateSettings = (req, res) => res.send('Update admin settings');

const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;
    
    let match = {};
    if (status) {
      match.status = status;
    }
    // Add search support
    if (search) {
      match.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }
    // Remove undefined $or entries
    if (match.$or) match.$or = match.$or.filter(Boolean);
    
    // Use aggregation for search on populated fields
    const pipeline = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      // Populate user, pharmacist, deliveryBoy, etc.
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'pharmacists', localField: 'pharmacist', foreignField: '_id', as: 'pharmacist' } },
      { $unwind: { path: '$pharmacist', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'deliveryboys', localField: 'deliveryBoy', foreignField: '_id', as: 'deliveryBoy' } },
      { $unwind: { path: '$deliveryBoy', preserveNullAndEmptyArrays: true } },
      { $project: { orderNumber: 1, _id: 1, user: 1, pharmacist: 1, deliveryBoy: 1, status: 1, total: 1, createdAt: 1 } }
    ];
    const orders = await Order.aggregate(pipeline);
    // For total count (without pagination)
    const total = await Order.countDocuments(match);
    // Global stats (not filtered)
    const totalOrders = await Order.countDocuments();
    const deliveredCount = await Order.countDocuments({ status: 'delivered' });
    const pendingCount = await Order.countDocuments({ status: 'pending' });
    const cancelledCount = await Order.countDocuments({ status: 'cancelled' });
    
    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: {
        total: totalOrders,
        delivered: deliveredCount,
        pending: pendingCount,
        cancelled: cancelledCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address city state pincode')
      .populate('pharmacist', 'personalInfo.fullName personalInfo.pharmacyName personalInfo.phone personalInfo.address')
      .populate('deliveryBoy', 'personalInfo.fullName personalInfo.phone vehicleInfo.vehicleType vehicleInfo.vehicleNumber')
      .populate('medicines.medicine', 'name description price image stock manufacturer expiryDate')
      .populate('products.product', 'name description price image stock category')
      .populate('deliveryAssignment.assignedBy', 'name email')
      .populate('deliveryAssignment.acceptedBy', 'personalInfo.fullName personalInfo.phone')
      .populate('statusHistory.changedBy.user', 'name email role');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Restrict status changes if order is delivered or cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Order status cannot be changed after it is delivered or cancelled.' });
    }

    // Enforce one-way status flow: cannot move to a previous status
    const statusOrder = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    const prevIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);
    if (newIndex < prevIndex) {
      return res.status(400).json({ error: 'Order status cannot be reverted to a previous state.' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Deliveries
const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Order.find({ deliveryBoy: { $exists: true } })
      .populate('deliveryBoy', 'name email')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
};
const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryBoyId } = req.body;
    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryBoy: deliveryBoyId },
      { new: true }
    ).populate('deliveryBoy', 'personalInfo.fullName');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Send notification to delivery boy
    if (global.io) {
      global.io.to(`delivery-${deliveryBoyId}`).emit('newOrder', {
        orderNumber: order.orderNumber,
        message: 'You have been assigned a new order'
      });
    }
    
    res.json({ message: 'Delivery boy assigned successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign delivery boy' });
  }
};
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update delivery status' });
  }
};

// Payments
const getPayments = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 }).populate({
      path: 'pharmacist',
      select: 'pharmacyName personalInfo',
    });
    
    // Transform the data to match frontend expectations
    const transformedPayments = invoices.map(invoice => ({
      _id: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      date: invoice.date,
      pharmacist: invoice.pharmacist,
      totalAmount: invoice.totalAmount,
      totalDiscount: invoice.totalDiscount,
      netTotal: invoice.netTotal,
      status: invoice.status,
      createdAt: invoice.createdAt
    }));
    
    res.json(transformedPayments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Refunds
const getRefunds = async (req, res) => {
  try {
    const refunds = await Invoice.find({ refundRequested: true }).sort({ createdAt: -1 });
    res.json(refunds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch refunds' });
  }
};
const updateRefundStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'denied'
    const payment = await Invoice.findByIdAndUpdate(req.params.id, { refundStatus: status }, { new: true });
    if (!payment) return res.status(404).json({ error: 'Refund not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update refund status' });
  }
};

// Support Tickets
const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ type: 'support' })
      .sort({ createdAt: -1 })
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email role')
      .populate('conversation.sender', 'name email role')
      .populate('order', 'orderNumber _id');
    
    // Add a 'message' field at the root for DataGrid compatibility
    const ticketsWithMessage = tickets.map(t => {
      const ticketObj = t.toObject();
      return {
        ...ticketObj,
        message: ticketObj.conversation && ticketObj.conversation.length > 0 ? ticketObj.conversation[0].message : '',
        // Ensure all required fields are present
        user: ticketObj.user || { name: 'Unknown', email: 'unknown@example.com', role: 'user' },
        status: ticketObj.status || 'open',
        category: ticketObj.category || 'general'
      };
    });
    
    res.json(ticketsWithMessage);
  } catch (err) {
    console.error('Error fetching support tickets:', err);
    res.status(500).json({ error: 'Failed to fetch support tickets', details: err.message });
  }
};
const replySupportTicket = async (req, res) => {
  try {
    const message = req.body.message || req.body.reply;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const files = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { conversation: { sender: req.user.id, message, files } },
        status: 'replied'
      },
      { new: true }
    ).populate('user', 'name email role').populate('assignedTo', 'name email role').populate('conversation.sender', 'name email role');
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const orderId = ticket.order ? ticket.order.toString() : undefined;
    const hasOrder = !!orderId;
    const notificationObj = {
      user: ticket.user._id || ticket.user,
      message: hasOrder
        ? `Admin replied to your support ticket for order ${orderId}. Click to view the chat.`
        : 'Admin replied to your support ticket. Click to view your tickets.',
      link: hasOrder ? `/orders/${orderId}/chat` : `/support`,
      ticketId: ticket._id,
      replyPreview: message.substring(0, 150),
      adminName: req.user.name || 'Admin',
      type: 'admin_reply',
      ...(hasOrder ? { orderId } : {})
    };
    console.log('Creating notification (adminController):', notificationObj);
    await UserNotification.create(notificationObj);
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reply to support ticket' });
  }
};
const closeSupportTicket = async (req, res) => {
  try {
    // Find the first admin to use as sender for the system message
    const admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    const systemMessage = {
      sender: admin ? admin._id : req.user.id, // fallback to current user if no admin found
      message: 'Ticket closed, hope you got the solution.',
      files: [],
      timestamp: new Date()
    };
    // Push the system message and close the ticket
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { conversation: systemMessage },
        status: 'closed' 
      },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: 'Failed to close ticket' });
  }
};

// Delivery Boy Management
const getDeliveryBoys = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const deliveryBoys = await DeliveryBoy.find(query)
      .populate('user', 'email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await DeliveryBoy.countDocuments(query);
    
    res.json({
      deliveryBoys,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery boys' });
  }
};

const getDeliveryBoyById = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id)
      .populate('user', 'email')
      .populate('ratings.reviews.orderId', 'orderNumber');
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    res.json(deliveryBoy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery boy' });
  }
};

const updateDeliveryBoyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'email');
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    // Send notification to delivery boy
    if (global.io) {
      global.io.to(`delivery-${deliveryBoy._id}`).emit('statusUpdate', {
        status,
        message: `Your status has been updated to ${status}`
      });
    }
    
    res.json(deliveryBoy);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update delivery boy status' });
  }
};

const approveDeliveryBoy = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).populate('user', 'email');
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    // Send notification
    if (global.io) {
      global.io.to(`delivery-${deliveryBoy._id}`).emit('approval', {
        message: 'Your account has been approved! You can now start accepting orders.'
      });
    }
    
    res.json({ message: 'Delivery boy approved successfully', deliveryBoy });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve delivery boy' });
  }
};

const suspendDeliveryBoy = async (req, res) => {
  try {
    const { reason } = req.body;
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'suspended',
        suspensionReason: reason,
        suspendedAt: new Date()
      },
      { new: true }
    ).populate('user', 'email');
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    // Send notification
    if (global.io) {
      global.io.to(`delivery-${deliveryBoy._id}`).emit('suspension', {
        reason,
        message: 'Your account has been suspended'
      });
    }
    
    res.json({ message: 'Delivery boy suspended successfully', deliveryBoy });
  } catch (err) {
    res.status(500).json({ error: 'Failed to suspend delivery boy' });
  }
};

const getDeliveryBoyPerformance = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    res.json(deliveryBoy.performance);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
};

const getDeliveryBoyEarnings = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch earnings data' });
  }
};

const getDeliveryBoyOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { deliveryBoy: req.params.id };
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'personalInfo.fullName personalInfo.phone')
      .populate('pharmacist', 'personalInfo.pharmacyName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

const assignDeliveryBoyToOrder = async (req, res) => {
  try {
    const { deliveryBoyId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryBoy: deliveryBoyId },
      { new: true }
    ).populate('deliveryBoy', 'personalInfo.fullName');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Send notification to delivery boy
    if (global.io) {
      global.io.to(`delivery-${deliveryBoyId}`).emit('newOrder', {
        orderNumber: order.orderNumber,
        message: 'You have been assigned a new order'
      });
    }
    
    res.json({ message: 'Delivery boy assigned successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign delivery boy' });
  }
};

const getUnassignedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const orders = await Order.find({ 
      status: 'preparing',
      deliveryBoy: null 
    })
    .populate('user', 'personalInfo.fullName personalInfo.phone')
    .populate('pharmacist', 'personalInfo.pharmacyName')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments({ 
      status: 'preparing',
      deliveryBoy: null 
    });
    
    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch unassigned orders' });
  }
};

const getDeliveryStatistics = async (req, res) => {
  try {
    const totalDeliveryBoys = await DeliveryBoy.countDocuments();
    const activeDeliveryBoys = await DeliveryBoy.countDocuments({ status: 'active' });
    const pendingDeliveryBoys = await DeliveryBoy.countDocuments({ status: 'pending_approval' });
    const suspendedDeliveryBoys = await DeliveryBoy.countDocuments({ status: 'suspended' });
    
    const totalOrders = await Order.countDocuments({ deliveryBoy: { $exists: true, $ne: null } });
    const completedOrders = await Order.countDocuments({ 
      deliveryBoy: { $exists: true, $ne: null },
      status: 'delivered'
    });
    
    res.json({
      totalDeliveryBoys,
      activeDeliveryBoys,
      pendingDeliveryBoys,
      suspendedDeliveryBoys,
      totalOrders,
      completedOrders,
      completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery statistics' });
  }
};

const getDeliveryPerformanceOverview = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get performance data for the specified period
    const deliveryBoys = await DeliveryBoy.find({ status: 'active' });
    
    const performanceData = deliveryBoys.map(db => ({
      id: db._id,
      name: db.personalInfo.fullName,
      successRate: db.performance.successRate,
      totalDeliveries: db.performance.totalDeliveries,
      averageDeliveryTime: db.performance.averageDeliveryTime,
      earnings: db.earnings.totalEarned
    }));
    
    res.json(performanceData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch performance overview' });
  }
};

const getAvailableDeliveryBoys = async (req, res) => {
  try {
    const DeliveryBoy = require('../models/DeliveryBoy');
    const deliveryBoys = await DeliveryBoy.find({ 
      status: 'active',
      'availability.isOnline': true 
    }).populate('user', 'name email');

    res.json(deliveryBoys);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const autoAssignDeliveryBoy = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Find the nearest available delivery boy
    const deliveryBoy = await DeliveryBoy.findOne({
      status: 'active',
      'workDetails.currentOrders': { $lt: 'workDetails.maxOrdersPerDay' }
    }).sort({ 'location.current': 1 });
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'No available delivery boys' });
    }
    
    // Assign the delivery boy
    order.deliveryBoy = deliveryBoy._id;
    await order.save();
    
    // Update delivery boy's current orders count
    deliveryBoy.workDetails.currentOrders += 1;
    await deliveryBoy.save();
    
    // Send notification
    if (global.io) {
      global.io.to(`delivery-${deliveryBoy._id}`).emit('newOrder', {
        orderNumber: order.orderNumber,
        message: 'You have been assigned a new order'
      });
    }
    
    res.json({ message: 'Delivery boy auto-assigned successfully', order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to auto-assign delivery boy' });
  }
};

// Additional methods for comprehensive delivery management
const getDeliveryBoyLocationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    // This would typically come from a separate location history collection
    // For now, we'll return a mock response
    res.json({
      locations: [],
      pagination: { current: 1, total: 1, hasNext: false, hasPrev: false }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch location history' });
  }
};

const updateDeliveryBoyWorkArea = async (req, res) => {
  try {
    const { workArea } = req.body;
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { 'workDetails.workArea': workArea },
      { new: true }
    );
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    res.json({ message: 'Work area updated successfully', deliveryBoy });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update work area' });
  }
};

const getDeliveryBoyDocuments = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    res.json(deliveryBoy.documents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

const verifyDeliveryBoyDocument = async (req, res) => {
  try {
    const { verified } = req.body;
    const { type } = req.params;
    
    const deliveryBoy = await DeliveryBoy.findByIdAndUpdate(
      req.params.id,
      { [`documents.${type}Verified`]: verified },
      { new: true }
    );
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    res.json({ message: 'Document verification updated', deliveryBoy });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update document verification' });
  }
};

const getDeliveryBoyReviews = async (req, res) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id)
      .populate('ratings.reviews.orderId', 'orderNumber');
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    res.json(deliveryBoy.ratings.reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

const sendNotificationToDeliveryBoy = async (req, res) => {
  try {
    const { message, type = 'info' } = req.body;
    
    if (global.io) {
      global.io.to(`delivery-${req.params.id}`).emit('adminNotification', {
        message,
        type,
        timestamp: new Date()
      });
    }
    
    res.json({ message: 'Notification sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
};

const getDeliveryBoySchedule = async (req, res) => {
  try {
    const { date } = req.query;
    // This would typically come from a schedule collection
    // For now, return mock data
    res.json({
      date,
      schedule: {
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: true
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
};

const updateDeliveryBoySchedule = async (req, res) => {
  try {
    const { schedule } = req.body;
    // This would typically update a schedule collection
    res.json({ message: 'Schedule updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

const getDeliveryBoyAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found' });
    }
    
    // Return analytics data
    res.json({
      period,
      performance: deliveryBoy.performance,
      earnings: deliveryBoy.earnings,
      ratings: deliveryBoy.ratings
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

const bulkUpdateDeliveryBoyStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    const result = await DeliveryBoy.updateMany(
      { _id: { $in: ids } },
      { status }
    );
    
    res.json({ 
      message: `${result.modifiedCount} delivery boys updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk update status' });
  }
};

const bulkAssignDeliveryBoys = async (req, res) => {
  try {
    const { assignments } = req.body;
    
    const results = [];
    for (const assignment of assignments) {
      const order = await Order.findByIdAndUpdate(
        assignment.orderId,
        { deliveryBoy: assignment.deliveryBoyId },
        { new: true }
      );
      results.push(order);
    }
    
    res.json({ 
      message: `${results.length} orders assigned successfully`,
      results
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk assign delivery boys' });
  }
};

const exportDeliveryBoyData = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find().populate('user', 'email');
    
    // Convert to CSV format
    const csvData = deliveryBoys.map(db => ({
      'Full Name': db.personalInfo.fullName,
      'Email': db.personalInfo.email,
      'Phone': db.personalInfo.phone,
      'Vehicle Type': db.vehicleInfo.vehicleType,
      'Vehicle Number': db.vehicleInfo.vehicleNumber,
      'Status': db.status,
      'Total Deliveries': db.performance.totalDeliveries,
      'Success Rate': db.performance.successRate,
      'Total Earnings': db.earnings.totalEarned,
      'Average Rating': db.ratings.average
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=delivery-boys-${new Date().toISOString().split('T')[0]}.csv`);
    
    // Convert to CSV string
    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    res.send(csvString);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data' });
  }
};

const getMedicines = async (req, res) => {
  try {
    const { pharmacist } = req.query;
    let medFilter = {};
    let prodFilter = {};
    // Only filter if pharmacist is a valid, non-empty value
    if (pharmacist && pharmacist !== 'null' && pharmacist !== 'undefined' && pharmacist !== '') {
      medFilter.pharmacist = pharmacist;
      prodFilter.pharmacist = pharmacist;
    }
    
    // Fetch all medicines, populate pharmacist and category if present
    const medicines = await Medicine.find(medFilter)
      .populate({
        path: 'pharmacist',
        select: 'pharmacyName user',
        populate: { path: 'user', select: 'name' }
      })
      .populate({
        path: 'category',
        select: 'name'
      });
    
    // Fetch all products, populate pharmacist and category
    const products = await Product.find(prodFilter)
      .populate({
        path: 'pharmacist',
        select: 'pharmacyName user',
        populate: { path: 'user', select: 'name' }
      })
      .populate({
        path: 'category',
        select: 'name'
      });
    
    // Add discountedPrice to each
    const medicinesWithDiscount = medicines.map(med => ({
      ...med.toObject({ virtuals: true })
    }));
    const productsWithDiscount = products.map(prod => ({
      ...prod.toObject({ virtuals: true })
    }));
    
    res.json({ medicines: medicinesWithDiscount, products: productsWithDiscount });
  } catch (err) {
    console.error('Admin getMedicines - error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const addMedicine = (req, res) => res.send('Add medicine');
const updateMedicine = (req, res) => res.send('Update medicine');
const deleteMedicine = (req, res) => res.send('Delete medicine');
const getPrescriptions = (req, res) => res.send('Get prescriptions');
const approvePrescription = (req, res) => res.send('Approve prescription');
const rejectPrescription = (req, res) => res.send('Reject prescription');

// List all pending pharmacists
const getPendingPharmacists = async (req, res) => {
  try {
    const pending = await Pharmacist.find({ status: 'pending' })
      .populate('user', 'name email')
      .select('pharmacyName contact address kycDocs timings user');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve a pharmacist
const approvePharmacist = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacist = await Pharmacist.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    res.json({ message: 'Pharmacist approved', pharmacist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject a pharmacist
const rejectPharmacist = async (req, res) => {
  try {
    const { id } = req.params;
    const pharmacist = await Pharmacist.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    res.json({ message: 'Pharmacist rejected', pharmacist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List all approved pharmacists
const getApprovedPharmacists = async (req, res) => {
  try {
    const approved = await Pharmacist.find({ status: 'approved' })
      .populate('user', 'name email')
      .select('pharmacyName contact address kycDocs timings user');
    res.json(approved);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Special admin-only delete for approved pharmacists
const forceDeletePharmacist = async (req, res) => {
  try {
    const { id } = req.params;
    // Allow admin and superadmin
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ message: 'Forbidden: Only admin or superadmin can force delete.' });
    }
    const pharmacist = await Pharmacist.findById(id);
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    // Remove the associated user account
    await User.deleteOne({ _id: pharmacist.user });
    // Remove the pharmacist document
    await Pharmacist.deleteOne({ _id: id });
    res.json({ message: 'Pharmacist and user account force deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a delivery boy and their user account (admin only)
const deleteDeliveryBoy = async (req, res) => {
  try {
    const id = req.params.id;
    // Only admin or superadmin can delete
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ message: 'Forbidden: Only admin or superadmin can delete.' });
    }
    const deliveryBoy = await DeliveryBoy.findById(id);
    if (!deliveryBoy) {
      return res.status(404).json({ message: 'Delivery boy not found.' });
    }
    // Delete associated user
    await User.deleteOne({ _id: deliveryBoy.user });
    // Delete delivery boy profile
    await DeliveryBoy.deleteOne({ _id: id });
    res.json({ message: 'Delivery boy and user account deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete delivery boy', error: err.message });
  }
};

const getUserCount = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', blocked: false });
    const blockedUsers = await User.countDocuments({ role: 'user', blocked: true });
    const newUsersThisMonth = await User.countDocuments({ role: 'user', createdAt: { $gte: firstDayOfMonth } });

    res.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      newUsersThisMonth
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
};

const assignSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.user.id },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: 'Failed to assign ticket' });
  }
};

const updateSupportTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update ticket status' });
  }
};

// Get all orders for delivery assignment (no filter)
const getOrdersForAssignment = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // No filter: fetch all orders
    const orders = await Order.find({})
      .populate('user', 'name email phone address city state pincode')
      .populate({
        path: 'pharmacist',
        select: 'pharmacyName user',
        populate: { path: 'user', select: 'name' }
      })
      .populate('deliveryBoy', 'personalInfo.fullName personalInfo.phone vehicleInfo.vehicleType')
      .populate('medicines.medicine', 'name description price image stock')
      .populate('products.product', 'name description price image stock')
      .populate('deliveryAssignment.assignedBy', 'name email')
      .populate('deliveryAssignment.acceptedBy', 'personalInfo.fullName personalInfo.phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments({});

    res.json({
      orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Auto-assign orders to available delivery boys
const autoAssignOrders = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    const results = [];
    
    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId);
        if (!order || order.status !== 'preparing') {
          results.push({ orderId, success: false, message: 'Order not found or not ready' });
          continue;
        }

        // Find nearest available delivery boy
        const deliveryBoy = await DeliveryBoy.findOne({
          status: 'active',
          'workDetails.currentOrders': { $lt: 5 }
        }).sort({ 'performance.successRate': -1, 'ratings.average': -1 });

        if (!deliveryBoy) {
          results.push({ orderId, success: false, message: 'No available delivery boys' });
          continue;
        }

        // Check if this delivery boy has already rejected this order
        const alreadyRejected = order.deliveryAssignment?.rejectedByDeliveryBoys?.some(
          rejection => rejection.deliveryBoy.toString() === deliveryBoy._id.toString()
        );

        if (alreadyRejected) {
          results.push({ orderId, success: false, message: 'All available delivery boys have rejected this order' });
          continue;
        }

        // Import timeout handler
        const { setOrderExpiration } = require('../utils/orderTimeoutHandler');

        // Assign order
        order.deliveryAssignment.assignedAt = new Date();
        order.deliveryAssignment.assignedBy = req.user.id;
        order.deliveryAssignment.assignmentStatus = 'assigned';
        order.deliveryAssignment.availableForAcceptance = true;
        order.deliveryAssignment.notificationSent = false;
        
        // Set expiration time (20 seconds from now)
        const expiresAt = setOrderExpiration(order);

        await order.save();

        // Send notification
        if (global.io) {
          // Send to specific delivery boy
          global.io.to(`delivery-${deliveryBoy._id}`).emit('newOrderAssignment', {
            orderNumber: order.orderNumber,
            orderId: order._id,
            customerInfo: {
              name: order.user.personalInfo?.fullName || 'Customer',
              phone: order.phone,
              address: order.address
            },
            amount: order.total,
            message: `New order ${order.orderNumber} is available for acceptance`
          });
          
          // Also send to general delivery boys room as fallback
          global.io.to('delivery-boys').emit('newOrderAssignment', {
            orderNumber: order.orderNumber,
            orderId: order._id,
            customerInfo: {
              name: order.user.personalInfo?.fullName || 'Customer',
              phone: order.phone,
              address: order.address
            },
            amount: order.total,
            message: `New order ${order.orderNumber} is available for acceptance`,
            assignedTo: deliveryBoy._id
          });
        }

        results.push({ 
          orderId, 
          success: true, 
          message: 'Assigned successfully',
          deliveryBoy: {
            id: deliveryBoy._id,
            name: deliveryBoy.personalInfo.fullName
          }
        });
      } catch (error) {
        results.push({ orderId, success: false, message: error.message });
      }
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to auto-assign orders' });
  }
};

// Get delivery assignment statistics
const getDeliveryAssignmentStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$deliveryAssignment.assignmentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments({ status: 'preparing' });
    const activeDeliveryBoys = await DeliveryBoy.countDocuments({ 
      status: 'active', 
      'availability.isOnline': true 
    });

    const formattedStats = {
      totalOrders,
      activeDeliveryBoys,
      assignmentStatus: stats.reduce((acc, stat) => {
        acc[stat._id || 'unassigned'] = stat.count;
        return acc;
      }, {})
    };

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get delivery stats' });
  }
};

// Get rejection statistics for orders
const getRejectionStats = async (req, res) => {
  try {
    const rejectionStats = await Order.aggregate([
      {
        $match: {
          'deliveryAssignment.rejectedByDeliveryBoys': { $exists: true, $ne: [] }
        }
      },
      {
        $project: {
          orderNumber: 1,
          status: 1,
          'deliveryAssignment.rejectedByDeliveryBoys': 1,
          rejectionCount: { $size: '$deliveryAssignment.rejectedByDeliveryBoys' }
        }
      },
      {
        $group: {
          _id: '$rejectionCount',
          orders: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalRejectedOrders = await Order.countDocuments({
      'deliveryAssignment.rejectedByDeliveryBoys': { $exists: true, $ne: [] }
    });

    const totalRejections = await Order.aggregate([
      {
        $match: {
          'deliveryAssignment.rejectedByDeliveryBoys': { $exists: true, $ne: [] }
        }
      },
      {
        $group: {
          _id: null,
          totalRejections: { $sum: { $size: '$deliveryAssignment.rejectedByDeliveryBoys' } }
        }
      }
    ]);

    res.json({
      totalRejectedOrders,
      totalRejections: totalRejections[0]?.totalRejections || 0,
      rejectionBreakdown: rejectionStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get rejection stats' });
  }
};

// Get all pharmacists with detailed information
const getAllPharmacists = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const pharmacists = await Pharmacist.find(query)
      .populate('user', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Pharmacist.countDocuments(query);
    
    // Get additional statistics
    const stats = await Pharmacist.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const statusStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    res.json({
      pharmacists,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: statusStats
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacists' });
  }
};

// Get pharmacist by ID with detailed information
const getPharmacistById = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findById(req.params.id)
      .populate('user', 'name email phone');
    
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    
    // Get pharmacist's medicines count
    const medicinesCount = await Medicine.countDocuments({ pharmacist: pharmacist.user._id });
    
    // Get pharmacist's orders count
    const ordersCount = await Order.countDocuments({ pharmacist: pharmacist._id });
    
    // Get pharmacist's recent orders
    const recentOrders = await Order.find({ pharmacist: pharmacist._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const pharmacistData = {
      ...pharmacist.toObject(),
      statistics: {
        medicinesCount,
        ordersCount,
        recentOrders
      }
    };
    
    res.json(pharmacistData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacist details' });
  }
};

// Update pharmacist status
const updatePharmacistStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const pharmacist = await Pharmacist.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        statusReason: reason,
        statusUpdatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email');
    
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    
    // Send notification to pharmacist
    if (global.io) {
      global.io.to(`pharmacist-${pharmacist._id}`).emit('statusUpdate', {
        status,
        message: `Your pharmacy status has been updated to ${status}`,
        reason
      });
    }
    
    res.json({ message: 'Pharmacist status updated successfully', pharmacist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update pharmacist status' });
  }
};

// Get all users with detailed information
const getAllUsers = async (req, res) => {
  try {
    const { role, blocked, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    if (role) {
      query.role = role;
    }
    if (blocked !== undefined) {
      query.blocked = blocked === 'true';
    }
    
    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    // Get additional statistics
    const stats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const roleStats = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    const blockedCount = await User.countDocuments({ blocked: true });
    
    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: {
        ...roleStats,
        blocked: blockedCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user by ID with detailed information
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's orders count
    const ordersCount = await Order.countDocuments({ user: user._id });
    
    // Get user's recent orders
    const recentOrders = await Order.find({ user: user._id })
      .populate('pharmacist', 'pharmacyName')
      .populate('deliveryBoy', 'personalInfo.fullName')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get user's total spent
    const totalSpent = await Order.aggregate([
      { $match: { user: user._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const userData = {
      ...user.toObject(),
      statistics: {
        ordersCount,
        totalSpent: totalSpent[0]?.total || 0,
        recentOrders
      }
    };
    
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

// Get user statistics
const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', blocked: false });
    const blockedUsers = await User.countDocuments({ role: 'user', blocked: true });
    
    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Get new users this week
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    res.json({
      totalUsers,
      activeUsers,
      blockedUsers,
      usersByRole: usersByRole.reduce((acc, role) => {
        acc[role._id] = role.count;
        return acc;
      }, {}),
      newUsersThisMonth,
      newUsersThisWeek
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
};

// Get pharmacist statistics
const getPharmacistStatistics = async (req, res) => {
  try {
    const totalPharmacists = await Pharmacist.countDocuments();
    const approvedPharmacists = await Pharmacist.countDocuments({ status: 'approved' });
    const pendingPharmacists = await Pharmacist.countDocuments({ status: 'pending' });
    const rejectedPharmacists = await Pharmacist.countDocuments({ status: 'rejected' });
    
    // Get pharmacists by status
    const pharmacistsByStatus = await Pharmacist.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get new pharmacists this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newPharmacistsThisMonth = await Pharmacist.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Get total medicines from all pharmacists
    const totalMedicines = await Medicine.countDocuments();
    
    // Get total orders from all pharmacists
    const totalOrders = await Order.countDocuments();
    
    res.json({
      totalPharmacists,
      approvedPharmacists,
      pendingPharmacists,
      rejectedPharmacists,
      pharmacistsByStatus: pharmacistsByStatus.reduce((acc, status) => {
        acc[status._id] = status.count;
        return acc;
      }, {}),
      newPharmacistsThisMonth,
      totalMedicines,
      totalOrders
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacist statistics' });
  }
};

// Get delivery boy statistics
const getDeliveryBoyStatistics = async (req, res) => {
  try {
    const totalDeliveryBoys = await DeliveryBoy.countDocuments();
    const activeDeliveryBoys = await DeliveryBoy.countDocuments({ status: 'active' });
    const inactiveDeliveryBoys = await DeliveryBoy.countDocuments({ status: 'inactive' });
    const suspendedDeliveryBoys = await DeliveryBoy.countDocuments({ status: 'suspended' });
    const pendingDeliveryBoys = await DeliveryBoy.countDocuments({ status: 'pending_approval' });
    
    // Get delivery boys by status
    const deliveryBoysByStatus = await DeliveryBoy.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get new delivery boys this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const newDeliveryBoysThisMonth = await DeliveryBoy.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    
    // Get total deliveries
    const totalDeliveries = await Order.countDocuments({ deliveryBoy: { $exists: true } });
    
    // Get online delivery boys
    const onlineDeliveryBoys = await DeliveryBoy.countDocuments({
      status: 'active',
      'availability.isOnline': true
    });
    
    res.json({
      totalDeliveryBoys,
      activeDeliveryBoys,
      inactiveDeliveryBoys,
      suspendedDeliveryBoys,
      pendingDeliveryBoys,
      deliveryBoysByStatus: deliveryBoysByStatus.reduce((acc, status) => {
        acc[status._id] = status.count;
        return acc;
      }, {}),
      newDeliveryBoysThisMonth,
      totalDeliveries,
      onlineDeliveryBoys
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery boy statistics' });
  }
}; 

// Admin: Generate invite token for pharmacist or deliveryBoy
const generateInviteToken = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['pharmacist', 'deliveryBoy'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role for invite token' });
    }
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      return res.status(403).json({ message: 'Forbidden: Only admin or superadmin can generate invite tokens.' });
    }
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const invite = await InviteToken.create({
      token,
      role,
      expiresAt,
      createdBy: req.user.id // changed from req.user._id
    });
    
    // Use frontend URL instead of backend URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://medicare-nine-alpha.vercel.app';
    const registerPath = role === 'pharmacist' ? 'pharmacist' : 'delivery';
    const inviteLink = `${frontendUrl}/register/${registerPath}?token=${token}`;
    
    res.json({ 
      token, 
      link: inviteLink,
      inviteLink: inviteLink, // Add both for compatibility
      expiresAt,
      role,
      message: `Invite token generated successfully for ${role}`
    });
  } catch (err) {
    console.error('Error generating invite token:', err);
    res.status(500).json({ message: 'Failed to generate invite token', error: err.message });
  }
}; 

// List all invite tokens (for admin)
const getInviteTokens = async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    const tokens = await InviteToken.find(query)
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('createdBy', 'name email')
      .populate('usedBy', 'name email');
    const total = await InviteToken.countDocuments(query);
    res.json({
      tokens,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invite tokens', error: err.message });
  }
};

// Pharmacist data access methods
const getPharmacistSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('pharmacist', 'pharmacyName')
      .populate('customer', 'name')
      .populate('supplier', 'name')
      .sort({ date: -1 });
    
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacist sales' });
  }
};

const getPharmacistCustomers = async (req, res) => {
  try {
    const Customer = require('../models/Customer');
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacist customers' });
  }
};

const getPharmacistSuppliers = async (req, res) => {
  try {
    const Supplier = require('../models/Supplier');
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacist suppliers' });
  }
};

const getPharmacistAnalytics = async (req, res) => {
  try {
    const Customer = require('../models/Customer');
    const Supplier = require('../models/Supplier');
    
    const [totalSales, totalRevenue, totalCustomers, totalSuppliers] = await Promise.all([
      Sale.countDocuments(),
      Sale.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Customer.countDocuments(),
      Supplier.countDocuments()
    ]);

    const averageSaleValue = totalSales > 0 ? (totalRevenue[0]?.total || 0) / totalSales : 0;

    res.json({
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageSaleValue,
      totalCustomers,
      totalSuppliers
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pharmacist analytics' });
  }
};

module.exports = {
  dashboard,
  getUsers,
  blockUser,
  getPharmacies,
  verifyPharmacy,
  analytics,
  getSettings,
  updateSettings,
  getOrdersForAssignment,
  getUnassignedOrders,
  assignDeliveryBoy,
  autoAssignDeliveryBoy,
  updateOrderStatus,
  bulkAssignDeliveryBoys,
  getOrders,
  getOrderById,
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  getPrescriptions,
  approvePrescription,
  rejectPrescription,
  getDeliveries,
  updateDeliveryStatus,
  getPayments,
  getRefunds,
  updateRefundStatus,
  getSupportTickets,
  replySupportTicket,
  closeSupportTicket,
  getDeliveryBoys,
  getDeliveryBoyById,
  updateDeliveryBoyStatus,
  approveDeliveryBoy,
  suspendDeliveryBoy,
  getDeliveryBoyPerformance,
  getDeliveryBoyEarnings,
  getDeliveryBoyOrders,
  getDeliveryStatistics,
  getDeliveryPerformanceOverview,
  getDeliveryBoyLocationHistory,
  updateDeliveryBoyWorkArea,
  getDeliveryBoyDocuments,
  verifyDeliveryBoyDocument,
  deleteDeliveryBoy,
  getDeliveryBoyReviews,
  sendNotificationToDeliveryBoy,
  getDeliveryBoySchedule,
  updateDeliveryBoySchedule,
  getDeliveryBoyAnalytics,
  bulkUpdateDeliveryBoyStatus,
  exportDeliveryBoyData,
  getPendingPharmacists,
  approvePharmacist,
  rejectPharmacist,
  getApprovedPharmacists,
  forceDeletePharmacist,
  getUserCount,
  assignSupportTicket,
  updateSupportTicketStatus,
  getAvailableDeliveryBoys,
  autoAssignOrders,
  getDeliveryAssignmentStats,
  getRejectionStats,
  getAllPharmacists,
  getPharmacistById,
  updatePharmacistStatus,
  getPharmacistStatistics,
  getAllUsers,
  getUserById,
  getUserStatistics,
  getDeliveryBoyStatistics,
  generateInviteToken,
  getInviteTokens,
  getPharmacistSales,
  getPharmacistCustomers,
  getPharmacistSuppliers,
  getPharmacistAnalytics
}; 

if (require.main === module) {
  // Minimal test for export
  const exported = module.exports.generateInviteToken;
  if (typeof exported === 'function') {
    console.log('generateInviteToken is exported correctly.');
  } else {
    console.error('generateInviteToken is NOT exported correctly:', exported);
  }
}