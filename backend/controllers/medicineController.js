const Medicine = require('../models/Medicine');

exports.searchMedicines = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query is required' });
    const medicines = await Medicine.find({ name: { $regex: q, $options: 'i' } });
    const result = medicines.map(med => ({
      ...med.toObject({ virtuals: true }),
      discountPercentage: med.discountPercentage || 0
    }));
    res.json(result);
  } catch (err) {
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
      discountPercentage: med.discountPercentage || 0
    }));
    res.json(result);
  } catch (err) {
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
    res.json(med);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const { id } = req.params;
    const med = await Medicine.findById(id);
    if (!med) return res.status(404).json({ message: 'Medicine not found' });
    res.json({
      ...med.toObject({ virtuals: true }),
      discountPercentage: med.discountPercentage || 0
    });
  } catch (err) {
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
      discountPercentage: med.discountPercentage || 0
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