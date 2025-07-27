/**
 * Utility functions for shuffling arrays and providing random sequences
 */

/**
 * Shuffles an array using the Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - A new shuffled array
 */
export const shuffleArray = (array) => {
  if (!Array.isArray(array)) return [];
  
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Shuffles an array and limits it to a specific number of items
 * @param {Array} array - The array to shuffle
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} - A new shuffled array with limited items
 */
export const shuffleAndLimit = (array, limit = 15) => {
  if (!Array.isArray(array)) return [];
  
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, limit);
};

/**
 * Creates a shuffled version of items with a seed based on current time
 * This ensures different order on each page refresh
 * @param {Array} items - The items to shuffle
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} - A new shuffled array
 */
export const getShuffledItems = (items, limit = 15) => {
  if (!Array.isArray(items)) return [];
  
  // Use current timestamp as a seed for consistent shuffling within the same request
  const timestamp = Date.now();
  const seededItems = items.map((item, index) => ({
    ...item,
    _shuffleIndex: (index + timestamp) % items.length
  }));
  
  // Sort by the shuffle index and then remove it
  const shuffled = seededItems
    .sort((a, b) => a._shuffleIndex - b._shuffleIndex)
    .map(({ _shuffleIndex, ...item }) => item);
  
  return shuffled.slice(0, limit);
};

/**
 * Shuffles multiple arrays and combines them
 * @param {Array} arrays - Array of arrays to shuffle and combine
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} - A new shuffled combined array
 */
export const shuffleAndCombine = (arrays, limit = 15) => {
  if (!Array.isArray(arrays)) return [];
  
  // Flatten all arrays
  const combined = arrays.flat();
  
  // Shuffle the combined array
  return shuffleAndLimit(combined, limit);
};

/**
 * Shuffles items with high discount percentage to the top
 * @param {Array} items - The items to shuffle
 * @param {number} limit - Maximum number of items to return
 * @param {number} minDiscount - Minimum discount percentage to prioritize
 * @returns {Array} - A new shuffled array with high discount items prioritized
 */
export const shuffleWithDiscountPriority = (items, limit = 15, minDiscount = 50) => {
  if (!Array.isArray(items)) return [];
  
  // Separate high discount items from others
  const highDiscountItems = items.filter(item => 
    (item.discountPercentage || 0) >= minDiscount
  );
  const otherItems = items.filter(item => 
    (item.discountPercentage || 0) < minDiscount
  );
  
  // Shuffle both groups
  const shuffledHighDiscount = shuffleArray(highDiscountItems);
  const shuffledOthers = shuffleArray(otherItems);
  
  // Combine with high discount items first
  const combined = [...shuffledHighDiscount, ...shuffledOthers];
  
  return combined.slice(0, limit);
}; 