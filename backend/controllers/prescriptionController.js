const Prescription = require('../models/Prescription');
const path = require('path');

exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const prescription = new Prescription({
      user: req.user.id,
      imageUrl: `/uploads/${req.file.filename}`,
      status: 'pending',
      doctorName: req.body.doctorName || '',
      prescriptionDate: req.body.prescriptionDate || new Date()
    });
    
    await prescription.save();
    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user.id })
      .populate('pharmacist', 'name pharmacyName')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ _id: req.params.id, user: req.user.id })
      .populate('pharmacist', 'name pharmacyName');
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json({ message: 'Prescription deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllPrescriptions = async (req, res) => {
  console.log('getAllPrescriptions controller reached');
  try {
    console.log('Fetching all prescriptions...');
    const prescriptions = await Prescription.find()
      .populate('user', 'name email')
      .populate('pharmacist', 'name pharmacyName')
      .sort({ createdAt: -1 });
    console.log('Prescriptions fetched:', prescriptions.length);
    res.json(prescriptions);
  } catch (err) {
    console.error('Error in getAllPrescriptions:', err.stack || err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.processPrescription = async (req, res) => {
  try {
    const { medicines, pharmacistNote, totalAmount } = req.body;
    
    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ message: 'Medicines are required' });
    }

    // Find the pharmacist document for the current user
    const Pharmacist = require('../models/Pharmacist');
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'processed',
        pharmacist: pharmacist._id,
        pharmacistNote,
        medicines,
        totalAmount,
        pharmacistActionAt: new Date(),
        statusChangedBy: req.user.id,
        isProcessed: true,
        processedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email');

    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approvePrescription = async (req, res) => {
  try {
    const { pharmacistNote } = req.body;
    
    // Find the pharmacist document for the current user
    const Pharmacist = require('../models/Pharmacist');
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'approved',
        pharmacist: pharmacist._id,
        pharmacistNote,
        pharmacistActionAt: new Date(),
        statusChangedBy: req.user.id
      },
      { new: true }
    );
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectPrescription = async (req, res) => {
  try {
    const { pharmacistNote } = req.body;
    
    // Find the pharmacist document for the current user
    const Pharmacist = require('../models/Pharmacist');
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        pharmacist: pharmacist._id,
        pharmacistNote,
        pharmacistActionAt: new Date(),
        statusChangedBy: req.user.id
      },
      { new: true }
    );
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get processed prescriptions for reordering
exports.getProcessedPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      user: req.user.id, 
      status: 'processed',
      isProcessed: true 
    })
    .populate('pharmacist', 'name pharmacyName')
    .sort({ processedAt: -1 });
    
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 