const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: function() { return this.type === 'delivery'; }
  },
  // Product rating
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  },
  medicine: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medicine' 
  },
  // Delivery boy rating
  deliveryBoy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DeliveryBoy' 
  },
  // Rating details
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    maxlength: 500 
  },
  // Rating type
  type: { 
    type: String, 
    enum: ['product', 'medicine', 'delivery'], 
    required: true 
  },
  // Status
  status: { 
    type: String, 
    enum: ['active', 'hidden', 'reported'], 
    default: 'active' 
  }
}, { 
  timestamps: true 
});

// Ensure one rating per user per item per order
// REMOVE the old compound index
// ratingSchema.index({ 
//   user: 1, 
//   order: 1, 
//   product: 1, 
//   medicine: 1, 
//   deliveryBoy: 1 
// }, { 
//   unique: true,
//   sparse: true 
// });

// Add separate unique indexes for each type
ratingSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
ratingSchema.index({ user: 1, medicine: 1 }, { unique: true, sparse: true });
ratingSchema.index({ user: 1, order: 1, deliveryBoy: 1 }, { unique: true, sparse: true });

// Text index for search
ratingSchema.index({ comment: 'text' });

// Automatically drop the old compound index if it exists
ratingSchema.on('index', function(err) {
  if (!err && mongoose.connection.readyState === 1) {
    mongoose.connection.db.collection('ratings').indexes((error, indexes) => {
      if (!error && indexes.some(idx => idx.name === 'user_1_order_1_product_1_medicine_1_deliveryBoy_1')) {
        mongoose.connection.db.collection('ratings').dropIndex('user_1_order_1_product_1_medicine_1_deliveryBoy_1', (dropErr, result) => {
          if (dropErr) {
            console.warn('Could not drop old compound index:', dropErr.message);
          } else {
            console.log('Dropped old compound index user_1_order_1_product_1_medicine_1_deliveryBoy_1');
          }
        });
      }
    });
  }
});

module.exports = mongoose.model('Rating', ratingSchema); 