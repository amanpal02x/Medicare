const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Pharmacist = require('../models/Pharmacist');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicare';

async function fixInvoices() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const invoices = await Invoice.find();
  let updated = 0;
  for (const invoice of invoices) {
    // If pharmacist is a User ObjectId, find the Pharmacist document
    if (invoice.pharmacist && mongoose.Types.ObjectId.isValid(invoice.pharmacist)) {
      const pharmacistDoc = await Pharmacist.findOne({ user: invoice.pharmacist });
      if (pharmacistDoc) {
        invoice.pharmacist = pharmacistDoc._id;
        await invoice.save();
        updated++;
        console.log(`Updated invoice ${invoice._id}: set pharmacist to ${pharmacistDoc._id}`);
      }
    }
  }
  console.log(`Done. Updated ${updated} invoices.`);
  await mongoose.disconnect();
}

fixInvoices().catch(err => {
  console.error('Error fixing invoices:', err);
  process.exit(1);
}); 