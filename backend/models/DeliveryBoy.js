const mongoose = require('mongoose');

const deliveryBoySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  personalInfo: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    }
  },
  vehicleInfo: {
    vehicleType: { type: String, enum: ['bike', 'scooter', 'car', 'bicycle'], required: true },
    vehicleNumber: { type: String, required: true },
    vehicleModel: String,
    vehicleColor: String,
    insuranceExpiry: Date,
    rcBookNumber: String
  },
  documents: {
    aadharCard: { type: String }, // URL to uploaded file
    panCard: { type: String }, // URL to uploaded file
    drivingLicense: { type: String }, // URL to uploaded file
    vehicleRC: { type: String }, // URL to uploaded file
    insurance: { type: String }, // URL to uploaded file
    profilePhoto: { type: String } // URL to uploaded file
  },
  workDetails: {
    joiningDate: { type: Date, default: Date.now },
    workArea: [String], // Array of area codes or city names
    preferredWorkingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    },
    maxOrdersPerDay: { type: Number, default: 20 },
    currentOrders: { type: Number, default: 0 }
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'pending_approval'], 
    default: 'pending_approval' 
  },
  // New fields for location and availability
  location: {
    current: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String },
      lastUpdated: { type: Date }
    },
    home: {
      lat: { type: Number },
      lng: { type: Number },
      address: { type: String }
    }
  },
  availability: {
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
    autoAccept: { type: Boolean, default: false },
    maxDistance: { type: Number, default: 10 }, // in km
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    }
  },
  ratings: {
    average: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    reviews: [{
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: { type: Date, default: Date.now }
    }]
  },
  earnings: {
    totalEarned: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 }
  },
  performance: {
    totalDeliveries: { type: Number, default: 0 },
    successfulDeliveries: { type: Number, default: 0 },
    cancelledDeliveries: { type: Number, default: 0 },
    averageDeliveryTime: { type: Number, default: 0 }, // in minutes
    onTimeDeliveries: { type: Number, default: 0 }
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String,
    accountHolderName: String
  },
  settings: {
    notifications: {
      newOrder: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      earnings: { type: Boolean, default: true }
    },
    autoAccept: { type: Boolean, default: false },
    maxDistance: { type: Number, default: 10 } // in km
  }
}, { 
  timestamps: true 
});

// Index for status-based queries
deliveryBoySchema.index({ status: 1 });
deliveryBoySchema.index({ 'availability.isOnline': 1 });
deliveryBoySchema.index({ 'location.current': '2dsphere' });

// Virtual for success rate
deliveryBoySchema.virtual('successRate').get(function() {
  if (this.performance.totalDeliveries === 0) return 0;
  return (this.performance.successfulDeliveries / this.performance.totalDeliveries * 100).toFixed(2);
});

// Method to update earnings
deliveryBoySchema.methods.updateEarnings = function(amount) {
  this.earnings.totalEarned += amount;
  this.earnings.thisMonth += amount;
  this.earnings.thisWeek += amount;
  this.earnings.today += amount;
  return this.save();
};

// Method to update performance
deliveryBoySchema.methods.updatePerformance = function(deliveryTime, success = true) {
  this.performance.totalDeliveries += 1;
  if (success) {
    this.performance.successfulDeliveries += 1;
  } else {
    this.performance.cancelledDeliveries += 1;
  }
  
  // Update average delivery time
  const totalTime = this.performance.averageDeliveryTime * (this.performance.totalDeliveries - 1) + deliveryTime;
  this.performance.averageDeliveryTime = totalTime / this.performance.totalDeliveries;
  
  return this.save();
};

// Method to update location
deliveryBoySchema.methods.updateLocation = function(lat, lng, address) {
  this.location.current = {
    lat,
    lng,
    address,
    lastUpdated: new Date()
  };
  this.availability.lastSeen = new Date();
  return this.save();
};

// Method to toggle online status
deliveryBoySchema.methods.toggleOnlineStatus = function() {
  this.availability.isOnline = !this.availability.isOnline;
  this.availability.lastSeen = new Date();
  return this.save();
};

module.exports = mongoose.model('DeliveryBoy', deliveryBoySchema, 'deliveryboys'); 