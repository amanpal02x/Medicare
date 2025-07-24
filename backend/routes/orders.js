const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/', auth, orderController.placeOrder);
router.get('/:id', auth, orderController.getOrder);
router.put('/:id', auth, orderController.updateOrder);
router.get('/track/:id', auth, orderController.trackOrder);
router.get('/', auth, orderController.getUserOrders);
// Pharmacist creates order from prescription
router.post('/from-prescription/:prescriptionId', auth, role(['pharmacist']), orderController.createOrderFromPrescription);

module.exports = router; 