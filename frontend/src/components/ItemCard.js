import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CountdownTimer from './CountdownTimer';

const ItemCard = ({ item, type = 'product', dealDiscount, dealEndTime }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Determine base price and discount
  const basePrice = item.price || 0;
  // If dealDiscount is provided, use it; otherwise use item's own discountPercentage
  const discountPercent =
    typeof dealDiscount === 'number' && dealDiscount > 0
      ? dealDiscount
      : item.discountPercentage || 0;
  const discountedPrice = discountPercent > 0
    ? Math.round((basePrice * (1 - discountPercent / 100))*100)/100
    : basePrice;

  const mrp = basePrice;
  const price = discountedPrice;

  // Calculate remaining time for countdown if dealEndTime is provided
  let countdown = null;
  if (dealEndTime) {
    const end = new Date(dealEndTime);
    const now = new Date();
    const remainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
    countdown = (
      <div style={{ marginBottom: 6 }}>
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
        borderRadius: 14,
        boxShadow: '0 2px 10px rgba(25,118,210,0.06)',
        padding: 16,
        minWidth: 180,
        maxWidth: 210,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 6px',
        cursor: 'pointer',
        transition: 'transform 0.18s, box-shadow 0.18s',
        height: 270, // reduced height
        justifyContent: 'flex-start',
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
      {/* Image container with increased height */}
      <div style={{ height: 90, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        {item.image && (
          <img
            src={`${process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com'}${item.image}`}
            alt={item.name}
            style={{ maxWidth: 120, maxHeight: 90, borderRadius: 8, objectFit: 'contain' }}
          />
        )}
      </div>
      {/* Spacer to push name/price/discount to the bottom */}
      <div style={{ flex: 1 }} />
      {/* Name/title, price, and discount at the bottom */}
      <div style={{ width: '100%' }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, minHeight: 32, maxHeight: 32, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.name}</div>
        <div style={{ fontSize: 15, color: '#1976d2', fontWeight: 600, marginBottom: 2 }}>
          Rs.{price.toLocaleString('en-IN')}
          {discountPercent > 0 && (
            <span style={{ textDecoration: 'line-through', color: '#888', fontSize: 12, marginLeft: 6 }}>
              Rs.{mrp.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {discountPercent > 0 && (
          <div style={{ color: '#e53935', fontWeight: 500, fontSize: 12, marginBottom: 6 }}>Save {discountPercent}%</div>
        )}
        <button
          style={{
            background: '#19b6c9',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            padding: '7px 0',
            fontWeight: 600,
            fontSize: 14,
            width: '100%',
            marginTop: 6,
            cursor: 'pointer',
            marginBottom: 0,
            letterSpacing: 0.5,
            boxShadow: '0 1px 4px rgba(25,118,210,0.08)'
          }}
          onClick={handleAddToCart}
        >
          ADD TO CART
        </button>
      </div>
    </div>
  );
};

export default ItemCard; 