import React from 'react';
import './CartItem.css';
import { getEffectivePrice, formatPriceForDisplay, hasValidDiscount } from '../utils/priceUtils';
import useDeviceDetection from '../hooks/useDeviceDetection';

const CartItem = ({ 
  item, 
  onQuantityChange, 
  onRemove, 
  isUpdating = false,
  showActions = true 
}) => {
  const { isMobile } = useDeviceDetection();
  const price = getEffectivePrice(item.item);
  const itemTotal = price * item.quantity;
  const originalPrice = item.item.price || 0;
  const discountPercentage = item.item.discountPercentage || 0;
  const discountAmount = originalPrice - price;

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="mobile-cart-item">
        {/* Product Image */}
        <div className="mobile-cart-item-image">
          <img 
            src={item.item.image || '/placeholder-medicine.jpg'} 
            alt={item.item.name}
            onError={(e) => {
              e.target.src = '/placeholder-medicine.jpg';
            }}
          />
        </div>

        {/* Product Details */}
        <div className="mobile-cart-item-details">
          <div className="mobile-cart-item-name">
            {item.item.name}
          </div>
          <div className="mobile-cart-item-specs">
            {item.item.color && `${item.item.color}, `}
            {item.item.specifications || item.item.description?.substring(0, 50) || `${item.itemType === 'medicine' ? 'Medicine' : 'Product'}`}
          </div>

          {/* Pricing Section */}
          <div className="mobile-cart-item-pricing">
            <div className="mobile-cart-item-price">
              <span className="mobile-current-price">{formatPriceForDisplay(price)}</span>
              {hasValidDiscount(item.item) && (
                <>
                  <span className="mobile-original-price">{formatPriceForDisplay(originalPrice)}</span>
                  <span className="mobile-discount-badge">{Math.round(discountPercentage)}% off</span>
                </>
              )}
            </div>

            {/* Alternative Payment Option */}
            {hasValidDiscount(item.item) && (
              <div className="mobile-alternative-payment">
                <span>Or Pay {formatPriceForDisplay(price - 100)} + ⚡ 100</span>
              </div>
            )}
          </div>
        </div>

        {/* Quantity Selector */}
        {showActions && (
          <div className="mobile-cart-item-quantity">
            <div className="mobile-quantity-controls">
              <button
                className="mobile-quantity-btn"
                onClick={() => onQuantityChange(item.item._id, item.itemType, item.quantity - 1)}
                disabled={item.quantity <= 1 || isUpdating}
              >
                -
              </button>
              <span className="mobile-quantity-display">
                {isUpdating ? '...' : item.quantity}
              </span>
              <button
                className="mobile-quantity-btn"
                onClick={() => onQuantityChange(item.item._id, item.itemType, item.quantity + 1)}
                disabled={isUpdating}
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Layout (existing code)
  return (
    <div className="cart-item-component">
      <div className="item-info">
        <div className="item-image">
          <img 
            src={item.item.image || '/placeholder-medicine.jpg'} 
            alt={item.item.name}
            onError={(e) => {
              e.target.src = '/placeholder-medicine.jpg';
            }}
          />
        </div>
        <div className="item-details">
          <h3>{item.item.name}</h3>
          <p className="item-category">
            {item.itemType === 'medicine' ? 'Medicine' : 'Product'}
          </p>
          {item.item.description && (
            <p className="item-description">
              {item.item.description.substring(0, 100)}
              {item.item.description.length > 100 ? '...' : ''}
            </p>
          )}
        </div>
      </div>
      
      <div className="item-price">
        <span className="price-amount">{formatPriceForDisplay(price)}</span>
        {hasValidDiscount(item.item) && (
          <span className="original-price">{formatPriceForDisplay(item.item.price)}</span>
        )}
      </div>
      
      {showActions && (
        <div className="item-quantity">
          <div className="quantity-controls">
            <button
              className="quantity-btn"
              onClick={() => onQuantityChange(item.item._id, item.itemType, item.quantity - 1)}
              disabled={item.quantity <= 1 || isUpdating}
            >
              -
            </button>
            <span className="quantity-display">
              {isUpdating ? '...' : item.quantity}
            </span>
            <button
              className="quantity-btn"
              onClick={() => onQuantityChange(item.item._id, item.itemType, item.quantity + 1)}
              disabled={isUpdating}
            >
              +
            </button>
          </div>
        </div>
      )}
      
      <div className="item-total">
        <span className="total-amount">{formatPriceForDisplay(itemTotal)}</span>
      </div>
      
      {showActions && (
        <div className="item-action">
          <button
            className="remove-btn"
            onClick={() => onRemove(item.item._id, item.itemType)}
            disabled={isUpdating}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

export default CartItem; 