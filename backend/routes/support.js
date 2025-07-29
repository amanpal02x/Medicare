const express = require('express');
const router = express.Router();
const { Notification: SupportTicket, UserNotification } = require('../models/Notification');
const auth = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/cloudinaryUpload');
const User = require('../models/User');

// Get all support tickets for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching support tickets for user:', req.user.id);
    const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ createdAt: -1 });
    console.log('Found tickets:', tickets.length);
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching support tickets:', err);
    res.status(500).json({ error: 'Failed to fetch your support tickets', details: err.message });
  }
});

// User or pharmacist submits a support query (with optional files)
router.post('/', auth, uploadMultiple('files', 5), async (req, res) => {
  try {
    const { message, priority = 'medium', category = 'general', order } = req.body;
    console.log('Creating support ticket:', { message, priority, category, order, userId: req.user.id });
   
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const ticket = await SupportTicket.create({
      userId: req.user.id,
      message: message,
      priority: priority,
      category: category,
      order: order,
      files: req.cloudinaryResults ? req.cloudinaryResults.map(f => f.url) : [],
      status: 'open',
      replies: []
    });
    console.log('Created ticket:', ticket._id);
    res.status(201).json(ticket);
  } catch (err) {
    console.error('Error creating support ticket:', err);
    res.status(500).json({ error: 'Failed to submit support ticket', details: err.message });
  }
});

// Add a reply to a support ticket (user or admin)
router.post('/:id/reply', auth, uploadMultiple('files', 5), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const reply = {
      sender: req.user.id,
      message: message,
      files: req.cloudinaryResults ? req.cloudinaryResults.map(f => f.url) : [],
      timestamp: new Date()
    };
    ticket.replies.push(reply);
    await ticket.save();
    
    res.json(ticket);
  } catch (err) {
    console.error('Error adding reply:', err);
    res.status(500).json({ error: 'Failed to add reply', details: err.message });
  }
});

// Mark a support ticket as closed (admin only)
router.post('/close-query/:orderId', auth, async (req, res) => {
  try {
    // Only admin or superadmin can close
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    // Find the first admin to use as sender for the system message
    const admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
    const systemMessage = {
      sender: admin ? admin._id : req.user.id, // fallback to current user if no admin found
      message: 'Ticket closed, hope you got the solution.',
      files: [],
      timestamp: new Date()
    };
    const ticket = await SupportTicket.findOneAndUpdate(
      { order: req.params.orderId },
      { $set: { status: 'closed', replies: [...ticket.replies, systemMessage] } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    // Optionally notify the user
    await UserNotification.create({
      userId: ticket.userId,
      message: 'Your support ticket has been closed.',
      type: 'support_closed',
      link: `/support/${ticket._id}`,
      isRead: false
    });
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ error: 'Failed to close query' });
  }
});

// Fetch chat messages and status for a given orderId
router.get('/chat/:orderId', auth, async (req, res) => {
  try {
    console.log('Fetching chat for order:', req.params.orderId);
    const ticket = await SupportTicket.findOne({ order: req.params.orderId });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ messages: ticket.replies, status: ticket.status });
  } catch (err) {
    console.error('Error fetching chat:', err);
    res.status(500).json({ error: 'Failed to fetch chat', details: err.message });
  }
});

// Get notifications for the logged-in user
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await UserNotification.find({ userId: req.user.id }).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all notifications as read for the logged-in user
router.patch('/notifications/read', auth, async (req, res) => {
  try {
    await UserNotification.updateMany({ userId: req.user.id }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Mark a specific notification as read
router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await UserNotification.findByIdAndUpdate(req.params.id, { $set: { isRead: true } }, { new: true });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Clear all seen notifications for the logged-in user
router.delete('/notifications/clear-seen', auth, async (req, res) => {
  try {
    const result = await UserNotification.deleteMany({ userId: req.user.id, isRead: true });
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `Cleared ${result.deletedCount} seen notifications`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear seen notifications' });
  }
});

// Danger: For development only! Remove after use.
router.delete('/notifications/clear-all', async (req, res) => {
  try {
    const result = await UserNotification.deleteMany({});
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear all notifications' });
  }
});

module.exports = router; 