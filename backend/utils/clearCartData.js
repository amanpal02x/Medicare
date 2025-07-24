const mongoose = require('mongoose');
const Cart = require('../models/Cart');

async function clearAllCartData() {
  try {
    const result = await Cart.deleteMany({});
  } catch (error) {
    // Error clearing cart data
  }
}

// Run if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      return clearAllCartData();
    })
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      process.exit(1);
    });
}

module.exports = clearAllCartData; 