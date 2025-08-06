const express = require('express');
const router = express.Router();
const pharmacistController = require('../controllers/pharmacistController');
const auth = require('../middleware/auth');
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
router.patch('/medicines/:id/discount', auth, role('pharmacist'), pharmacistController.updateMedicineDiscount);

// Product routes
router.get('/products', auth, role('pharmacist'), pharmacistController.getProducts);
router.post('/products', auth, role('pharmacist'), uploadSingle('image'), pharmacistController.addProduct);
router.get('/products/:id', auth, role('pharmacist'), pharmacistController.getProductById);
router.put('/products/:id', auth, role('pharmacist'), uploadSingle('image'), pharmacistController.updateProduct);
router.delete('/products/:id', auth, role('pharmacist'), pharmacistController.deleteProduct);
router.patch('/products/:id/discount', auth, role('pharmacist'), pharmacistController.updateProductDiscount);

// Order routes
router.get('/orders', auth, role('pharmacist'), pharmacistController.getAssignedOrders);
router.get('/orders/:orderId', auth, role('pharmacist'), pharmacistController.getOrderDetails);
router.put('/orders/:orderId/status', auth, role('pharmacist'), pharmacistController.updateOrderStatus);
router.post('/orders/:orderId/claim', auth, role('pharmacist'), pharmacistController.claimOrder);

// Sales routes
router.get('/sales', auth, role('pharmacist'), pharmacistController.getSales);
router.post('/sales', auth, role('pharmacist'), pharmacistController.addSale);
router.delete('/sales/:id', auth, role('pharmacist'), pharmacistController.deleteSale);

// Customer routes
router.get('/customers', auth, role('pharmacist'), pharmacistController.getCustomers);
router.post('/customers', auth, role('pharmacist'), pharmacistController.createCustomer);
router.put('/customers/:id', auth, role('pharmacist'), pharmacistController.updateCustomer);
router.delete('/customers/:id', auth, role('pharmacist'), pharmacistController.deleteCustomer);

// Supplier routes
router.get('/suppliers', auth, role('pharmacist'), pharmacistController.getSuppliers);
router.post('/suppliers', auth, role('pharmacist'), pharmacistController.createSupplier);
router.put('/suppliers/:id', auth, role('pharmacist'), pharmacistController.updateSupplier);
router.delete('/suppliers/:id', auth, role('pharmacist'), pharmacistController.deleteSupplier);

// Invoice routes
router.get('/invoices', auth, role('pharmacist'), pharmacistController.getInvoices);
router.post('/invoices', auth, role('pharmacist'), pharmacistController.createInvoice);
router.put('/invoices/:id', auth, role('pharmacist'), pharmacistController.updateInvoice);
router.delete('/invoices/:id', auth, role('pharmacist'), pharmacistController.deleteInvoice);

// Discount routes
router.get('/discounts', auth, role('pharmacist'), pharmacistController.getDiscounts);
router.post('/discounts', auth, role('pharmacist'), pharmacistController.createDiscount);
router.put('/discounts/:id', auth, role('pharmacist'), pharmacistController.updateDiscount);
router.delete('/discounts/:id', auth, role('pharmacist'), pharmacistController.deleteDiscount);

// Category routes
router.get('/categories', auth, role('pharmacist'), pharmacistController.getCategories);
router.post('/categories', auth, role('pharmacist'), pharmacistController.addCategory);
router.put('/categories/:id', auth, role('pharmacist'), pharmacistController.updateCategory);
router.delete('/categories/:id', auth, role('pharmacist'), pharmacistController.deleteCategory);

// Analytics route
router.get('/analytics', auth, role('pharmacist'), pharmacistController.getAnalytics);

// Notifications
router.get('/notifications', auth, role('pharmacist'), pharmacistController.getNotifications);
router.put('/notifications/:notificationId/read', auth, role('pharmacist'), pharmacistController.markNotificationRead);
router.put('/notifications/:notificationId/assign', auth, role('pharmacist'), pharmacistController.assignNotification);

// Location and status routes
router.put('/location', auth, role('pharmacist'), pharmacistController.updateLocationAndStatus);
router.post('/location', auth, pharmacistController.updateLocation);
router.post('/set-location-manually', auth, role('pharmacist'), pharmacistController.setLocationManually);

// Public routes (no auth required)
router.get('/nearby', pharmacistController.getNearbyPharmacists);
router.get('/nearby-products-medicines', pharmacistController.getNearbyProductsAndMedicines);
router.get('/debug-locations', pharmacistController.debugPharmacistLocations);

module.exports = router; 