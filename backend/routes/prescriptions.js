const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { uploadSingle } = require('../middleware/cloudinaryUpload');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.post('/upload', auth, uploadSingle('file'), prescriptionController.uploadPrescription);
router.get('/', auth, prescriptionController.getPrescriptions);
router.get('/processed', auth, prescriptionController.getProcessedPrescriptions);
router.get('/:id', auth, prescriptionController.getPrescription);
router.get('/all', auth, role('pharmacist'), prescriptionController.getAllPrescriptions);
router.patch('/:id/process', auth, role('pharmacist'), prescriptionController.processPrescription);
router.patch('/:id/approve', auth, role('pharmacist'), prescriptionController.approvePrescription);
router.patch('/:id/reject', auth, role('pharmacist'), prescriptionController.rejectPrescription);
router.delete('/:id', auth, prescriptionController.deletePrescription);

module.exports = router; 