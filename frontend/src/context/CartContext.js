import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart, updateCartItem as apiUpdateCartItem, mergeCart as apiMergeCart } from '../services/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Merge guest cart on login
  useEffect(() => {
    if (user) {
      // If there is a guest cart, merge it
      const guestCart = JSON.parse(localStorage.getItem('cart')) || [];
      if (guestCart.length > 0) {
        // Map guestCart to backend format
        const items = guestCart.map(item => ({
          item: item.item,
          itemType: item.itemType,
          quantity: item.quantity
        }));
        apiMergeCart(items).then(() => {
          localStorage.removeItem('cart');
          fetchCart();
        });
      } else {
        fetchCart();
      }
    } else {
      // Load guest cart from localStorage
      const guestCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(guestCart);
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      if (user) {
        const items = await getCart();
  
      
      // Ensure items is an array and filter out invalid items
      const validItems = Array.isArray(items) ? items.filter(item => {
        // Handle both old and new cart structures
        if (!item) {
          console.warn('Null cart item found');
          return false;
        }
        
        // New structure: item.item and item.itemType
        if (item.item && item.itemType) {
          return true;
        }
        
        // Old structure: item.medicine (should be migrated, but handle gracefully)
        if (item.medicine) {
          console.warn('Found old cart structure, item will be skipped:', item);
          return false;
        }
        
        // Invalid structure
        console.warn('Invalid cart item structure found:', item);
        return false;
      }) : [];
      
      setCartItems(validItems);
      } else {
        // Guest: load from localStorage
        const guestCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(guestCart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
    setLoading(false);
  };

  const addToCart = async (itemId, itemType = 'medicine', quantity = 1) => {
    if (!user) {
      // Guest: update localStorage
      let guestCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existing = guestCart.find(item => item.item === itemId && item.itemType === itemType);
      if (existing) {
        existing.quantity += quantity;
      } else {
        guestCart.push({ item: itemId, itemType, quantity });
      }
      localStorage.setItem('cart', JSON.stringify(guestCart));
      setCartItems(guestCart);
      return;
    }
    try {
  
      await apiAddToCart(itemId, itemType, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId, itemType = 'medicine') => {
    if (!user) {
      let guestCart = JSON.parse(localStorage.getItem('cart')) || [];
      guestCart = guestCart.filter(item => !(item.item === itemId && item.itemType === itemType));
      localStorage.setItem('cart', JSON.stringify(guestCart));
      setCartItems(guestCart);
      return;
    }
    try {
  
      await apiRemoveFromCart(itemId, itemType);
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) {
      localStorage.removeItem('cart');
      setCartItems([]);
      return;
    }
    try {
      await apiClearCart();
      await fetchCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const updateCartItem = async (itemId, itemType = 'medicine', quantity) => {
    if (!user) {
      let guestCart = JSON.parse(localStorage.getItem('cart')) || [];
      const item = guestCart.find(i => i.item === itemId && i.itemType === itemType);
      if (item) {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(guestCart));
        setCartItems(guestCart);
      }
      return;
    }
    try {
      await apiUpdateCartItem(itemId, itemType, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, loading, fetchCart, addToCart, removeFromCart, clearCart, updateCartItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
} 