// Script to set a 20% discount for all products and medicines
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Medicine = require('../models/Medicine');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicare';

async function setDiscounts() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const productResult = await Product.updateMany({}, { $set: { discountPercentage: 20 } });
  const medicineResult = await Medicine.updateMany({}, { $set: { discountPercentage: 20 } });

  console.log(`Updated ${productResult.modifiedCount} products and ${medicineResult.modifiedCount} medicines with 20% discount.`);
  await mongoose.disconnect();
}

setDiscounts().catch(err => {
  console.error('Error updating discounts:', err);
  process.exit(1);
}); 