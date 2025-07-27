# Shuffle Feature Documentation

## Overview

The shuffle feature automatically changes the sequence of items displayed on various pages when users refresh the page. This provides a dynamic user experience and ensures users see different items in different orders on each visit.

## Implementation

### Files Modified

1. **`frontend/src/utils/shuffleUtils.js`** - New utility functions for shuffling arrays
2. **`frontend/src/pages/LandingPage.js`** - Updated to shuffle items in all sections
3. **`frontend/src/pages/ProductDetail.js`** - Updated to shuffle similar products
4. **`frontend/src/pages/MedicineDetail.js`** - Updated to shuffle similar medicines
5. **`frontend/src/pages/Medicines.js`** - Updated to shuffle medicine listings
6. **`frontend/src/pages/Search.js`** - Updated to shuffle search results

### Utility Functions

#### `shuffleArray(array)`

- Shuffles an array using the Fisher-Yates algorithm
- Returns a new shuffled array without modifying the original
- Handles edge cases (null, undefined, non-arrays)

#### `getShuffledItems(items, limit = 15)`

- Creates a shuffled version of items with a seed based on current time
- Ensures different order on each page refresh
- Limits the number of items returned
- Perfect for displaying random sequences on pages

#### `shuffleWithDiscountPriority(items, limit = 15, minDiscount = 50)`

- Shuffles items with high discount percentage to the top
- Maintains randomness within discount groups
- Useful for "Deal You Love" sections

#### `shuffleAndLimit(array, limit = 15)`

- Combines shuffling and limiting in one function
- Simple utility for basic shuffling needs

#### `shuffleAndCombine(arrays, limit = 15)`

- Shuffles multiple arrays and combines them
- Useful when you have separate arrays that need to be merged and shuffled

## Pages with Shuffle Feature

### Landing Page (`/`)

- **Deal of the Day**: Items shuffled on each refresh
- **Medicines Section**: Medicine items shuffled
- **Products Section**: Product items shuffled
- **Deal You Love**: Items with high discounts prioritized and shuffled

### Product Detail Page (`/products/:id`)

- **Similar Products**: Related products shuffled on each visit

### Medicine Detail Page (`/medicines/:id`)

- **Similar Medicines**: Related medicines shuffled on each visit

### Medicines Page (`/medicines`)

- **All Medicines**: Complete medicine listings shuffled

### Search Page (`/search`)

- **Search Results**: All search results shuffled for variety

## Technical Details

### How It Works

1. **Time-based Seeding**: Each shuffle operation uses the current timestamp as a seed
2. **Consistent Shuffling**: Within the same page load, shuffling is consistent
3. **Different on Refresh**: Each page refresh produces a different order
4. **Performance Optimized**: Shuffling happens only when data is displayed

### Benefits

- **User Engagement**: Users see different items on each visit
- **Fair Exposure**: All items get equal visibility over time
- **Discovery**: Users discover items they might not see otherwise
- **Fresh Experience**: Each page visit feels unique

### Usage Example

```javascript
import { getShuffledItems } from "../utils/shuffleUtils";

// In a component
const shuffledProducts = getShuffledItems(products, 15);

// Render shuffled items
{
  shuffledProducts.map((product) => (
    <ItemCard key={product._id} item={product} type="product" />
  ));
}
```

## Testing

A test file `shuffleUtils.test.js` is included to verify:

- All items are preserved during shuffling
- Different calls produce different orders
- Limits are respected
- Discount priority works correctly

Run tests with:

```bash
node frontend/src/utils/shuffleUtils.test.js
```

## Future Enhancements

1. **User Preference**: Allow users to disable shuffling
2. **Smart Shuffling**: Consider user behavior and preferences
3. **Category-based Shuffling**: Different shuffle strategies for different categories
4. **Performance Monitoring**: Track shuffle performance and user engagement
