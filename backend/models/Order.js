const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pharmacist: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacist' },
  deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy' },
  orderNumber: { type: String, unique: true },
  medicines: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  status: { type: String, enum: ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
  statusTimestamps: {
    pending: { type: Date, default: Date.now },
    accepted: { type: Date },
    preparing: { type: Date },
    out_for_delivery: { type: Date },
    delivered: { type: Date },
    cancelled: { type: Date }
  },
  total: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  deliveryNotes: { type: String },
  acceptedAt: { type: Date },
  deliveredAt: { type: Date },
  payment: {
    mode: { type: String, enum: ['cod', 'online', 'razorpay', 'stripe'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    transactionId: { type: String },
    cardLast4: { type: String }
  },
  tracking: {
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number }
    },
    updates: {
      type: [{
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        description: { type: String }
      }],
      default: []
    }
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    changedBy: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String }
    }
  }],
  // New fields for delivery assignment
  deliveryAssignment: {
    assignedAt: { type: Date },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin who assigned
    acceptedAt: { type: Date },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy' },
    rejectedAt: { type: Date },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy' },
    rejectionReason: { type: String },
    // New field to track multiple delivery boys who have rejected this order
    rejectedByDeliveryBoys: [{
      deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy' },
      rejectedAt: { type: Date, default: Date.now },
      reason: { type: String }
    }],
    assignmentStatus: { 
      type: String, 
      enum: ['unassigned', 'assigned', 'accepted', 'rejected', 'expired'], 
      default: 'unassigned' 
    },
    availableForAcceptance: { type: Boolean, default: false },
    notificationSent: { type: Boolean, default: false },
    expiresAt: { type: Date } // Time when order expires if not accepted
  },
  // Field to track if delivery has been rated
  deliveryRated: { type: Boolean, default: false },
  prescription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prescription',
    required: false
  }
}, { timestamps: true });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema); 