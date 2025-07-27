const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.Mixed, required: true }, // Allow both ObjectId and String
  itemType: { type: String, required: true, enum: ['Medicine', 'Product'] },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  transactionType: { type: String, required: true, enum: ['Customer', 'Supplier'] },
  customer: { type: String },
  supplier: { type: String },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist', required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema); 