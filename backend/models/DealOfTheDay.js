const mongoose = require('mongoose');

const dealOfTheDaySchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType',
  },
  itemType: {
    type: String,
    required: true,
    enum: ['Medicine', 'Product'],
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endTime: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacist',
    required: true,
  },
}, { timestamps: true });

dealOfTheDaySchema.index({ endTime: 1 });

module.exports = mongoose.model('DealOfTheDay', dealOfTheDaySchema); 