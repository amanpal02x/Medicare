import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPriceForDisplay, hasValidDiscount } from '../utils/priceUtils';
import './MobileCategoryList.css';

// Debug CSS import
console.log('CSS imported for CompactItemCard');

const CompactItemCard = ({ item, type = 'product' }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Debug logging
  console.log('CompactItemCard received item:', item);

  // Ensure item has required fields
  if (!item) {
    console.error('CompactItemCard: No item provided');
    return (
      <div className="mobile-compact-card" style={{ border: '2px solid red' }}>
        <div>No Item Data</div>
      </div>
    );
  }

  const basePrice = item.price || 0;
  const discountPercent = item.discountPercentage || 0;
  const discountedPrice = item.discountedPrice || (discountPercent > 0
    ? Math.round((basePrice * (1 - discountPercent / 100)) * 100) / 100
    : basePrice);

  // Debug logging for price calculation
  console.log('Price calculation:', { basePrice, discountPercent, discountedPrice, item });

  const mrp = basePrice;
  const price = discountedPrice;

  const handleCardClick = () => {
    if (type === 'medicine') {
      navigate(`/medicines/${item._id}`);
    } else {
      navigate(`/products/${item._id}`);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(item._id, type, 1);
  };

  return (
    <div 
      className="mobile-compact-card"
      onClick={handleCardClick}
      style={{
        border: '2px solid red', // Temporary debug border
        background: '#fff',
        minHeight: '140px'
      }}
    >
      {/* Image container */}
      <div className="mobile-product-image-container" style={{ 
        height: 50, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 4,
        minHeight: 50,
        border: '1px solid blue' // Temporary debug border
      }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name || 'Product'}
            className="mobile-product-image"
            onError={(e) => {
              console.log('Image failed to load:', item.image);
              e.target.src = '/placeholder-medicine.jpg';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', item.image);
            }}
          />
        ) : (
          <div style={{ 
            width: 60, 
            height: 50, 
            borderRadius: 4, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            fontSize: 10
          }}>
            No Image
          </div>
        )}
      </div>

      {/* Product name */}
      <div className="mobile-product-name" style={{ border: '1px solid green', marginBottom: 4 }}>
        {item.name || 'No Name'}
      </div>

      {/* Price */}
      <div className="mobile-product-price" style={{ border: '1px solid orange', marginBottom: 4 }}>
        {formatPriceForDisplay(price) || 'No Price'}
        {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
          <span style={{ 
            textDecoration: 'line-through', 
            color: '#888', 
            fontSize: 9, 
            marginLeft: 3 
          }}>
            {formatPriceForDisplay(mrp)}
          </span>
        )}
      </div>

      {/* Discount badge */}
      {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
        <div className="mobile-product-discount" style={{ marginBottom: 4 }}>
          Save {discountPercent}%
        </div>
      )}
      
      {/* Debug discount info */}
      <div style={{ fontSize: 8, color: '#999', marginBottom: 4 }}>
        Discount: {discountPercent}% | Valid: {hasValidDiscount({ ...item, discountPercentage: discountPercent }) ? 'Yes' : 'No'}
      </div>

      {/* Add to cart button */}
      <button
        className="mobile-add-button"
        onClick={handleAddToCart}
        style={{ border: '1px solid purple' }}
      >
        ADD
      </button>
    </div>
  );
};

// Debug export
console.log('CompactItemCard component defined:', CompactItemCard);

export default CompactItemCard; 