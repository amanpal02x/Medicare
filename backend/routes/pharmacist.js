const express = require('express');
const router = express.Router();
const pharmacistController = require('../controllers/pharmacistController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');

// Registration & profile
router.post('/register', pharmacistController.register);
router.get('/profile', auth, role('pharmacist'), pharmacistController.getProfile);
router.put('/profile', auth, role('pharmacist'), pharmacistController.updateProfile);

// Product management
router.post('/medicines', auth, role('pharmacist'), upload.single('image'), pharmacistController.addMedicine);
router.put('/medicines/:id', auth, role('pharmacist'), upload.single('image'), pharmacistController.updateMedicine);
router.delete('/medicines/:id', auth, role('pharmacist'), pharmacistController.deleteMedicine);
router.patch('/medicines/:id/discount', auth, role('pharmacist'), pharmacistController.updateMedicineDiscount);

// Product management (non-medicine)
router.post('/products', auth, role('pharmacist'), upload.single('image'), pharmacistController.addProduct);
router.get('/products', auth, role('pharmacist'), pharmacistController.getProducts);
router.put('/products/:id', auth, role('pharmacist'), upload.single('image'), pharmacistController.updateProduct);
router.delete('/products/:id', auth, role('pharmacist'), pharmacistController.deleteProduct);

// Order management
router.get('/orders', auth, role('pharmacist'), pharmacistController.getAssignedOrders);
router.get('/orders/:orderId', auth, role('pharmacist'), pharmacistController.getOrderDetails);
router.put('/orders/:orderId/status', auth, role('pharmacist'), pharmacistController.updateOrderStatus);
router.post('/orders/:orderId/claim', auth, role('pharmacist'), pharmacistController.claimOrder);

// Discount management
router.post('/discounts', auth, role('pharmacist'), pharmacistController.createDiscount);
router.get('/discounts', auth, role('pharmacist'), pharmacistController.getDiscounts);
router.put('/discounts/:id', auth, role('pharmacist'), pharmacistController.updateDiscount);
router.delete('/discounts/:id', auth, role('pharmacist'), pharmacistController.deleteDiscount);

// Invoice routes
router.get('/invoices', auth, role('pharmacist'), pharmacistController.getInvoices);
router.post('/invoices', auth, role('pharmacist'), pharmacistController.createInvoice);
router.put('/invoices/:id', auth, role('pharmacist'), pharmacistController.updateInvoice);
router.delete('/invoices/:id', auth, role('pharmacist'), pharmacistController.deleteInvoice);

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

// Analytics route
router.get('/analytics', auth, role('pharmacist'), pharmacistController.getAnalytics);

// Sales management
router.post('/sales', auth, role('pharmacist'), pharmacistController.addSale);
router.get('/sales', auth, role('pharmacist'), pharmacistController.getSales);

// Notifications
router.get('/notifications', auth, role('pharmacist'), pharmacistController.getNotifications);
router.put('/notifications/:notificationId/read', auth, role('pharmacist'), pharmacistController.markNotificationRead);
router.put('/notifications/:notificationId/assign', auth, role('pharmacist'), pharmacistController.assignNotification);

// Category management
router.get('/categories', auth, role('pharmacist'), pharmacistController.getCategories);
router.post('/categories', auth, role('pharmacist'), pharmacistController.addCategory);
router.put('/categories/:id', auth, role('pharmacist'), pharmacistController.updateCategory);
router.delete('/categories/:id', auth, role('pharmacist'), pharmacistController.deleteCategory);

// Add location and online status update
router.put('/location', auth, role('pharmacist'), pharmacistController.updateLocationAndStatus);
// Add this route for updating location
router.post('/location', auth, pharmacistController.updateLocation);
// Get nearby online pharmacists (stores)
router.get('/nearby', pharmacistController.getNearbyPharmacists);
// Get products and medicines from nearby pharmacists (public)
router.get('/nearby-products-medicines', pharmacistController.getNearbyProductsAndMedicines);

module.exports = router; 