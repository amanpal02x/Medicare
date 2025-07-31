import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPriceForDisplay, hasValidDiscount } from '../utils/priceUtils';
import './MobileCategoryList.css';

const CompactItemCard = ({ item, type = 'product' }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Ensure item exists and has required properties
  if (!item || !item._id) {
    return (
      <div className="mobile-compact-card" style={{ opacity: 0.7 }}>
        <div style={{ 
          height: 50, 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: 4,
          background: '#f5f5f5',
          borderRadius: 4,
          color: '#999',
          fontSize: 10
        }}>
          Loading...
        </div>
        <div className="mobile-product-name" style={{ color: '#999' }}>Loading...</div>
        <div className="mobile-product-price" style={{ color: '#999' }}>₹0</div>
        <button className="mobile-add-button" disabled style={{ opacity: 0.5 }}>ADD</button>
      </div>
    );
  }

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
    >
      {/* Image container */}
      <div style={{ 
        height: 50, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 4
      }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name || 'Product'}
            className="mobile-product-image"
            onError={(e) => {
              e.target.src = '/placeholder-medicine.jpg';
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
      <div className="mobile-product-name">
        {item.name || 'Unnamed Product'}
      </div>

      {/* Price */}
      <div className="mobile-product-price">
        {formatPriceForDisplay(price)}
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
        <div className="mobile-product-discount">
          Save {discountPercent}%
        </div>
      )}

      {/* Add to cart button */}
      <button
        className="mobile-add-button"
        onClick={handleAddToCart}
      >
        ADD
      </button>
    </div>
  );
};

export default CompactItemCard; 