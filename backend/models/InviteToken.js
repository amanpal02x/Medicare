const mongoose = require('mongoose');

const inviteTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  role: { type: String, enum: ['pharmacist', 'deliveryBoy'], required: true },
  status: { type: String, enum: ['unused', 'used'], default: 'unused' },
  expiresAt: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('InviteToken', inviteTokenSchema); 