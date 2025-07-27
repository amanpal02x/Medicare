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
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

productSchema.index({ name: 'text' });

productSchema.virtual('discountedPrice').get(function() {
  // Ensure price is a valid number
  const price = Number(this.price) || 0;
  const discountPercentage = Number(this.discountPercentage) || 0;
  
  if (discountPercentage <= 0) return price;
  if (discountPercentage >= 100) return 0;
  
  // Calculate discounted price with proper precision
  const discountedPrice = price * (1 - discountPercentage / 100);
  return Math.round(discountedPrice * 100) / 100; // Round to 2 decimal places
});

module.exports = mongoose.model('Product', productSchema); 