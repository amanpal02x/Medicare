/**
 * Utility functions for consistent price handling across the application
 */

/**
 * Format a price value to ensure it's a valid number
 * @param {any} price - The price value to format
 * @returns {number} - The formatted price as a number
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return 0;
  const numPrice = Number(price);
  return isNaN(numPrice) ? 0 : numPrice;
};

/**
 * Calculate discounted price based on original price and discount percentage
 * @param {number} originalPrice - The original price
 * @param {number} discountPercentage - The discount percentage (0-100)
 * @returns {number} - The discounted price
 */
export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  const price = formatPrice(originalPrice);
  const discount = formatPrice(discountPercentage);
  
  if (discount <= 0) return price;
  if (discount >= 100) return 0;
  
  return Math.round((price * (1 - discount / 100)) * 100) / 100;
};

/**
 * Format price data for consistent display
 * @param {Object} item - The item with price data
 * @returns {Object} - The item with formatted price data
 */
export const formatItemPriceData = (item) => {
  if (!item) return null;
  
  const price = formatPrice(item.price);
  const discountPercentage = formatPrice(item.discountPercentage);
  const discountedPrice = item.discountedPrice ? formatPrice(item.discountedPrice) : calculateDiscountedPrice(price, discountPercentage);
  
  // Debug logging
  console.log('formatItemPriceData - Input:', {
    price: item.price,
    discountPercentage: item.discountPercentage,
    discountedPrice: item.discountedPrice
  });
  
  console.log('formatItemPriceData - Output:', {
    price,
    discountPercentage,
    discountedPrice
  });
  
  return {
    ...item,
    price,
    discountPercentage,
    discountedPrice
  };
};

/**
 * Format price for display with Indian currency format
 * @param {number} price - The price to format
 * @returns {string} - The formatted price string
 */
export const formatPriceForDisplay = (price) => {
  const numPrice = formatPrice(price);
  // Format with 2 decimal places and proper Indian currency format
  return `₹${numPrice.toFixed(2)}`;
};

/**
 * Get the effective price for an item (discounted if available, otherwise original)
 * @param {Object} item - The item with price data
 * @returns {number} - The effective price
 */
export const getEffectivePrice = (item) => {
  if (!item) return 0;
  
  // Use discountedPrice if it exists and is less than original price
  if (item.discountedPrice && item.discountedPrice < item.price) {
    return formatPrice(item.discountedPrice);
  }
  
  return formatPrice(item.price);
};

/**
 * Check if an item has a valid discount
 * @param {Object} item - The item to check
 * @returns {boolean} - True if item has a valid discount
 */
export const hasValidDiscount = (item) => {
  if (!item) return false;
  
  const discountPercentage = formatPrice(item.discountPercentage);
  return discountPercentage > 0 && discountPercentage < 100;
}; 