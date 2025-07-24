const mongoose = require('mongoose');
const Cart = require('../models/Cart');

async function migrateCartData() {
  try {
    // Find all carts
    const carts = await Cart.find({});
    
    for (const cart of carts) {
      let needsUpdate = false;
      const updatedItems = [];
      
      for (const item of cart.items) {
        // Check if item has the old structure (medicine field)
        if (item.medicine && !item.itemType) {
          // Convert old structure to new structure
          updatedItems.push({
            itemType: 'medicine',
            item: item.medicine,
            quantity: item.quantity
          });
          needsUpdate = true;
        } else if (item.item && item.itemType) {
          // Item already has new structure
          updatedItems.push(item);
        } else {
          // Item is invalid
          continue;
        }
      }
      
      if (needsUpdate) {
        cart.items = updatedItems;
        await cart.save();
      }
    }
  } catch (error) {
    // Handle error
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      return migrateCartData();
    })
    .then(() => {
      process.exit(0);
    })
    .catch(err => {
      process.exit(1);
    });
}

module.exports = migrateCartData; 