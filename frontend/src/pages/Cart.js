import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getEffectivePrice, formatPriceForDisplay } from '../utils/priceUtils';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateCartItem, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  // Calculate totals using the new price utilities
  const subtotal = cartItems.reduce((sum, item) => {
    const price = getEffectivePrice(item.item);
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const total = subtotal + shipping;

  const handleQuantityChange = async (itemId, itemType, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set([...prev, itemId]));
    try {
      await updateCartItem(itemId, itemType, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId, itemType) => {
    setUpdatingItems(prev => new Set([...prev, itemId]));
    try {
      await removeFromCart(itemId, itemType);
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="cart-layout">
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some medicines and products to get started!</p>
            <button 
              className="continue-shopping-btn"
              onClick={() => navigate('/medicines')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span>Action</span>
          </div>
          {cartItems.map((item) => (
            <CartItem
              key={`${item.item._id}-${item.itemType}`}
              item={item}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              isUpdating={updatingItems.has(item.item._id)}
            />
          ))}
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <span>Subtotal ({cartItems.length} items)</span>
            <span>{formatPriceForDisplay(subtotal)}</span>
          </div>
          <div className="summary-item">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPriceForDisplay(shipping)}</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-total">
            <span>Total</span>
            <span>{formatPriceForDisplay(total)}</span>
          </div>
          <button 
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            Proceed to Checkout
          </button>
          <button 
            className="continue-shopping-btn secondary"
            onClick={() => navigate('/medicines')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart; 