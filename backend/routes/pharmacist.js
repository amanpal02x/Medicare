const express = require('express');
const router = express.Router();
const pharmacistController = require('../controllers/pharmacistController');
const { auth } = require('../middleware/auth');
const role = require('../middleware/role');
const { uploadSingle } = require('../middleware/cloudinaryUpload');

// Profile routes
router.get('/profile', auth, role('pharmacist'), pharmacistController.getProfile);
router.put('/profile', auth, role('pharmacist'), uploadSingle('profilePhoto'), pharmacistController.updateProfile);

// Medicine routes
router.get('/medicines', auth, role('pharmacist'), pharmacistController.getMedicines);
router.post('/medicines', auth, role('pharmacist'), uploadSingle('image'), pharmacistController.addMedicine);
router.put('/medicines/:id', auth, role('pharmacist'), uploadSingle('image'), pharmacistController.updateMedicine);
router.delete('/medicines/:id', auth, role('pharmacist'), pharmacistController.deleteMedicine);

// Product routes
router.get('/products', auth, role('pharmacist'), pharmacistController.getProducts);
router.post('/products', auth, role('pharmacist'), uploadSingle('image'), pharmacistController.addProduct);
router.get('/products/:id', auth, role('pharmacist'), pharmacistController.getProduct);
router.put('/products/:id', auth, role('pharmacist'), uploadSingle('image'), pharmacistController.updateProduct);
router.delete('/products/:id', auth, role('pharmacist'), pharmacistController.deleteProduct);

// Order routes
router.get('/orders', auth, role('pharmacist'), pharmacistController.getOrders);
router.get('/orders/:id', auth, role('pharmacist'), pharmacistController.getOrder);
router.put('/orders/:id/status', auth, role('pharmacist'), pharmacistController.updateOrderStatus);

// Sales routes
router.get('/sales', auth, role('pharmacist'), pharmacistController.getSales);
router.get('/sales/report', auth, role('pharmacist'), pharmacistController.getSalesReport);

// Customer routes
router.get('/customers', auth, role('pharmacist'), pharmacistController.getCustomers);

// Prescription routes
router.get('/prescriptions', auth, role('pharmacist'), pharmacistController.getPrescriptions);
router.get('/prescriptions/:id', auth, role('pharmacist'), pharmacistController.getPrescription);
router.put('/prescriptions/:id/status', auth, role('pharmacist'), pharmacistController.updatePrescriptionStatus);

// Supplier routes
router.get('/suppliers', auth, role('pharmacist'), pharmacistController.getSuppliers);
router.post('/suppliers', auth, role('pharmacist'), pharmacistController.addSupplier);
router.put('/suppliers/:id', auth, role('pharmacist'), pharmacistController.updateSupplier);
router.delete('/suppliers/:id', auth, role('pharmacist'), pharmacistController.deleteSupplier);

// Invoice routes
router.get('/invoices', auth, role('pharmacist'), pharmacistController.getInvoices);
router.get('/invoices/:id', auth, role('pharmacist'), pharmacistController.getInvoice);

// Deal routes
router.get('/deals', auth, role('pharmacist'), pharmacistController.getDeals);
router.post('/deals', auth, role('pharmacist'), pharmacistController.addDeal);
router.put('/deals/:id', auth, role('pharmacist'), pharmacistController.updateDeal);
router.delete('/deals/:id', auth, role('pharmacist'), pharmacistController.deleteDeal);

// Discount routes
router.get('/discounts', auth, role('pharmacist'), pharmacistController.getDiscounts);
router.post('/discounts', auth, role('pharmacist'), pharmacistController.addDiscount);
router.put('/discounts/:id', auth, role('pharmacist'), pharmacistController.updateDiscount);
router.delete('/discounts/:id', auth, role('pharmacist'), pharmacistController.deleteDiscount);

module.exports = router; 