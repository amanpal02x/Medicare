const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, text: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  image: { type: String, default: null },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false }, // Added for admin filtering
  discountPercentage: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
}, { timestamps: true });

medicineSchema.index({ name: 'text' });

medicineSchema.virtual('discountedPrice').get(function() {
  if (!this.discountPercentage) return this.price;
  return +(this.price * (1 - this.discountPercentage / 100)).toFixed(2);
});

module.exports = mongoose.model('Medicine', medicineSchema); 