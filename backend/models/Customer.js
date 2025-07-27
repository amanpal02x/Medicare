const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  customerType: { type: String, enum: ['regular', 'premium', 'wholesale'], default: 'regular' },
  notes: { type: String },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema); 