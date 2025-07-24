const Cart = require('../models/Cart');
const Medicine = require('../models/Medicine');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Add this helper at the top
function isUserRole(req) {
  return req.user && req.user.role === 'user';
}

exports.getCart = async (req, res) => {
  if (!isUserRole(req)) {
    return res.status(403).json({ message: 'Cart is only available for users.' });
  }
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
    
    // Clean up any old cart structure items
    let needsUpdate = false;
    const cleanedItems = [];
    
    for (const item of cart.items) {
      // Check if item has the old structure (medicine field)
      if (item.medicine && !item.itemType) {

        
        // Convert old structure to new structure
        cleanedItems.push({
          itemType: 'medicine',
          item: item.medicine,
          quantity: item.quantity
        });
        needsUpdate = true;
      } else if (item.item && item.itemType) {
        // Item already has new structure
        cleanedItems.push(item);
      } else {

      }
    }
    
    // Update cart if cleanup was needed
    if (needsUpdate) {

      cart.items = cleanedItems;
      await cart.save();
    }
    
    // Populate items based on their type
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        try {
          if (item.itemType === 'medicine') {
            const medicine = await Medicine.findById(item.item);
            return {
              ...item.toObject(),
              item: medicine ? { ...medicine.toObject(), discountedPrice: medicine.discountedPrice } : null
            };
          } else if (item.itemType === 'product') {
            const product = await Product.findById(item.item);
            return {
              ...item.toObject(),
              item: product ? { ...product.toObject(), discountedPrice: product.discountedPrice } : null
            };
          }
          return null;
        } catch (err) {
          return null;
        }
      })
    );
    
    // Filter out items with null data
    const validItems = populatedItems.filter(item => item && item.item);
    
    res.json(validItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
  }
};

exports.addToCart = async (req, res) => {
  if (!isUserRole(req)) {
    return res.status(403).json({ message: 'Cart is only available for users.' });
  }
  try {
    const { itemId, itemType, quantity } = req.body;
    
    if (!itemId || !itemType || !['medicine', 'product'].includes(itemType)) {
      return res.status(400).json({ message: 'Valid itemId, itemType (medicine or product), and quantity are required' });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID format' });
    }
    
    // Validate that the item exists
    let item;
    try {
      if (itemType === 'medicine') {
        item = await Medicine.findById(itemId);

      } else if (itemType === 'product') {
        item = await Product.findById(itemId);

      }
    } catch (err) {
      return res.status(404).json({ message: `${itemType} not found` });
    }
    
    if (!item) {
      return res.status(404).json({ message: `${itemType} not found` });
    }
    
    let cart = await Cart.findOne({ user: req.user.id });

    
    if (!cart) {

      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    // Check if item already exists in cart
    const existing = cart.items.find(cartItem => 
      cartItem.item.toString() === itemId && cartItem.itemType === itemType
    );
    

    
    if (existing) {

      existing.quantity += quantity;
    } else {

      cart.items.push({ item: itemId, itemType, quantity });
    }
    

    await cart.save();
    
    // Return populated cart items

    const populatedItems = await Promise.all(
      cart.items.map(async (cartItem) => {
        try {
          if (cartItem.itemType === 'medicine') {
            const medicine = await Medicine.findById(cartItem.item);
            return {
              ...cartItem.toObject(),
              item: medicine ? { ...medicine.toObject(), discountedPrice: medicine.discountedPrice } : null
            };
          } else if (cartItem.itemType === 'product') {
            const product = await Product.findById(cartItem.item);
            return {
              ...cartItem.toObject(),
              item: product ? { ...product.toObject(), discountedPrice: product.discountedPrice } : null
            };
          }
          return null;
        } catch (err) {
          return null;
        }
      })
    );
    
    const validItems = populatedItems.filter(item => item && item.item);

    res.json(validItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCartItem = async (req, res) => {
  if (!isUserRole(req)) {
    return res.status(403).json({ message: 'Cart is only available for users.' });
  }
  try {
    const { itemId, itemType, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    const item = cart.items.find(cartItem => 
      cartItem.item.toString() === itemId && cartItem.itemType === itemType
    );
    
    if (item) {
      item.quantity = quantity;
      await cart.save();
      
      // Return populated cart items
      const populatedItems = await Promise.all(
        cart.items.map(async (cartItem) => {
          if (cartItem.itemType === 'medicine') {
            const medicine = await Medicine.findById(cartItem.item);
            return {
              ...cartItem.toObject(),
              item: medicine ? { ...medicine.toObject(), discountedPrice: medicine.discountedPrice } : null
            };
          } else if (cartItem.itemType === 'product') {
            const product = await Product.findById(cartItem.item);
            return {
              ...cartItem.toObject(),
              item: product ? { ...product.toObject(), discountedPrice: product.discountedPrice } : null
            };
          }
          return null;
        })
      );
      
      const validItems = populatedItems.filter(item => item && item.item);
      res.json(validItems);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromCart = async (req, res) => {
  if (!isUserRole(req)) {
    return res.status(403).json({ message: 'Cart is only available for users.' });
  }
  try {
    const { itemId, itemType } = req.body;
    
    if (!itemId || !itemType) {
      return res.status(400).json({ message: 'itemId and itemType are required' });
    }
    
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(cartItem => 
      !(cartItem.item.toString() === itemId && cartItem.itemType === itemType)
    );
    
    await cart.save();
    
    // Return populated cart items
    const populatedItems = await Promise.all(
      cart.items.map(async (cartItem) => {
        if (cartItem.itemType === 'medicine') {
          const medicine = await Medicine.findById(cartItem.item);
          return {
            ...cartItem.toObject(),
            item: medicine ? { ...medicine.toObject(), discountedPrice: medicine.discountedPrice } : null
          };
        } else if (cartItem.itemType === 'product') {
          const product = await Product.findById(cartItem.item);
          return {
            ...cartItem.toObject(),
            item: product ? { ...product.toObject(), discountedPrice: product.discountedPrice } : null
          };
        }
        return null;
      })
    );
    
    const validItems = populatedItems.filter(item => item && item.item);
    res.json(validItems);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clearCart = async (req, res) => {
  if (!isUserRole(req)) {
    return res.status(403).json({ message: 'Cart is only available for users.' });
  }
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    res.json(cart.items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// For testing purposes - clear all carts
exports.clearAllCarts = async (req, res) => {
  if (!isUserRole(req)) {
    return res.status(403).json({ message: 'Cart is only available for users.' });
  }
  try {
    const result = await Cart.deleteMany({});
    res.json({ message: `Cleared ${result.deletedCount} carts` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 

// Merge guest cart with user cart after login
exports.mergeCart = async (req, res) => {
  if (!isUserRole(req)) {
    return res.status(403).json({ message: 'Cart is only available for users.' });
  }
  try {
    const guestItems = req.body.items;
    if (!Array.isArray(guestItems)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    for (const guestItem of guestItems) {
      if (!guestItem.item || !guestItem.itemType || !guestItem.quantity) continue;
      const existing = cart.items.find(
        cartItem => cartItem.item.toString() === guestItem.item && cartItem.itemType === guestItem.itemType
      );
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        cart.items.push({
          item: guestItem.item,
          itemType: guestItem.itemType,
          quantity: guestItem.quantity
        });
      }
    }
    await cart.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 