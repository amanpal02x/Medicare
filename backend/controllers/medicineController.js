const Medicine = require('../models/Medicine');
const { findSimilarMedicines } = require('../utils/similarityUtils');

exports.searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }
    
    const medicines = await Medicine.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
    .populate('category', 'name')
    .populate('pharmacist', 'pharmacyName')
    .sort({ score: { $meta: "textScore" } })
    .limit(10);
    
    const result = medicines.map(med => ({
      ...med.toObject({ virtuals: true }),
      price: Number(med.price) || 0,
      discountPercentage: Number(med.discountPercentage) || 0,
      discountedPrice: med.discountedPrice || Number(med.price) || 0
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error searching medicines:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    let filter = {};
    // Only show pharmacist's medicines if user is a pharmacist
    if (req.user && req.user.role === 'pharmacist') {
      const Pharmacist = require('../models/Pharmacist');
      const pharmacist = await Pharmacist.findOne({ user: req.user.id });
      if (pharmacist) {
        filter.pharmacist = pharmacist._id;
      } else {
        // If pharmacist profile not found, return empty array
        return res.json([]);
      }
    }
    const medicines = await Medicine.find(filter);
    const result = medicines.map(med => ({
      ...med.toObject({ virtuals: true }),
      price: Number(med.price) || 0,
      discountPercentage: Number(med.discountPercentage) || 0,
      discountedPrice: med.discountedPrice || Number(med.price) || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Public endpoint to get all medicines from all pharmacists (for fallback when location is not available)
exports.getAllMedicinesPublic = async (req, res) => {
  try {
    const medicines = await Medicine.find({})
      .populate('category', 'name')
      .populate('pharmacist', 'pharmacyName');
    
    const result = medicines.map(med => ({
      ...med.toObject({ virtuals: true }),
      price: Number(med.price) || 0,
      discountPercentage: Number(med.discountPercentage) || 0,
      discountedPrice: med.discountedPrice || Number(med.price) || 0
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error getting all medicines:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountPercentage } = req.body;
    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ message: 'Discount must be between 0 and 100' });
    }
    const med = await Medicine.findByIdAndUpdate(id, { discountPercentage }, { new: true });
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    
    // Return with virtuals included
    const medicineData = med.toObject({ virtuals: true });
    res.json({
      ...medicineData,
      price: Number(medicineData.price) || 0,
      discountPercentage: Number(medicineData.discountPercentage) || 0,
      discountedPrice: medicineData.discountedPrice || Number(medicineData.price) || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const med = await Medicine.findById(id).populate('category', 'name');
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    
    // Debug logging
    console.log('Medicine raw data:', {
      id: med._id,
      name: med.name,
      price: med.price,
      discountPercentage: med.discountPercentage,
      discountedPrice: med.discountedPrice
    });
    
    // Return the medicine with virtual fields and consistent price formatting
    const medicineData = med.toObject({ virtuals: true });
    
    // Debug logging after processing
    console.log('Medicine processed data:', {
      id: medicineData._id,
      name: medicineData.name,
      price: medicineData.price,
      discountPercentage: medicineData.discountPercentage,
      discountedPrice: medicineData.discountedPrice
    });
    
    res.json({
      ...medicineData,
      price: Number(medicineData.price) || 0,
      discountPercentage: Number(medicineData.discountPercentage) || 0,
      discountedPrice: medicineData.discountedPrice || Number(medicineData.price) || 0
    });
  } catch (err) {
    console.error('Error fetching medicine by ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMedicinesByPharmacist = async (req, res) => {
  try {
    const { pharmacistId } = req.params;
    const { lat, lng } = req.query;
    if (!pharmacistId) return res.status(400).json({ message: 'pharmacistId is required' });
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });
    const Pharmacist = require('../models/Pharmacist');
    const pharmacist = await Pharmacist.findById(pharmacistId);
    if (!pharmacist || !pharmacist.location || !pharmacist.location.coordinates) {
      return res.status(404).json({ message: 'Pharmacist not found or location not set' });
    }
    // Calculate distance (Haversine formula)
    const toRad = (value) => (value * Math.PI) / 180;
    const [pharmLng, pharmLat] = pharmacist.location.coordinates;
    const R = 6371; // km
    const dLat = toRad(parseFloat(lat) - pharmLat);
    const dLng = toRad(parseFloat(lng) - pharmLng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(pharmLat)) * Math.cos(toRad(parseFloat(lat))) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    if (distance > 5) {
      return res.status(403).json({ message: 'You are too far from this pharmacist to view their medicines.' });
    }
    const medicines = await Medicine.find({ pharmacist: pharmacistId });
    const result = medicines.map(med => ({
      ...med.toObject({ virtuals: true }),
      price: Number(med.price) || 0,
      discountPercentage: Number(med.discountPercentage) || 0,
      discountedPrice: med.discountedPrice || Number(med.price) || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Returns a static list of frequently searched medicines
exports.getFrequentlySearchedMedicines = async (req, res) => {
  // This can be replaced with a DB query for real analytics
  const frequentlySearched = [
    { name: 'Ecosprin 75mg Strip Of 14 Tablets' },
    { name: 'Dolo 650mg Strip Of 15 Tablets' },
    { name: 'Evion 400mg Strip Of 10 Capsules' },
    { name: 'Pan 40mg Strip Of 15 Tablets' },
    { name: 'Pharmeasy Multivitamin Multimineral - Pack Of 60' },
    { name: 'Pharmeasy Calcium, Magnesium, Zinc & Vitamin D3 - Pack Of 60' },
    { name: 'Horlicks Health & Nutrition Drink Jar, 500 G' }
  ];
  res.json(frequentlySearched);
};

// Get similar medicines based on smart keyword matching
exports.getSimilarMedicines = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;
    
    // Get the current medicine
    const currentMedicine = await Medicine.findById(id)
      .populate('category', 'name')
      .populate('pharmacist', 'pharmacyName');
    
    if (!currentMedicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    // Get all medicines (excluding the current one)
    const allMedicines = await Medicine.find({ _id: { $ne: id } })
      .populate('category', 'name')
      .populate('pharmacist', 'pharmacyName');
    
    // Find similar medicines using smart matching
    const similarMedicines = findSimilarMedicines(currentMedicine, allMedicines, parseInt(limit));
    
    res.json(similarMedicines);
  } catch (err) {
    console.error('Error getting similar medicines:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 