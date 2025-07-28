const mongoose = require('mongoose');
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  pharmacist: { type: Schema.Types.ObjectId, ref: 'Pharmacist' },
  totalAmount: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  netTotal: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Cancel', 'Draft'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema); 