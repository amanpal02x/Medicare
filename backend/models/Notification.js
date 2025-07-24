const mongoose = require('mongoose');

// For development: force model recompilation to pick up schema changes
if (mongoose.connection.models['UserNotification']) {
  delete mongoose.connection.models['UserNotification'];
}

const conversationEntrySchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  files: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  conversation: [conversationEntrySchema], // Conversation array for support tickets
  isRead: { type: Boolean, default: false },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, default: 'general' },
  status: { type: String, enum: ['open', 'replied', 'closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Notification for user (not support ticket)
const userNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notification' },
  replyPreview: { type: String },
  adminName: { type: String },
  type: { type: String }, // Ensure this is present
  orderId: { type: String }, // Ensure this is present
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
const UserNotification = mongoose.model('UserNotification', userNotificationSchema);

module.exports = { Notification, UserNotification }; 