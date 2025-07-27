// Utility functions for smart similarity matching

// Common product keywords for better matching
const PRODUCT_KEYWORDS = {
  shampoo: ['shampoo', 'hair', 'wash', 'cleanser', 'conditioner'],
  condom: ['condom', 'protection', 'contraceptive', 'safe'],
  soap: ['soap', 'bath', 'wash', 'cleanser', 'body wash'],
  cream: ['cream', 'lotion', 'moisturizer', 'ointment'],
  tablet: ['tablet', 'pill', 'medicine', 'drug'],
  syrup: ['syrup', 'liquid', 'medicine'],
  powder: ['powder', 'dust', 'granule'],
  oil: ['oil', 'essential', 'massage'],
  gel: ['gel', 'jelly', 'ointment'],
  spray: ['spray', 'mist', 'aerosol'],
  toothpaste: ['toothpaste', 'dental', 'brush', 'oral'],
  deodorant: ['deodorant', 'antiperspirant', 'body spray'],
  sunscreen: ['sunscreen', 'sunblock', 'spf', 'protection'],
  vitamin: ['vitamin', 'supplement', 'nutrient'],
  protein: ['protein', 'supplement', 'powder'],
  omega: ['omega', 'fish oil', 'supplement'],
  calcium: ['calcium', 'mineral', 'supplement'],
  iron: ['iron', 'mineral', 'supplement'],
  zinc: ['zinc', 'mineral', 'supplement'],
  multivitamin: ['multivitamin', 'vitamin', 'supplement']
};

// Brand keywords for better matching
const BRAND_KEYWORDS = {
  'himalaya': ['himalaya', 'himalayan', 'natural'],
  'durex': ['durex', 'protection', 'contraceptive'],
  'manforce': ['manforce', 'protection', 'contraceptive'],
  'kamasutra': ['kamasutra', 'protection', 'contraceptive'],
  'skore': ['skore', 'protection', 'contraceptive'],
  'himalaya': ['himalaya', 'himalayan', 'natural'],
  'patanjali': ['patanjali', 'ayurvedic', 'natural'],
  'dabur': ['dabur', 'ayurvedic', 'natural'],
  'baidyanath': ['baidyanath', 'ayurvedic', 'natural'],
  'vicco': ['vicco', 'ayurvedic', 'natural'],
  'colgate': ['colgate', 'dental', 'oral'],
  'pepsodent': ['pepsodent', 'dental', 'oral'],
  'closeup': ['closeup', 'dental', 'oral'],
  'sunsilk': ['sunsilk', 'hair', 'shampoo'],
  'head & shoulders': ['head', 'shoulders', 'hair', 'shampoo'],
  'dove': ['dove', 'soap', 'bath'],
  'lux': ['lux', 'soap', 'bath'],
  'lifebuoy': ['lifebuoy', 'soap', 'bath'],
  'santoor': ['santoor', 'soap', 'bath'],
  'cinthol': ['cinthol', 'soap', 'bath']
};

// Extract keywords from product name
export const extractKeywords = (productName) => {
  if (!productName) return [];
  
  const name = productName.toLowerCase();
  const keywords = [];
  
  // Extract brand keywords
  for (const [brand, brandKeywords] of Object.entries(BRAND_KEYWORDS)) {
    if (name.includes(brand.toLowerCase())) {
      keywords.push(...brandKeywords);
    }
  }
  
  // Extract product type keywords
  for (const [productType, typeKeywords] of Object.entries(PRODUCT_KEYWORDS)) {
    if (name.includes(productType.toLowerCase())) {
      keywords.push(...typeKeywords);
    }
  }
  
  // Extract common words (3+ characters)
  const words = name.split(/\s+/).filter(word => word.length >= 3);
  keywords.push(...words);
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Calculate similarity score between two products
export const calculateSimilarity = (product1, product2) => {
  const keywords1 = extractKeywords(product1.name);
  const keywords2 = extractKeywords(product2.name);
  
  // Brand similarity (high weight)
  const brand1 = product1.brand?.toLowerCase() || '';
  const brand2 = product2.brand?.toLowerCase() || '';
  const brandMatch = brand1 && brand2 && (brand1 === brand2 || 
    brand1.includes(brand2) || brand2.includes(brand1));
  
  // Category similarity (high weight)
  const categoryMatch = product1.category?._id === product2.category?._id ||
    product1.category === product2.category;
  
  // Subcategory similarity (medium weight)
  const subcategoryMatch = product1.subcategory?.toLowerCase() === product2.subcategory?.toLowerCase();
  
  // Keyword similarity (medium weight)
  const commonKeywords = keywords1.filter(k => keywords2.includes(k));
  const keywordScore = commonKeywords.length / Math.max(keywords1.length, keywords2.length);
  
  // Calculate final score
  let score = 0;
  if (brandMatch) score += 0.4;
  if (categoryMatch) score += 0.3;
  if (subcategoryMatch) score += 0.2;
  score += keywordScore * 0.1;
  
  return score;
};

// Find similar products based on smart matching
export const findSimilarProducts = (currentProduct, allProducts, limit = 8) => {
  if (!currentProduct || !allProducts || allProducts.length === 0) return [];
  
  // Filter out the current product
  const otherProducts = allProducts.filter(p => p._id !== currentProduct._id);
  
  // Calculate similarity scores
  const productsWithScores = otherProducts.map(product => ({
    ...product,
    similarityScore: calculateSimilarity(currentProduct, product)
  }));
  
  // Sort by similarity score (descending) and return top results
  return productsWithScores
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map(product => {
      const { similarityScore, ...productData } = product;
      return productData;
    });
};

// Find similar medicines based on smart matching
export const findSimilarMedicines = (currentMedicine, allMedicines, limit = 8) => {
  if (!currentMedicine || !allMedicines || allMedicines.length === 0) return [];
  
  // Filter out the current medicine
  const otherMedicines = allMedicines.filter(m => m._id !== currentMedicine._id);
  
  // Calculate similarity scores
  const medicinesWithScores = otherMedicines.map(medicine => ({
    ...medicine,
    similarityScore: calculateSimilarity(currentMedicine, medicine)
  }));
  
  // Sort by similarity score (descending) and return top results
  return medicinesWithScores
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map(medicine => {
      const { similarityScore, ...medicineData } = medicine;
      return medicineData;
    });
}; 