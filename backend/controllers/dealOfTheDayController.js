const DealOfTheDay = require('../models/DealOfTheDay');
const Medicine = require('../models/Medicine');
const Product = require('../models/Product');

// Get all active deals
exports.getActiveDeals = async (req, res) => {
  try {
    const now = new Date();
    // Remove expired deals
    await DealOfTheDay.deleteMany({ endTime: { $lte: now } });
    // Return only active deals
    const deals = await DealOfTheDay.find({ endTime: { $gt: now } })
      .populate('item')
      .populate('createdBy', 'name email');
    // Ensure each deal's item includes discount fields
    const dealsWithDiscounts = deals.map(deal => {
      const dealObj = deal.toObject();
      if (dealObj.item) {
        const itemWithVirtuals = deal.item.toObject ? deal.item.toObject({ virtuals: true }) : deal.item;
        dealObj.item = {
          ...itemWithVirtuals,
          discountPercentage: deal.item.discountPercentage || 0
        };
      }
      return dealObj;
    });
    res.json(dealsWithDiscounts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new deal (pharmacist only)
exports.createDeal = async (req, res) => {
  try {

    const { item, itemType, discountPercentage, endTime } = req.body;
    if (!item || !itemType || !discountPercentage || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Validate item exists
    let foundItem;
    if (itemType === 'Medicine') {
      foundItem = await Medicine.findById(item);
    } else if (itemType === 'Product') {
      foundItem = await Product.findById(item);
    }
    if (!foundItem) {
      return res.status(404).json({ message: `${itemType} not found` });
    }
    // Find the pharmacist document for the current user
    let pharmacistId = null;
    if (req.user.role === 'pharmacist') {
      const Pharmacist = require('../models/Pharmacist');
      const pharmacist = await Pharmacist.findOne({ user: req.user.id });
      if (!pharmacist) {
        return res.status(403).json({ message: 'Pharmacist profile not found' });
      }
      pharmacistId = pharmacist._id;
    }
    // Create deal
    const deal = new DealOfTheDay({
      item,
      itemType,
      discountPercentage,
      startTime: new Date(),
      endTime: new Date(endTime),
      createdBy: pharmacistId || req.user.id, // pharmacistId for pharmacists, fallback for admin
    });
    await deal.save();
    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a deal (pharmacist or admin)
exports.deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await DealOfTheDay.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    // Only creator (pharmacist) or admin can delete
    if (req.user.role === 'admin') {
      await deal.deleteOne();
      return res.json({ message: 'Deal deleted' });
    }
    if (req.user.role === 'pharmacist') {
      // Find the pharmacist document for the current user
      const Pharmacist = require('../models/Pharmacist');
      const pharmacist = await Pharmacist.findOne({ user: req.user.id });
      if (!pharmacist) {
        return res.status(403).json({ message: 'Pharmacist profile not found' });
      }
      if (deal.createdBy.toString() !== pharmacist._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      await deal.deleteOne();
      return res.json({ message: 'Deal deleted' });
    }
    // If not admin or pharmacist
    return res.status(403).json({ message: 'Not authorized' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a deal (pharmacist or admin)
exports.updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { item, itemType, discountPercentage, endTime } = req.body;
    const deal = await DealOfTheDay.findById(id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    // Only creator or admin can update
    if (deal.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (item) deal.item = item;
    if (itemType) deal.itemType = itemType;
    if (discountPercentage !== undefined) deal.discountPercentage = discountPercentage;
    if (endTime) deal.endTime = new Date(endTime);
    await deal.save();
    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all deals (show all deals to pharmacists and admins)
exports.getAllDeals = async (req, res) => {
  try {
    // Show all deals to pharmacists and admins (no filtering)
    const deals = await DealOfTheDay.find({}).populate('item').populate('createdBy', 'name email');
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 