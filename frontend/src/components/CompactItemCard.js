import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPriceForDisplay, hasValidDiscount } from '../utils/priceUtils';
import './MobileCategoryList.css';

const CompactItemCard = ({ item, type = 'product' }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const basePrice = item.price || 0;
  const discountPercent = item.discountPercentage || 0;
  const discountedPrice = item.discountedPrice || (discountPercent > 0
    ? Math.round((basePrice * (1 - discountPercent / 100)) * 100) / 100
    : basePrice);

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
        background: '#fff',
        borderRadius: 10,
        boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
        padding: 12,
        height: 180, // Increased height for better content display
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        border: '1px solid #f0f0f0',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.12)';
      }}
    >
      {/* Image container with improved sizing */}
      <div style={{ 
        height: 70, // Increased height for better image visibility
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 8 // Increased margin for better spacing
      }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="mobile-product-image"
            style={{
              maxWidth: 80, // Increased max width
              maxHeight: 70, // Increased max height
              borderRadius: 6,
              objectFit: 'contain',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)' // Added shadow for better visibility
            }}
            onError={(e) => {
              e.target.src = '/placeholder-medicine.jpg';
            }}
          />
        ) : (
          <div style={{ 
            width: 80, // Increased width
            height: 70, // Increased height
            borderRadius: 6, 
            background: '#f8f9fa', // Improved background color
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            fontSize: 11, // Increased font size
            border: '1px dashed #ddd' // Added border for better visibility
          }}>
            No Image
          </div>
        )}
      </div>

      {/* Product name with improved styling */}
      <div 
        className="mobile-product-name"
        style={{
          fontWeight: 600,
          fontSize: 12, // Increased font size for better readability
          minHeight: 32, // Increased height for better text display
          maxHeight: 32,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.3, // Improved line height
          color: '#333', // Ensured good contrast
          textAlign: 'center',
          marginBottom: 4 // Added margin for better spacing
        }}
      >
        {item.name}
      </div>

      {/* Price with improved styling */}
      <div 
        className="mobile-product-price"
        style={{
          fontSize: 13, // Increased font size for better visibility
          color: '#1976d2',
          fontWeight: 700, // Made price bolder
          marginBottom: 2 // Added margin for better spacing
        }}
      >
        {formatPriceForDisplay(price)}
        {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
          <span style={{ 
            textDecoration: 'line-through', 
            color: '#888', 
            fontSize: 10, // Increased font size
            marginLeft: 4,
            fontWeight: 400 // Made original price less bold
          }}>
            {formatPriceForDisplay(mrp)}
          </span>
        )}
      </div>

      {/* Discount badge with improved styling */}
      {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
        <div 
          className="mobile-product-discount"
          style={{
            color: '#e53935',
            fontWeight: 600, // Made discount text bolder
            fontSize: 10, // Increased font size
            marginBottom: 4 // Added margin for better spacing
          }}
        >
          Save {discountPercent}%
        </div>
      )}

      {/* Add to cart button with improved styling */}
      <button
        className="mobile-add-button"
        onClick={handleAddToCart}
        style={{
          background: '#19b6c9',
          color: '#fff',
          border: 'none',
          borderRadius: 5, // Increased border radius
          padding: '6px 0', // Increased padding
          fontWeight: 600,
          fontSize: 11, // Increased font size
          width: '100%',
          cursor: 'pointer',
          letterSpacing: 0.3,
          boxShadow: '0 2px 6px rgba(25,118,210,0.15)', // Enhanced shadow
          transition: 'all 0.2s ease' // Added transition
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#16a5b8';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#19b6c9';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        ADD
      </button>
    </div>
  );
};

export default CompactItemCard; 