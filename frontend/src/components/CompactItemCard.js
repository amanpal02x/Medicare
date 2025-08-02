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
    >
      {/* Image container */}
      <div style={{ 
        height: 60, 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 6
      }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="mobile-product-image"
            onError={(e) => {
              e.target.src = '/placeholder-medicine.jpg';
            }}
          />
        ) : (
          <div style={{ 
            width: 70, 
            height: 60, 
            borderRadius: 8, 
            background: '#f8f9fa', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            fontSize: 11
          }}>
            No Image
          </div>
        )}
      </div>

      {/* Product name */}
      <div className="mobile-category-product-name">
        {item.name}
      </div>

      {/* Price */}
      <div className="mobile-product-price">
        {formatPriceForDisplay(price)}
        {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
          <span style={{ 
            textDecoration: 'line-through', 
            color: '#95a5a6', 
            fontSize: 10, 
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