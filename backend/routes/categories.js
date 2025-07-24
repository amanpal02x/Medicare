const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', categoryController.getAllCategories);
router.post('/', auth, role(['admin', 'pharmacist']), categoryController.createCategory);
router.put('/:id', auth, role(['admin', 'pharmacist']), categoryController.updateCategory);
router.delete('/:id', auth, role(['admin', 'pharmacist']), categoryController.deleteCategory);

module.exports = router; 