import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CountdownTimer from './CountdownTimer';
import { formatItemPriceData, formatPriceForDisplay, getEffectivePrice, hasValidDiscount } from '../utils/priceUtils';
import useDeviceDetection from '../hooks/useDeviceDetection';

const ItemCard = ({ item, type = 'product', dealDiscount, dealEndTime }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { isMobile } = useDeviceDetection();

  // Use backend's discountedPrice if available, otherwise calculate
  const basePrice = item.price || 0;
  const discountPercent = typeof dealDiscount === 'number' && dealDiscount > 0
    ? dealDiscount
    : item.discountPercentage || 0;
  
  // Use backend's discountedPrice if available, otherwise calculate
  const discountedPrice = item.discountedPrice || (discountPercent > 0
    ? Math.round((basePrice * (1 - discountPercent / 100)) * 100) / 100
    : basePrice);

  const mrp = basePrice;
  const price = getEffectivePrice({ ...item, discountedPrice });

  // Calculate remaining time for countdown if dealEndTime is provided
  let countdown = null;
  if (dealEndTime) {
    const end = new Date(dealEndTime);
    const now = new Date();
    const remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
    countdown = (
      <div style={{ marginBottom: isMobile ? 4 : 6 }}>
        <CountdownTimer remainingTime={remainingSeconds} />
      </div>
    );
  }

  const handleCardClick = () => {
    if (type === 'medicine') {
      navigate(`/medicines/${item._id}`);
    } else {
      navigate(`/products/${item._id}`);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent card click when clicking the button
    addToCart(item._id, type, 1);
  };

  return (
    <div 
      style={{
        background: '#fff',
        borderRadius: isMobile ? 12 : 14,
        boxShadow: isMobile ? '0 3px 12px rgba(25,118,210,0.1)' : '0 2px 10px rgba(25,118,210,0.06)',
        padding: isMobile ? 16 : 16,  // Increased mobile padding for better spacing
        minWidth: isMobile ? 160 : 180,  // Increased mobile minWidth for better visibility
        maxWidth: isMobile ? 180 : 210,  // Increased mobile maxWidth
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: isMobile ? '0 4px' : '0 6px',  // Increased mobile margin for better spacing
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
        height: isMobile ? 260 : 270,  // Increased mobile height for better content display
        justifyContent: 'flex-start',
        border: isMobile ? '1px solid #f0f0f0' : 'none',  // Added border for mobile for better definition
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(25,118,210,0.13)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = isMobile ? '0 3px 12px rgba(25,118,210,0.1)' : '0 2px 10px rgba(25,118,210,0.06)';
      }}
    >
      {/* Countdown timer for deals */}
      {countdown}
      {/* Image container with improved height for mobile */}
      <div style={{ 
        height: isMobile ? 90 : 90,  // Increased mobile height for better image visibility
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: isMobile ? 12 : 10  // Increased mobile margin for better spacing
      }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ 
              maxWidth: isMobile ? 110 : 120,  // Increased mobile maxWidth for better image visibility
              maxHeight: isMobile ? 90 : 90,  // Increased mobile maxHeight
              borderRadius: isMobile ? 8 : 8, 
              objectFit: 'contain',
              boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'  // Added shadow for mobile images
            }}
            onError={(e) => {
              console.log('Image failed to load:', item.image, 'for item:', item.name);
              e.target.src = '/placeholder-medicine.jpg';
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', item.image, 'for item:', item.name);
            }}
          />
        ) : (
          <div style={{ 
            width: isMobile ? 110 : 120,  // Increased mobile width
            height: isMobile ? 90 : 90,  // Increased mobile height
            borderRadius: isMobile ? 8 : 8, 
            background: '#f8f9fa',  // Improved background color
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            fontSize: isMobile ? 12 : 12,  // Increased mobile font size
            border: '1px dashed #ddd'  // Added border for better visibility
          }}>
            No Image
          </div>
        )}
      </div>
      {/* Spacer to push name/price/discount to the bottom */}
      <div style={{ flex: 1 }} />
      {/* Name/title, price, and discount at the bottom */}
      <div style={{ width: '100%' }}>
        <div style={{ 
          fontWeight: 600, 
          fontSize: isMobile ? 14 : 15,  // Increased mobile fontSize for better readability
          marginBottom: isMobile ? 6 : 6, 
          minHeight: isMobile ? 32 : 32,  // Increased mobile minHeight for better text display
          maxHeight: isMobile ? 32 : 32,  // Increased mobile maxHeight
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          lineHeight: isMobile ? 1.3 : 1.4,  // Improved line height for mobile
          color: '#333'  // Ensured good contrast
        }}>
          {item.name}
        </div>
        <div style={{ 
          fontSize: isMobile ? 15 : 15,  // Increased mobile fontSize for better price visibility
          color: '#1976d2', 
          fontWeight: 700,  // Made price bolder
          marginBottom: isMobile ? 4 : 2  // Increased mobile margin
        }}>
          {formatPriceForDisplay(price)}
          {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
            <span style={{ 
              textDecoration: 'line-through', 
              color: '#888', 
              fontSize: isMobile ? 12 : 12,  // Increased mobile fontSize
              marginLeft: isMobile ? 6 : 6,
              fontWeight: 400  // Made original price less bold
            }}>
              {formatPriceForDisplay(mrp)}
            </span>
          )}
        </div>
        {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
          <div style={{ 
            color: '#e53935', 
            fontWeight: 600,  // Made discount text bolder
            fontSize: isMobile ? 12 : 12,  // Increased mobile fontSize
            marginBottom: isMobile ? 6 : 6  // Increased mobile margin
          }}>
            Save {discountPercent}%
          </div>
        )}
        <button
          style={{
            background: '#19b6c9',
            color: '#fff',
            border: 'none',
            borderRadius: isMobile ? 6 : 5,  // Increased mobile border radius
            padding: isMobile ? '8px 0' : '7px 0',  // Increased mobile padding
            fontWeight: 600,
            fontSize: isMobile ? 13 : 14,  // Increased mobile fontSize
            width: '100%',
            marginTop: isMobile ? 6 : 6,  // Increased mobile margin
            cursor: 'pointer',
            marginBottom: 0,
            letterSpacing: 0.5,
            boxShadow: isMobile ? '0 2px 6px rgba(25,118,210,0.15)' : '0 1px 4px rgba(25,118,210,0.08)',  // Enhanced shadow for mobile
            transition: 'all 0.2s ease'  // Added transition for better interaction
          }}
          onClick={handleAddToCart}
          onMouseEnter={(e) => {
            if (!isMobile) {
              e.target.style.background = '#16a5b8';
              e.target.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isMobile) {
              e.target.style.background = '#19b6c9';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {isMobile ? 'ADD' : 'ADD TO CART'}
        </button>
      </div>
    </div>
  );
};

export default ItemCard; 