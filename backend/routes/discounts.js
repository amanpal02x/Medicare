const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const auth = require('../middleware/auth');

router.post('/', auth, discountController.createDiscount);
router.get('/', auth, discountController.getDiscounts);

module.exports = router; 