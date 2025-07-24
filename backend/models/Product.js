const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, text: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  brand: { type: String },
  image: { type: String, default: null },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist', required: true },
  discountPercentage: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 }
}, { timestamps: true });

productSchema.index({ name: 'text' });

productSchema.virtual('discountedPrice').get(function() {
  if (!this.discountPercentage) return this.price;
  return +(this.price * (1 - this.discountPercentage / 100)).toFixed(2);
});

module.exports = mongoose.model('Product', productSchema); 