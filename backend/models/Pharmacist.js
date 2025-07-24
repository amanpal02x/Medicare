const mongoose = require('mongoose');

const pharmacistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  pharmacyName: { type: String },
  address: { type: String },
  contact: { type: String },
  kycDocs: [{ type: String }], // URLs to uploaded docs
  timings: { type: String },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  // Location and online status for real-time features
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  online: { type: Boolean, default: false }
}, { timestamps: true });

// Add 2dsphere index for geospatial queries
pharmacistSchema.index({ location: '2dsphere' });

// Prevent deletion of approved pharmacists
pharmacistSchema.pre('remove', function(next) {
  if (this.status === 'approved') {
    return next(new Error('Approved pharmacists cannot be deleted.'));
  }
  next();
});

pharmacistSchema.pre('deleteOne', { document: true, query: false }, function(next) {
  if (this.status === 'approved') {
    return next(new Error('Approved pharmacists cannot be deleted.'));
  }
  next();
});

module.exports = mongoose.model('Pharmacist', pharmacistSchema); 