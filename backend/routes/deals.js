const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealOfTheDayController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Public: Get all active deals
router.get('/active', dealController.getActiveDeals);

// Pharmacist: Create a new deal
router.post('/', auth, role(['pharmacist', 'admin']), dealController.createDeal);

// Pharmacist/Admin: Delete a deal
router.delete('/:id', auth, role(['pharmacist', 'admin']), dealController.deleteDeal);

// Pharmacist/Admin: Get all deals
router.get('/', auth, role(['pharmacist', 'admin']), dealController.getAllDeals);

// Pharmacist/Admin: Update a deal
router.put('/:id', auth, role(['pharmacist', 'admin']), dealController.updateDeal);

module.exports = router; 