const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  date: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  totalDiscount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Cancel', 'Draft'], default: 'Pending' },
  netTotal: { type: Number, required: true },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema); 