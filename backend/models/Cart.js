const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      itemType: { type: String, enum: ['medicine', 'product'], required: true },
      item: { type: mongoose.Schema.Types.ObjectId, required: true }, // This will reference either Medicine or Product
      quantity: { type: Number, required: true, min: 1 }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema); 