const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  quantity: { type: Number, required: true },
  instructions: { type: String },
  price: { type: Number, default: 0 },
  available: { type: Boolean, default: true }
});

const prescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  imageUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'processed'], default: 'pending' },
  pharmacistNote: { type: String },
  pharmacistActionAt: { type: Date },
  statusChangedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // New fields for medicine details
  medicines: [medicineSchema],
  totalAmount: { type: Number, default: 0 },
  doctorName: { type: String },
  prescriptionDate: { type: Date },
  // For reordering
  isProcessed: { type: Boolean, default: false },
  processedAt: { type: Date },
  ordered: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema); 