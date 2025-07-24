const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  commissionRate: { type: Number, default: 0 },
  adTracking: { type: Boolean, default: false },
  globalSettings: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema); 