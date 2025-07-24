const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

// Submit a rating (requires authentication)
router.post('/submit', auth, ratingController.submitRating);

// Get ratings for a product or medicine (public)
router.get('/product/:itemId', ratingController.getProductRatings);

// Get ratings for a delivery boy (public)
router.get('/delivery/:deliveryBoyId', ratingController.getDeliveryBoyRatings);

// Get user's ratings (requires authentication)
router.get('/user', auth, ratingController.getUserRatings);

// Update a rating (requires authentication)
router.put('/:ratingId', auth, ratingController.updateRating);

// Delete a rating (requires authentication)
router.delete('/:ratingId', auth, ratingController.deleteRating);

module.exports = router; 