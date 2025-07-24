const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.get('/', auth, cartController.getCart);
router.post('/add', auth, cartController.addToCart);
router.put('/update', auth, cartController.updateCartItem);
router.delete('/remove', auth, cartController.removeFromCart);
router.delete('/clear', auth, cartController.clearCart);
router.delete('/clear-all', auth, cartController.clearAllCarts);

// Merge guest cart with user cart after login
router.post('/merge', auth, cartController.mergeCart);

module.exports = router; 