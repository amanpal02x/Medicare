const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicare';

async function migrate() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const admin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });
  if (!admin) {
    process.exit(1);
  }
  const legacyTickets = await Notification.find({ type: 'support', message: { $exists: true } });
  let migrated = 0;
  for (const ticket of legacyTickets) {
    const conversation = [];
    // User's original message
    conversation.push({
      sender: ticket.user,
      message: ticket.message,
      files: ticket.files || [],
      timestamp: ticket.createdAt || new Date()
    });
    // Admin reply, if exists
    if (ticket.reply) {
      conversation.push({
        sender: admin._id,
        message: ticket.reply,
        files: [],
        timestamp: ticket.updatedAt || new Date()
      });
    }
    ticket.conversation = conversation;
    ticket.markModified('conversation');
    ticket.message = undefined;
    ticket.files = undefined;
    ticket.reply = undefined;
    await ticket.save();
    migrated++;
  }
  await mongoose.disconnect();
}

migrate().catch(err => { process.exit(1); }); 