const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const InviteToken = require('../models/InviteToken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, inviteToken } = req.body;
    // For pharmacist and deliveryBoy, require invite token
    if (['pharmacist', 'deliveryBoy'].includes(role)) {
      if (!inviteToken) {
        return res.status(400).json({ message: 'Invite token required for this role' });
      }
      const tokenDoc = await InviteToken.findOne({ token: inviteToken, role, status: 'unused' });
      if (!tokenDoc) {
        return res.status(400).json({ message: 'Invalid or already used invite token' });
      }
      if (tokenDoc.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invite token expired' });
      }
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    // If pharmacist, create Pharmacist document
    if (role === 'pharmacist') {
      const Pharmacist = require('../models/Pharmacist');
      const pharmacist = await Pharmacist.create({
        user: user._id,
        pharmacyName: '',
        address: '',
        contact: '',
        kycDocs: [],
        timings: '',
        status: 'pending',
        isVerified: false
      });
    }
    // If deliveryBoy, create DeliveryBoy document
    if (role === 'deliveryBoy') {
      const DeliveryBoy = require('../models/DeliveryBoy');
      const deliveryBoy = await DeliveryBoy.create({
        user: user._id,
        personalInfo: {
          fullName: name,
          phone: '',
          email: email,
          dateOfBirth: new Date(),
          gender: '',
          address: {}
        },
        vehicleInfo: {}
      });
    }
    // Mark invite token as used
    if (['pharmacist', 'deliveryBoy'].includes(role) && inviteToken) {
      await InviteToken.findOneAndUpdate(
        { token: inviteToken },
        { status: 'used', usedBy: user._id, usedAt: new Date() }
      );
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Set token as HttpOnly cookie
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    // Pharmacist approval check
    if (user.role === 'pharmacist') {
      const Pharmacist = require('../models/Pharmacist');
      const pharmacist = await Pharmacist.findOne({ user: user._id });
      if (!pharmacist || pharmacist.status !== 'approved') {
        return res.status(403).json({ message: 'Your account is not approved by admin yet. Please wait for approval.' });
      }
    }
    
    // Delivery boy approval check
    if (user.role === 'deliveryBoy') {
      const DeliveryBoy = require('../models/DeliveryBoy');
      const deliveryBoy = await DeliveryBoy.findOne({ user: user._id });
      if (!deliveryBoy || deliveryBoy.status !== 'active') {
        return res.status(403).json({ message: 'Your account is not approved by admin yet. Please wait for approval.' });
      }
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    // Set token as HttpOnly cookie
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, address, city, state, pincode, phone, addresses } = req.body;
    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (email) user.email = email;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;
    if (phone !== undefined) user.phone = phone;
    if (addresses !== undefined) user.addresses = addresses;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Address Management ---
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    res.json({ addresses: user.addresses || [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { address, city, state, pincode, phone, isDefault } = req.body;
    
    // Validate required fields
    if (!address || !city || !state || !pincode || !phone) {
      return res.status(400).json({ 
        message: 'All address fields are required',
        missing: {
          address: !address,
          city: !city,
          state: !state,
          pincode: !pincode,
          phone: !phone
        }
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize addresses array if it doesn't exist
    if (!user.addresses) {
      user.addresses = [];
    }
    
    // If this is the first address or isDefault is true, set it as default
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    const newAddress = {
      address,
      city,
      state,
      pincode,
      phone,
      isDefault: isDefault || user.addresses.length === 0
    };
    
    user.addresses.push(newAddress);
    await user.save();
    
    res.json({ 
      message: 'Address added successfully', 
      addresses: user.addresses,
      addedAddress: newAddress
    });
  } catch (err) {
    console.error('Error adding address:', err);
    res.status(500).json({ 
      message: 'Server error while adding address',
      error: err.message 
    });
  }
};

exports.removeAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
    await user.save();
    res.json({ message: 'Address removed', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
}; 

exports.verifyInviteToken = async (req, res) => {
  try {
    const { role, token } = req.query;
    if (!role || !token) return res.status(400).json({ valid: false, message: 'Role and token required' });
    const tokenDoc = await InviteToken.findOne({ token, role, status: 'unused' });
    if (!tokenDoc) return res.json({ valid: false, message: 'Invalid or already used invite token' });
    if (tokenDoc.expiresAt < new Date()) return res.json({ valid: false, message: 'Invite token expired' });
    return res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ valid: false, message: 'Server error' });
  }
}; 