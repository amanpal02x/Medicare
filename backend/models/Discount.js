const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  percentage: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  medicines: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
  pharmacists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist' }]
}, { timestamps: true });

module.exports = mongoose.model('Discount', discountSchema); 