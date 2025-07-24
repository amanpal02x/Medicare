module.exports = function(roles = []) {
  if (typeof roles === 'string') roles = [roles];
  return async (req, res, next) => {
    if (!req.user || (roles.length && !roles.includes(req.user.role))) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    // Pharmacist approval check
    if (req.user.role === 'pharmacist') {
      const Pharmacist = require('../models/Pharmacist');
      const pharmacist = await Pharmacist.findOne({ user: req.user.id });
      if (!pharmacist || pharmacist.status !== 'approved') {
        return res.status(403).json({ message: 'Your account is not approved by admin yet.' });
      }
    }
    next();
  };
}; 