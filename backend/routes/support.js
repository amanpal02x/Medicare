const express = require('express');
const router = express.Router();
const { Notification: SupportTicket, UserNotification } = require('../models/Notification');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'support-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// User or pharmacist submits a support query (with optional files)
router.post('/', auth, upload.array('files', 5), async (req, res) => {
  try {
    const { message, priority = 'medium', category = 'general', order } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const files = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const ticket = await SupportTicket.create({
      user: req.user.id,
      type: 'support',
      conversation: [{ sender: req.user.id, message, files }],
      isRead: false,
      priority,
      category,
      ...(order ? { order } : {})
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit support ticket' });
  }
});

// Add a reply to a support ticket (user or admin)
router.post('/:id/reply', auth, upload.array('files', 5), async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const files = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { $push: { conversation: { sender: req.user.id, message, files } }, status: 'replied' },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const sender = req.user;
    const orderId = ticket.order ? ticket.order.toString() : undefined;
    const hasOrder = !!orderId;
    if (sender.role === 'admin' || sender.role === 'superadmin') {
      const notificationObj = {
        user: ticket.user,
        message: hasOrder
          ? `Admin replied to your support ticket for order ${orderId}. Click to view the chat.`
          : 'Admin replied to your support ticket. Click to view your tickets.',
        link: hasOrder ? `/orders/${orderId}/chat` : `/support`,
        ticketId: ticket._id,
        replyPreview: message.substring(0, 150),
        adminName: sender.name || 'Admin',
        type: 'admin_reply',
        ...(hasOrder ? { orderId } : {})
      };
      await UserNotification.create(notificationObj);
    } else {
      // Notify the first admin
      const admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
      if (admin) {
        await UserNotification.create({
          user: admin._id,
          message: 'A user has replied to a support ticket.',
          link: `/admin/support/${ticket._id}`
        });
      }
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add reply to ticket' });
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
      { order: req.params.orderId, type: 'support' },
      { 
        $push: { conversation: systemMessage },
        status: 'closed' 
      },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    // Optionally notify the user
    await UserNotification.create({
      user: ticket.user,
      message: `Your support query for order ${req.params.orderId} has been closed by admin.`,
      link: `/orders/${req.params.orderId}/chat`,
      ticketId: ticket._id,
      type: 'admin_query_closed',
      orderId: req.params.orderId
    });
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ error: 'Failed to close query' });
  }
});

// Fetch chat messages and status for a given orderId
router.get('/chat/:orderId', auth, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ order: req.params.orderId, type: 'support' })
      .populate('conversation.sender', 'name email role');
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ messages: ticket.conversation, status: ticket.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Get notifications for the logged-in user
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await UserNotification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark all notifications as read for the logged-in user
router.patch('/notifications/read', auth, async (req, res) => {
  try {
    await UserNotification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Mark a specific notification as read
router.patch('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await UserNotification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
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
    const result = await UserNotification.deleteMany({ 
      user: req.user.id, 
      isRead: true 
    });
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
    const result = await require('../models/Notification').UserNotification.deleteMany({});
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear all notifications' });
  }
});

// Get all support tickets for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id, type: 'support' }).sort({ createdAt: -1 }).populate('conversation.sender', 'name email role');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your support tickets' });
  }
});

module.exports = router; 