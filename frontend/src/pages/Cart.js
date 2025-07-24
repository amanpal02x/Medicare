import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, loading, removeFromCart, updateCartItem, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    fetchCart();
    checkForReorder();
    // eslint-disable-next-line
  }, []);

  const checkForReorder = () => {
    const reorderMedicines = localStorage.getItem('reorderMedicines');
    const reorderPrescriptionId = localStorage.getItem('reorderPrescriptionId');
    
    if (reorderMedicines && reorderPrescriptionId) {
      const medicines = JSON.parse(reorderMedicines);
      if (medicines.length > 0) {
        const shouldReorder = window.confirm(
          `You have medicines from prescription #${reorderPrescriptionId.slice(-6)} ready to reorder. Would you like to add them to your cart?`
        );
        
        if (shouldReorder) {
          // Add prescription medicines to cart
          medicines.forEach(medicine => {
            // Create a cart item from prescription medicine
            const cartItem = {
              item: {
                _id: `prescription_${Date.now()}_${Math.random()}`,
                name: medicine.name,
                price: medicine.price,
                discountedPrice: medicine.price,
                image: 'https://via.placeholder.com/100x100?text=Medicine',
                description: `${medicine.dosage} - ${medicine.instructions || 'No instructions'}`
              },
              quantity: medicine.quantity,
              itemType: 'prescription'
            };
            
            // Add to cart context (you'll need to implement this in CartContext)
            // For now, we'll just show an alert
            console.log('Adding to cart:', cartItem);
          });
          
          // Clear localStorage
          localStorage.removeItem('reorderMedicines');
          localStorage.removeItem('reorderPrescriptionId');
          
          alert('Prescription medicines added to cart! You can now proceed to checkout.');
        } else {
          // Clear localStorage if user doesn't want to reorder
          localStorage.removeItem('reorderMedicines');
          localStorage.removeItem('reorderPrescriptionId');
        }
      }
    }
  };

  const handleQuantityChange = async (itemId, itemType, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItems(prev => new Set(prev).add(itemId));
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
    try {
      await removeFromCart(itemId, itemType);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.item.discountedPrice || item.item.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const shipping = subtotal > 0 ? 50 : 0; // Free shipping over certain amount
  const total = subtotal + shipping;

  if (loading) {
    return (
      <>
        <Header />
        <div className="cart-container">
          <div className="cart-loading">
            <div className="loading-spinner"></div>
            <p>Loading your cart...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="cart-container">
        <div className="cart-main-box">
          <div className="cart-content">
            <div className="cart-header">
              <h1>Your Shopping Cart</h1>
              {cartItems.length > 0 && (
                <button 
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <button 
                  className="continue-shopping-btn"
                  onClick={() => navigate('/medicines')}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
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
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
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
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Cart; 