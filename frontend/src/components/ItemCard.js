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

  // Debug logging
  console.log('ItemCard rendering:', {
    itemId: item?._id,
    itemName: item?.name,
    itemPrice: item?.price,
    itemImage: item?.image,
    type,
    isMobile
  });

  // Validate item data
  if (!item || !item._id) {
    console.error('ItemCard: Invalid item data:', item);
    return (
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 10 : 14,
        boxShadow: '0 2px 10px rgba(25,118,210,0.06)',
        padding: isMobile ? 12 : 16,
        minWidth: isMobile ? 140 : 180,
        maxWidth: isMobile ? 160 : 210,
        height: isMobile ? 220 : 270,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: isMobile ? 12 : 14
      }}>
        Invalid Product Data
      </div>
    );
  }

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
        borderRadius: isMobile ? 10 : 14,
        boxShadow: '0 2px 10px rgba(25,118,210,0.06)',
        padding: isMobile ? 12 : 16,  // Fixed: Increased mobile padding from 10 to 12
        minWidth: isMobile ? 140 : 180,  // Fixed: Increased mobile minWidth from 140 to 140 (kept same)
        maxWidth: isMobile ? 160 : 210,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: isMobile ? '0 2px' : '0 6px',  // Fixed: Reduced mobile margin from 4px to 2px
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
        height: isMobile ? 220 : 270,  // Fixed: Increased mobile height from 200 to 220
        justifyContent: 'flex-start',
        border: '2px solid #ff0000',  // Temporary: Red border for debugging
        position: 'relative',  // Temporary: Ensure positioning
        zIndex: 1  // Temporary: Ensure visibility
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(25,118,210,0.13)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(25,118,210,0.06)';
      }}
    >
      {/* Countdown timer for deals */}
      {countdown}
      {/* Image container with reduced height for mobile */}
      <div style={{ 
        height: isMobile ? 70 : 90,  // Fixed: Increased mobile height from 60 to 70
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: isMobile ? 8 : 10  // Fixed: Increased mobile margin from 6 to 8
      }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ 
              maxWidth: isMobile ? 90 : 120,  // Fixed: Increased mobile maxWidth from 80 to 90
              maxHeight: isMobile ? 70 : 90,  // Fixed: Increased mobile maxHeight from 60 to 70
              borderRadius: isMobile ? 6 : 8, 
              objectFit: 'contain' 
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
            width: isMobile ? 90 : 120,  // Fixed: Increased mobile width from 80 to 90
            height: isMobile ? 70 : 90,  // Fixed: Increased mobile height from 60 to 70
            borderRadius: isMobile ? 6 : 8, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#999',
            fontSize: isMobile ? 10 : 12
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
          fontSize: isMobile ? 13 : 15,  // Fixed: Increased mobile fontSize from 12 to 13
          marginBottom: isMobile ? 4 : 6, 
          minHeight: isMobile ? 28 : 32,  // Fixed: Increased mobile minHeight from 24 to 28
          maxHeight: isMobile ? 28 : 32,  // Fixed: Increased mobile maxHeight from 24 to 28
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          lineHeight: isMobile ? 1.2 : 1.4
        }}>
          {item.name}
        </div>
        <div style={{ 
          fontSize: isMobile ? 14 : 15,  // Fixed: Increased mobile fontSize from 13 to 14
          color: '#1976d2', 
          fontWeight: 600, 
          marginBottom: isMobile ? 2 : 2  // Fixed: Increased mobile margin from 1 to 2
        }}>
          {formatPriceForDisplay(price)}
          {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
            <span style={{ 
              textDecoration: 'line-through', 
              color: '#888', 
              fontSize: isMobile ? 11 : 12,  // Fixed: Increased mobile fontSize from 10 to 11
              marginLeft: isMobile ? 4 : 6 
            }}>
              {formatPriceForDisplay(mrp)}
            </span>
          )}
        </div>
        {hasValidDiscount({ ...item, discountPercentage: discountPercent }) && (
          <div style={{ 
            color: '#e53935', 
            fontWeight: 500, 
            fontSize: isMobile ? 11 : 12,  // Fixed: Increased mobile fontSize from 10 to 11
            marginBottom: isMobile ? 4 : 6 
          }}>
            Save {discountPercent}%
          </div>
        )}
        <button
          style={{
            background: '#19b6c9',
            color: '#fff',
            border: 'none',
            borderRadius: isMobile ? 4 : 5,
            padding: isMobile ? '6px 0' : '7px 0',  // Fixed: Increased mobile padding from 5px to 6px
            fontWeight: 600,
            fontSize: isMobile ? 12 : 14,  // Fixed: Increased mobile fontSize from 11 to 12
            width: '100%',
            marginTop: isMobile ? 4 : 6,
            cursor: 'pointer',
            marginBottom: 0,
            letterSpacing: 0.5,
            boxShadow: '0 1px 4px rgba(25,118,210,0.08)'
          }}
          onClick={handleAddToCart}
        >
          {isMobile ? 'ADD' : 'ADD TO CART'}
        </button>
      </div>
    </div>
  );
};

export default ItemCard; 