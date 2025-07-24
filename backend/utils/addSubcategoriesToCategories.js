const mongoose = require('mongoose');
const Category = require('../models/Category');

const categoriesWithSubcategories = [
  {
    name: 'Pet Health',
    subcategories: [
      'Flea & Tick Control',
      'Dewormers',
      'Pain Relief & Anti-inflammatory',
      'Skin & Coat Treatments',
      'Digestive Health',
      'Immune Support',
    ],
  },
  // Add more categories as needed
];

async function addSubcategories() {
  await mongoose.connect('mongodb://localhost:27017/medicare', { useNewUrlParser: true, useUnifiedTopology: true });
  for (const cat of categoriesWithSubcategories) {
    const category = await Category.findOne({ name: cat.name });
    if (category) {
      category.subcategories = cat.subcategories;
      await category.save();
      console.log(`Updated ${cat.name} with subcategories.`);
    } else {
      console.log(`Category ${cat.name} not found.`);
    }
  }
  await mongoose.disconnect();
  console.log('Done.');
}

addSubcategories(); 