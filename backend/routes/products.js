const express = require('express');
const router = express.Router();
const pharmacistController = require('../controllers/pharmacistController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Public: Get all products
router.get('/', pharmacistController.getAllProducts);

// Protected: Update the discount percentage of a product
router.patch('/:id/discount', auth, role('pharmacist'), pharmacistController.updateProductDiscount);

// Public: Get a single product by ID
router.get('/:id', pharmacistController.getProductById);

// Public: Get all products for a given pharmacist (requires lat/lng query params for distance enforcement)
router.get('/by-pharmacist/:pharmacistId', pharmacistController.getProductsByPharmacist);

// Public: Get similar products based on smart keyword matching
router.get('/:id/similar', pharmacistController.getSimilarProducts);

module.exports = router; 