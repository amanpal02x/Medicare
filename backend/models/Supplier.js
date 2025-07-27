const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  companyName: { type: String },
  gstNumber: { type: String },
  contactPerson: { type: String },
  supplierType: { type: String, enum: ['medicine', 'product', 'both'], default: 'medicine' },
  notes: { type: String },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema); 