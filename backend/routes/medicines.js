const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/search', medicineController.searchMedicines);
// Public: Get medicines from nearby pharmacists
router.get('/nearby', medicineController.getNearbyMedicines);
router.get('/', auth, role('pharmacist'), medicineController.getAllMedicines);
router.patch('/:id/discount', auth, role('pharmacist'), medicineController.updateDiscount);
router.get('/:id', medicineController.getMedicineById);
// Public: Get all medicines for a given pharmacist (requires lat/lng query params for distance enforcement)
router.get('/by-pharmacist/:pharmacistId', medicineController.getMedicinesByPharmacist);
router.get('/frequently-searched', medicineController.getFrequentlySearchedMedicines);
// Public: Get similar medicines based on smart keyword matching
router.get('/:id/similar', medicineController.getSimilarMedicines);

module.exports = router; 