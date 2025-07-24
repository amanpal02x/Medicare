import React from 'react';
import './CartItem.css';

const CartItem = ({ 
  item, 
  onQuantityChange, 
  onRemove, 
  isUpdating = false,
  showActions = true 
}) => {
  const price = item.item.discountedPrice || item.item.price || 0;
  const itemTotal = price * item.quantity;

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
        <span className="price-amount">₹{price.toFixed(2)}</span>
        {item.item.discountedPrice && item.item.discountedPrice < item.item.price && (
          <span className="original-price">₹{item.item.price.toFixed(2)}</span>
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
        <span className="total-amount">₹{itemTotal.toFixed(2)}</span>
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