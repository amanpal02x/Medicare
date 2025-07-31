const Pharmacist = require('../models/Pharmacist');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Medicine = require('../models/Medicine');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Category = require('../models/Category');
const Order = require('../models/Order');
const { Notification, UserNotification } = require('../models/Notification');
const Discount = require('../models/Discount');
const axios = require('axios'); // Add this at the top for HTTP requests
const { findSimilarProducts } = require('../utils/similarityUtils');

exports.register = async (req, res) => {
  try {
    const { userId, pharmacyName, address, contact, kycDocs, timings } = req.body;
    // Check if pharmacist already exists for this user
    let existing = await Pharmacist.findOne({ user: userId });
    if (existing && existing.status !== 'rejected') {
      return res.status(400).json({ message: 'Pharmacist already registered for this user' });
    }
    if (existing && existing.status === 'rejected') {
      // Allow re-registration by updating the rejected record
      existing.pharmacyName = pharmacyName;
      existing.address = address;
      existing.contact = contact;
      existing.kycDocs = kycDocs;
      existing.timings = timings;
      existing.status = 'pending';
      existing.isVerified = false;
      await existing.save();
      return res.status(201).json({ message: 'Re-registration submitted. Pending admin approval.', pharmacist: existing });
    }
    const pharmacist = new Pharmacist({
      user: userId,
      pharmacyName,
      address,
      contact,
      kycDocs,
      timings,
      status: 'pending',
      isVerified: false
    });
    await pharmacist.save();
    res.status(201).json({ message: 'Registration submitted. Pending admin approval.', pharmacist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    // req.user.id is set by auth middleware
    const pharmacist = await Pharmacist.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    
    // Debug: Log the pharmacist data
    console.log('Pharmacist profile data:', {
      name: pharmacist.user.name,
      email: pharmacist.user.email,
      pharmacyName: pharmacist.pharmacyName,
      address: pharmacist.address,
      contact: pharmacist.contact,
      status: pharmacist.status
    });
    
    res.json({
      name: pharmacist.user.name,
      email: pharmacist.user.email,
      pharmacyName: pharmacist.pharmacyName,
      address: pharmacist.address,
      contact: pharmacist.contact,
      kycDocs: pharmacist.kycDocs,
      timings: pharmacist.timings,
      isVerified: pharmacist.isVerified,
      status: pharmacist.status,
      location: pharmacist.location, // Add location to response
      online: pharmacist.online // Add online status to response
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    // Update pharmacist fields
    const { name, email, pharmacyName, address, contact, timings } = req.body;
    if (pharmacyName !== undefined) pharmacist.pharmacyName = pharmacyName;
    if (address !== undefined) pharmacist.address = address;
    if (contact !== undefined) pharmacist.contact = contact;
    if (timings !== undefined) pharmacist.timings = timings;
    await pharmacist.save();
    // Update user fields
    const user = await User.findById(pharmacist.user);
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    
    // Handle profile photo upload
    if (req.cloudinaryResult) {
      user.profilePhoto = req.cloudinaryResult.url; // Use the new Cloudinary result format
    }
    
    await user.save();
    res.json({ message: 'Profile updated', user: { name: user.name, email: user.email, profilePhoto: user.profilePhoto }, pharmacist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addMedicine = async (req, res) => {
  try {
    const { name, price, stock, expiryDate, discountPercentage } = req.body;
    if (!name || !price || !stock || !expiryDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Handle image upload
    let imageUrl = null;
    if (req.cloudinaryResult) {
      imageUrl = req.cloudinaryResult.url; // Use the new Cloudinary result format
    }
    
    // Find the pharmacist document for the current user
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    
    const medicine = new Medicine({
      name,
      price,
      stock,
      expiryDate,
      image: imageUrl,
      pharmacist: pharmacist._id,
      discountPercentage // <-- ensure this is saved
    });
    await medicine.save();
    const result = {
      ...medicine.toObject({ virtuals: true }),
      discountPercentage: medicine.discountPercentage || 0
    };
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { name, price, stock, expiryDate, discountPercentage } = req.body;
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    const medicine = await Medicine.findOne({ _id: req.params.id, pharmacist: pharmacist._id });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    
    // Handle image upload
    if (req.cloudinaryResult) {
      // Delete old image from Cloudinary if exists
      if (medicine.image && medicine.image.includes('cloudinary.com')) {
        const { deleteFromCloudinary, getPublicIdFromUrl } = require('../middleware/cloudinaryUpload');
        const publicId = getPublicIdFromUrl(medicine.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      medicine.image = req.cloudinaryResult.url; // Use the new Cloudinary result format
    }
    
    if (name !== undefined) medicine.name = name;
    if (price !== undefined) medicine.price = price;
    if (stock !== undefined) medicine.stock = stock;
    if (expiryDate !== undefined) medicine.expiryDate = expiryDate;
    if (discountPercentage !== undefined) medicine.discountPercentage = discountPercentage;
    await medicine.save();
    const result = {
      ...medicine.toObject({ virtuals: true }),
      discountPercentage: medicine.discountPercentage || 0
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateMedicineDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountPercentage } = req.body;
    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ message: 'Discount must be between 0 and 100' });
    }
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const medicine = await Medicine.findOneAndUpdate(
      { _id: id, pharmacist: pharmacist._id }, 
      { discountPercentage }, 
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    const result = {
      ...medicine.toObject({ virtuals: true }),
      discountPercentage: medicine.discountPercentage || 0
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, pharmacist: pharmacist._id });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getOrders = (req, res) => res.send('Get pharmacist orders');
exports.createDiscount = (req, res) => res.send('Create discount');
exports.getDiscounts = (req, res) => res.send('Get discounts');

// INVOICE CRUD
exports.getInvoices = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const invoices = await Invoice.find({ pharmacist: pharmacist._id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.createInvoice = async (req, res) => {
  try {
    // Find the pharmacist document for the current user
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    // Use pharmacist._id, not req.user.id
    const invoice = new Invoice({ ...req.body, pharmacist: pharmacist._id });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateInvoice = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, pharmacist: pharmacist._id },
      req.body,
      { new: true }
    );
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.deleteInvoice = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    await Invoice.findOneAndDelete({ _id: req.params.id, pharmacist: pharmacist._id });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// CUSTOMER CRUD
exports.getCustomers = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const customers = await Customer.find({ pharmacist: pharmacist._id });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.createCustomer = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const customer = new Customer({ ...req.body, pharmacist: pharmacist._id });
    await customer.save();
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateCustomer = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, pharmacist: pharmacist._id },
      req.body,
      { new: true }
    );
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.deleteCustomer = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    await Customer.findOneAndDelete({ _id: req.params.id, pharmacist: pharmacist._id });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// SUPPLIER CRUD
exports.getSuppliers = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const suppliers = await Supplier.find({ pharmacist: pharmacist._id });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.createSupplier = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const supplier = new Supplier({ ...req.body, pharmacist: pharmacist._id });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.updateSupplier = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const supplier = await Supplier.findOneAndUpdate(
      { _id: req.params.id, pharmacist: pharmacist._id },
      req.body,
      { new: true }
    );
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.deleteSupplier = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    await Supplier.findOneAndDelete({ _id: req.params.id, pharmacist: pharmacist._id });
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ANALYTICS
exports.getAnalytics = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const allInvoices = await Invoice.countDocuments({ pharmacist: pharmacist._id });
    const newInvoices = await Invoice.countDocuments({ pharmacist: pharmacist._id, status: 'Pending' });
    const draftInvoices = await Invoice.countDocuments({ pharmacist: pharmacist._id, status: 'Draft' });
    const paidInvoices = await Invoice.countDocuments({ pharmacist: pharmacist._id, status: 'Paid' });
    res.json({ allInvoices, newInvoices, draftInvoices, paidInvoices });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const { name, category, price, stock, brand, discountPercentage, subcategory } = req.body;
    if (!name || !category || !price || !stock) {
      return res.status(400).json({ message: 'Name, category, price, and stock are required' });
    }
    // Handle category as name or ObjectId
    let categoryId = category;
    if (category && !require('mongoose').Types.ObjectId.isValid(category)) {
      const foundCategory = await Category.findOne({ name: category });
      if (!foundCategory) {
        return res.status(400).json({ message: 'Category not found' });
      }
      categoryId = foundCategory._id;
    }
    // Handle image upload
    let imageUrl = null;
    if (req.cloudinaryResult) {
      imageUrl = req.cloudinaryResult.url; // Use the new Cloudinary result format
    }
    // Find the pharmacist document for the current user
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const product = new Product({
      name,
      category: categoryId,
      subcategory, // <-- save subcategory
      price,
      stock,
      brand,
      image: imageUrl,
      pharmacist: pharmacist._id,
      discountPercentage
    });
    await product.save();
    const result = {
      ...product.toObject({ virtuals: true }),
      discountPercentage: product.discountPercentage || 0
    };
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    // Find the pharmacist document for the current user
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    // Use pharmacist._id to filter products and populate category
    const products = await Product.find({ pharmacist: pharmacist._id })
      .populate('category', 'name');
    const result = products.map(prod => ({
      ...prod.toObject({ virtuals: true }),
      discountPercentage: prod.discountPercentage || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Public method to get all products (for landing page)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, subcategory } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    
    // Only show pharmacist's products if user is a pharmacist
    if (req.user && req.user.role === 'pharmacist') {
      const pharmacist = await Pharmacist.findOne({ user: req.user.id });
      if (pharmacist) {
        filter.pharmacist = pharmacist._id;
      } else {
        // If pharmacist profile not found, return empty array
        return res.json([]);
      }
    }
    
    const products = await Product.find(filter)
      .populate('pharmacist', 'pharmacyName')
      .populate('category', 'name');
    
    const result = products.map(prod => ({
      ...prod.toObject({ virtuals: true }),
      price: Number(prod.price) || 0,
      discountPercentage: Number(prod.discountPercentage) || 0,
      discountedPrice: prod.discountedPrice || Number(prod.price) || 0
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error fetching all products:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Public endpoint to get all products from all pharmacists (for fallback when location is not available)
exports.getAllProductsPublic = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('pharmacist', 'pharmacyName')
      .populate('category', 'name');
    
    const result = products.map(prod => ({
      ...prod.toObject({ virtuals: true }),
      price: Number(prod.price) || 0,
      discountPercentage: Number(prod.discountPercentage) || 0,
      discountedPrice: prod.discountedPrice || Number(prod.price) || 0
    }));
    
    res.json(result);
  } catch (err) {
    console.error('Error getting all products:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock, brand, discountPercentage, subcategory } = req.body;
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    const product = await Product.findOne({ _id: req.params.id, pharmacist: pharmacist._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Handle category as name or ObjectId
    let categoryId = category;
    if (category && !require('mongoose').Types.ObjectId.isValid(category)) {
      const foundCategory = await Category.findOne({ name: category });
      if (!foundCategory) {
        return res.status(400).json({ message: 'Category not found' });
      }
      categoryId = foundCategory._id;
    }
    // Handle image upload
    if (req.cloudinaryResult) {
      // Delete old image from Cloudinary if exists
      if (product.image && product.image.includes('cloudinary.com')) {
        const { deleteFromCloudinary, getPublicIdFromUrl } = require('../middleware/cloudinaryUpload');
        const publicId = getPublicIdFromUrl(product.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }
      product.image = req.cloudinaryResult.url; // Use the new Cloudinary result format
    }
    if (name !== undefined) product.name = name;
    if (categoryId !== undefined) product.category = categoryId;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (brand !== undefined) product.brand = brand;
    if (discountPercentage !== undefined) product.discountPercentage = discountPercentage;
    await product.save();
    
    const result = {
      ...product.toObject({ virtuals: true }),
      price: Number(product.price) || 0,
      discountPercentage: Number(product.discountPercentage) || 0,
      discountedPrice: product.discountedPrice || Number(product.price) || 0
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const product = await Product.findOneAndDelete({ _id: req.params.id, pharmacist: pharmacist._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addSale = async (req, res) => {
  try {
    const { item, itemType, quantity, price, total, transactionType, customer, supplier } = req.body;
    if (!item || !itemType || !quantity || !price || !total || !transactionType) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    
    // Create a sale with item as a string for now (since we're not linking to actual Medicine/Product documents)
    const sale = new Sale({
      item: item, // This will be stored as a string
      itemType,
      quantity,
      price,
      total,
      transactionType,
      customer: transactionType === 'Customer' ? customer : undefined,
      supplier: transactionType === 'Supplier' ? supplier : undefined,
      pharmacist: pharmacist._id
    });
    await sale.save();
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSales = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const sales = await Sale.find({ pharmacist: pharmacist._id }).sort({ date: -1 }).populate('item');
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    
    const sale = await Sale.findOneAndDelete({ 
      _id: req.params.id, 
      pharmacist: pharmacist._id 
    });
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProductDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountPercentage } = req.body;
    if (discountPercentage < 0 || discountPercentage > 100) {
      return res.status(400).json({ message: 'Discount must be between 0 and 100' });
    }
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const product = await Product.findOneAndUpdate(
      { _id: id, pharmacist: pharmacist._id }, 
      { discountPercentage }, 
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const result = {
      ...product.toObject({ virtuals: true }),
      discountPercentage: product.discountPercentage || 0
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Return the product with virtual fields and consistent price formatting
    const productData = product.toObject({ virtuals: true });
    
    res.json({
      ...productData,
      price: Number(productData.price) || 0,
      discountPercentage: Number(productData.discountPercentage) || 0,
      discountedPrice: productData.discountedPrice || Number(productData.price) || 0
    });
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get pharmacist's assigned orders and unassigned orders
exports.getAssignedOrders = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    // Get both assigned orders and unassigned orders
    const orders = await Order.find({
      $or: [
        { pharmacist: pharmacist._id }, // Orders assigned to this pharmacist
        { pharmacist: null }, // Unassigned orders
        { pharmacist: { $exists: false } } // Orders without pharmacist field
      ]
    })
      .populate('user', 'name email phone')
      .populate('medicines.medicine')
      .populate('products.product')
      .populate('deliveryBoy', 'name phone')
      .populate('pharmacist', 'name') // Populate pharmacist info if assigned
      .sort({ createdAt: -1 });

    // Add a flag to indicate if order is assigned to current pharmacist
    const ordersWithAssignmentFlag = orders.map(order => ({
      ...order.toObject(),
      isAssignedToMe: order.pharmacist && order.pharmacist._id.toString() === pharmacist._id.toString(),
      isUnassigned: !order.pharmacist
    }));

    res.json(ordersWithAssignmentFlag);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    const order = await Order.findOne({ 
      _id: req.params.orderId,
      $or: [
        { pharmacist: pharmacist._id }, // Orders assigned to this pharmacist
        { pharmacist: null }, // Unassigned orders
        { pharmacist: { $exists: false } } // Orders without pharmacist field
      ]
    })
      .populate('user', 'name email phone address city state pincode')
      .populate('medicines.medicine')
      .populate('products.product')
      .populate('deliveryBoy', 'name phone')
      .populate('pharmacist', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Add assignment flags
    const orderWithFlags = {
      ...order.toObject(),
      isAssignedToMe: order.pharmacist && order.pharmacist._id.toString() === pharmacist._id.toString(),
      isUnassigned: !order.pharmacist
    };

    res.json(orderWithFlags);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    const { status, description } = req.body;
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      pharmacist: pharmacist._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' });
    }

    // Restrict status changes if order is delivered or cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Order status cannot be changed after it is delivered or cancelled.' });
    }

    // Enforce one-way status flow: cannot move to a previous status
    const statusOrder = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    const prevIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);
    if (newIndex < prevIndex) {
      return res.status(400).json({ message: 'Order status cannot be reverted to a previous state.' });
    }

    // In updateOrderStatus, before allowing status change to 'out_for_delivery', check if deliveryBoy is assigned
    if (status === 'out_for_delivery' && !order.deliveryBoy) {
      return res.status(400).json({ message: 'Cannot mark as out for delivery: No delivery boy assigned.' });
    }

    // Debug log for status transition
    console.log('Order status transition attempt:', { current: order.status, requested: status });
    // Update order status
    const previousStatus = order.status;
    order.status = status;

    // Update statusTimestamps
    if (!order.statusTimestamps) order.statusTimestamps = {};
    const statusKey = status.toLowerCase().replace(/ /g, '_');
    order.statusTimestamps[statusKey] = new Date();
    
    // Add to statusHistory
    order.statusHistory = order.statusHistory || [];
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      changedBy: { user: req.user.id, role: req.user.role || 'pharmacist' }
    });
    


    // Initialize tracking if it doesn't exist
    if (!order.tracking) {
      order.tracking = { updates: [] };
    }
    if (!order.tracking.updates) {
      order.tracking.updates = [];
    }
    
    // Add tracking update
    order.tracking.updates.push({
      status: status,
      description: description || `Order status updated from ${previousStatus} to ${status} by pharmacist`,
      timestamp: new Date()
    });

    await order.save();

    // Use order.orderNumber for status message
    const statusMessage = `Your order #${order.orderNumber} has been ${status} by the pharmacist.`;

    // Emit Socket.IO event for real-time status update
    if (global.io) {
      // Emit to user
      global.io.to(`user-${order.user}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: status,
        statusTimestamps: order.statusTimestamps,
        statusHistory: order.statusHistory,
        message: statusMessage
      });
      
      // Emit to all pharmacists for order list update
      global.io.to('pharmacists').emit('orderStatusChanged', {
        orderId: order._id,
        status: status,
        pharmacist: pharmacist._id
      });
      
      // Emit to admin when order is accepted/preparing by pharmacist
      if (status === 'accepted' || status === 'preparing') {
        global.io.to('admin-room').emit('orderAccepted', {
          orderId: order._id,
          orderNumber: order.orderNumber || `#${order._id.toString().slice(-6)}`,
          pharmacist: {
            id: pharmacist._id,
            name: pharmacist.personalInfo?.fullName || pharmacist.pharmacyName || 'Pharmacist'
          },
          message: `Order ${order.orderNumber || `#${order._id.toString().slice(-6)}`} has been accepted by pharmacist and is being preparing`
        });
      }
      
      // Only emit to delivery boys when order is preparing (ready for delivery)
      if (status === 'preparing') {
        // Initialize deliveryAssignment if it doesn't exist
        if (!order.deliveryAssignment) {
          order.deliveryAssignment = {
            assignmentStatus: 'assigned',
            availableForAcceptance: true,
            assignedAt: new Date(),
            notificationSent: false
          };
        } else {
          // Assign delivery for preparing order
          order.deliveryAssignment.assignmentStatus = 'assigned';
          order.deliveryAssignment.availableForAcceptance = true;
          order.deliveryAssignment.assignedAt = new Date();
        }
        
        // Save the order with updated delivery assignment
        await order.save();
        global.io.to('delivery-boys').emit('orderReadyForDelivery', {
          orderNumber: order.orderNumber,
          customerInfo: {
            name: order.user?.personalInfo?.fullName || 'Customer',
            phone: order.phone,
            address: order.address
          },
          amount: order.total,
          pharmacist: {
            id: pharmacist._id,
            name: pharmacist.personalInfo?.fullName || pharmacist.pharmacyName || 'Pharmacist',
            pharmacyName: pharmacist.personalInfo?.pharmacyName || pharmacist.pharmacyName || null
          },
          message: `There is a new order from ${pharmacist.personalInfo?.pharmacyName || pharmacist.pharmacyName || pharmacist.personalInfo?.fullName || 'Pharmacist'}`,
          timestamp: new Date(),
          playSound: true, // Flag to trigger sound notification
          priority: 'high', // Priority level for notification
          soundType: 'delivery' // Specific sound type for delivery personnel
        });
      }
    }

    // Create notification for user
    const notification = new UserNotification({
      user: order.user,
      message: statusMessage,
      link: `/orders/${order._id}`,
      isRead: false
    });
    await notification.save();

    res.json({ 
      message: 'Order status updated successfully',
      order: order,
      previousStatus: previousStatus,
      newStatus: status
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get pharmacist notifications
exports.getNotifications = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    const notifications = await Notification.find({
      $or: [
        { assignedTo: req.user.id },
        { user: null, type: 'new_order' }
      ]
    })
      .populate('order')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark notification as read
exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign notification to pharmacist
exports.assignNotification = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { 
        assignedTo: req.user.id,
        status: 'assigned'
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification assigned successfully', notification });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add missing updateDiscount method
exports.updateDiscount = async (req, res) => {
  try {
    const { percentage, validUntil, description } = req.body;
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const discount = await Discount.findOneAndUpdate(
      { _id: req.params.id, pharmacist: pharmacist._id },
      { percentage, validUntil, description },
      { new: true }
    );
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add missing deleteDiscount method
exports.deleteDiscount = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const discount = await Discount.findOneAndDelete({ _id: req.params.id, pharmacist: pharmacist._id });
    if (!discount) return res.status(404).json({ message: 'Discount not found' });
    res.json({ message: 'Discount deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Claim an unassigned order
exports.claimOrder = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      $or: [
        { pharmacist: null },
        { pharmacist: { $exists: false } }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or already assigned' });
    }

    // Assign the order to this pharmacist
    order.pharmacist = pharmacist._id;
    
    // Initialize tracking if it doesn't exist
    if (!order.tracking) {
      order.tracking = { updates: [] };
    }
    if (!order.tracking.updates) {
      order.tracking.updates = [];
    }
    
    // Add tracking update
    order.tracking.updates.push({
      status: order.status,
      description: `Order claimed by pharmacist ${pharmacist.name}`,
      timestamp: new Date()
    });

    await order.save();

    // Emit Socket.IO events for real-time updates
    if (global.io) {
      // Emit to user
      global.io.to(`user-${order.user}`).emit('orderClaimed', {
        orderId: order._id,
        pharmacist: pharmacist.name,
        message: `Your order has been assigned to pharmacist ${pharmacist.name}`
      });
      
      // Emit to all pharmacists to update their order lists
      global.io.to('pharmacists').emit('orderClaimed', {
        orderId: order._id,
        pharmacist: pharmacist._id,
        pharmacistName: pharmacist.name
      });
      
      // Emit to the claiming pharmacist
      global.io.to(`pharmacist-${pharmacist._id}`).emit('orderClaimedByMe', {
        orderId: order._id,
        order: order
      });
    }

    // Create notification for user
    const notification = new UserNotification({
      user: order.user,
      message: `Your order #${order._id.toString().slice(-6)} has been assigned to a pharmacist and is being processed.`,
      link: `/orders/${order._id}`,
      isRead: false
    });
    await notification.save();

    res.json({ 
      message: 'Order claimed successfully',
      order: order
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add missing category management methods
exports.getCategories = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const categories = await Category.find({ pharmacist: pharmacist._id });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const category = new Category({
      name,
      description,
      pharmacist: pharmacist._id
    });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, pharmacist: pharmacist._id },
      { name, description },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const category = await Category.findOneAndDelete({ _id: req.params.id, pharmacist: pharmacist._id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Update pharmacist location and online status
exports.updateLocationAndStatus = async (req, res) => {
  try {
    const { lat, lng, online } = req.body;
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) return res.status(404).json({ message: 'Pharmacist not found' });
    pharmacist.location = { type: 'Point', coordinates: [lng, lat] };
    if (typeof online === 'boolean') pharmacist.online = online;
    await pharmacist.save();
    res.json({ message: 'Location and status updated', pharmacist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get nearby online pharmacists (stores)
exports.getNearbyPharmacists = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });
    const pharmacists = await Pharmacist.find({
      online: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    res.json(pharmacists);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

/**
 * Update pharmacist address and geocode to coordinates
 * POST /api/pharmacist/location
 * Body: { address: string }
 * Requires authentication (pharmacist)
 */
exports.updateLocation = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }
    // Geocode address using OpenStreetMap Nominatim
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await axios.get(url, { headers: { 'User-Agent': 'MediCareApp/1.0' } });
    if (!response.data || response.data.length === 0) {
      return res.status(400).json({ message: 'Unable to geocode address' });
    }
    const { lat, lon } = response.data[0];
    // Update pharmacist
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    pharmacist.address = address;
    pharmacist.location = {
      type: 'Point',
      coordinates: [parseFloat(lon), parseFloat(lat)]
    };
    await pharmacist.save();
    res.json({
      message: 'Location updated',
      address: pharmacist.address,
      location: pharmacist.location
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

exports.getProductsByPharmacist = async (req, res) => {
  try {
    const { pharmacistId } = req.params;
    const { lat, lng } = req.query;
    if (!pharmacistId) return res.status(400).json({ message: 'pharmacistId is required' });
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng are required' });
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
      return res.status(403).json({ message: 'You are too far from this pharmacist to view their products.' });
    }
    const products = await Product.find({ pharmacist: pharmacistId })
      .populate('pharmacist', 'name')
      .populate('category', 'name');
    const result = products.map(prod => ({
      ...prod.toObject({ virtuals: true }),
      discountPercentage: prod.discountPercentage || 0
    }));
    res.json(result);
    } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get similar products based on smart keyword matching
exports.getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;
    
    // Get the current product
    const currentProduct = await Product.findById(id)
      .populate('category', 'name')
      .populate('pharmacist', 'pharmacyName');
    
    if (!currentProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get all products (excluding the current one)
    const allProducts = await Product.find({ _id: { $ne: id } })
      .populate('category', 'name')
      .populate('pharmacist', 'pharmacyName');
    
    // Find similar products using smart matching
    const similarProducts = findSimilarProducts(currentProduct, allProducts, parseInt(limit));
    
    res.json(similarProducts);
  } catch (err) {
    console.error('Error getting similar products:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

 // Get products and medicines from nearby pharmacists
exports.getNearbyProductsAndMedicines = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });
    // Find nearby pharmacists
    const pharmacists = await Pharmacist.find({
      online: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });
    console.log(`[NearbyPharm] Found ${pharmacists.length} online pharmacists near (${lat},${lng})`);
    if (!pharmacists.length) return res.json([]);
    // Fetch products and medicines for each pharmacist
    const results = await Promise.all(pharmacists.map(async (pharmacist) => {
      const products = await Product.find({ pharmacist: pharmacist._id })
        .populate('category', 'name');
      const medicines = await Medicine.find({ pharmacist: pharmacist._id })
        .populate('category', 'name');
      console.log(`[NearbyPharm] Pharmacist ${pharmacist._id} (${pharmacist.pharmacyName}) @ ${JSON.stringify(pharmacist.location.coordinates)}: ${products.length} products, ${medicines.length} medicines`);
      return {
        pharmacist: {
          id: pharmacist._id,
          pharmacyName: pharmacist.pharmacyName,
          address: pharmacist.address,
          location: pharmacist.location,
          online: pharmacist.online
        },
        products: products.map(prod => ({
          ...prod.toObject({ virtuals: true }),
          discountPercentage: prod.discountPercentage || 0
        })),
        medicines: medicines.map(med => ({
          ...med.toObject({ virtuals: true }),
          discountPercentage: med.discountPercentage || 0
        }))
      };
    }));
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// GET all medicines for the logged-in pharmacist
exports.getMedicines = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({ user: req.user.id });
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    const medicines = await Medicine.find({ pharmacist: pharmacist._id })
      .populate('category', 'name');
    const result = medicines.map(med => ({
      ...med.toObject({ virtuals: true }),
      discountPercentage: med.discountPercentage || 0
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

 