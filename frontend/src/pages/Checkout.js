import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getEffectivePrice, formatPriceForDisplay } from '../utils/priceUtils';
import { placeOrder } from '../services/orders';
import { getAddresses, addAddress } from '../services/auth';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: user?.phone || '',
    isDefault: false
  });

  // Load saved addresses on component mount
  useEffect(() => {
    if (user) {
      loadSavedAddresses();
    }
  }, [user]);

  // Load saved addresses
  const loadSavedAddresses = async () => {
    try {
      const response = await getAddresses();
      setSavedAddresses(response.addresses || []);
      
      // Select default address if available
      const defaultAddress = response.addresses?.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        setFormData(prev => ({
          ...prev,
          address: defaultAddress.address,
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
          phone: defaultAddress.phone
        }));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  // Calculate order totals using the new price utilities
  const orderTotals = (() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = getEffectivePrice(item.item);
      return sum + (price * item.quantity);
    }, 0);
    
    const tax = subtotal * 0.175; // 17.5% tax
    const total = subtotal + tax;
    
    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    };
  })();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setFormData(prev => ({
      ...prev,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone
    }));
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['address', 'city', 'state', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(field => !newAddress[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setLoading(true);
      const response = await addAddress(newAddress);
      
      // Reload addresses
      await loadSavedAddresses();
      
      // Select the newly added address
      const addedAddress = response.addedAddress;
      setSelectedAddress(addedAddress);
      setFormData(prev => ({
        ...prev,
        address: addedAddress.address,
        city: addedAddress.city,
        state: addedAddress.state,
        pincode: addedAddress.pincode,
        phone: addedAddress.phone
      }));
      
      setShowAddressForm(false);
      setNewAddress({
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: user?.phone || '',
        isDefault: false
      });
      
      alert('Address added successfully!');
    } catch (error) {
      console.error('Error adding address:', error);
      alert(`Error adding address: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to place your order.');
      navigate('/login');
      return;
    }

    // If user has saved addresses, validate that one is selected
    if (savedAddresses.length > 0) {
      if (!selectedAddress) {
        alert('Please select a delivery address.');
        return;
      }
    } else {
      // If no saved addresses, validate all required fields
      const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }
    }

    try {
      // Prepare order data according to backend expectations
      let orderData;
      
      if (selectedAddress) {
        // Use selected saved address
        orderData = {
          address: `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`,
          phone: selectedAddress.phone,
          payment: {
            mode: formData.paymentMethod,
            status: formData.paymentMethod === 'cod' ? 'pending' : 'pending',
            cardLast4: formData.paymentMethod === 'cod' ? null : '0000'
          }
        };
      } else {
        // Use form data (when no saved addresses)
        orderData = {
          address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          phone: formData.phone,
          payment: {
            mode: formData.paymentMethod,
            status: formData.paymentMethod === 'cod' ? 'pending' : 'pending',
            cardLast4: formData.paymentMethod === 'cod' ? null : '0000'
          }
        };
      }

      // Call the API to place the order
      const response = await placeOrder(orderData);
      
      // Clear cart after successful order placement
      await clearCart();
      
      // Navigate directly to orders page
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Error placing order: ${error.message || 'Please try again.'}`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', padding: '40px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checkout.</p>
          <button 
            style={{ background: '#19b6c9', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 24px', marginTop: 16, cursor: 'pointer' }}
            onClick={() => navigate('/medicines')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-main-box">
        <div className="checkout-content">
          <div className="checkout-header">
            <h1>Checkout</h1>
            <p>Complete your order with delivery information</p>
          </div>
          
          <div className="checkout-layout">
            {/* Left Column - Forms */}
            <div className="checkout-form-section">
              {/* Saved Addresses Section */}
              <div className="checkout-section">
                <h2>📦 Delivery Address</h2>
                
                {savedAddresses.length > 0 && (
                  <div className="saved-addresses">
                    <h3>Saved Addresses</h3>
                    {savedAddresses.map((address, index) => (
                      <div 
                        key={index}
                        className={`address-card ${selectedAddress === address ? 'selected' : ''}`}
                        onClick={() => handleAddressSelect(address)}
                      >
                        {address.isDefault && <span className="default-badge">Default</span>}
                        <div className="address-content">
                          <p>{address.address}</p>
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                          <p>Phone: {address.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  className="add-new-address-btn"
                  onClick={() => setShowAddressForm(true)}
                >
                  Add New Address
                </button>
                
                {/* New Address Form */}
                {showAddressForm && (
                  <div className="address-form">
                    <h3>Add New Address</h3>
                    <form onSubmit={handleAddNewAddress}>
                      <div className="form-group">
                        <label>Address *</label>
                        <textarea
                          name="address"
                          value={newAddress.address}
                          onChange={handleNewAddressChange}
                          required
                          rows={3}
                          placeholder="Enter your complete address"
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>City *</label>
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleNewAddressChange}
                            required
                            placeholder="Enter city"
                          />
                        </div>
                        <div className="form-group">
                          <label>State *</label>
                          <input
                            type="text"
                            name="state"
                            value={newAddress.state}
                            onChange={handleNewAddressChange}
                            required
                            placeholder="Enter state"
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={newAddress.pincode}
                            onChange={handleNewAddressChange}
                            required
                            placeholder="Enter pincode"
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={newAddress.phone}
                            onChange={handleNewAddressChange}
                            required
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button 
                          type="submit" 
                          className="save-address-btn"
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : 'Save Address'}
                        </button>
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => setShowAddressForm(false)}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Contact Information - Only show when no saved addresses */}
              {savedAddresses.length === 0 && (
                <div className="checkout-section">
                  <h2>👤 Contact Information</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Address *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        placeholder="Enter your complete address"
                      />
                    </div>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>City *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter city"
                        />
                      </div>
                      <div className="form-group">
                        <label>State *</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter state"
                        />
                      </div>
                      <div className="form-group">
                        <label>Pincode *</label>
                        <input
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter pincode"
                        />
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment Methods */}
              <div className="checkout-section">
                <h2>💳 Payment Method</h2>
                <div className="payment-methods">
                  <div className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    <label className="payment-label">
                      <span className="payment-icon">💵</span>
                      Cash on Delivery
                    </label>
                  </div>
                  <div className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={formData.paymentMethod === 'online'}
                      onChange={handleInputChange}
                    />
                    <label className="payment-label">
                      <span className="payment-icon">💳</span>
                      Online Payment
                    </label>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="checkout-section">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="save-address-btn"
                  style={{ width: '100%', fontSize: '1.2rem', padding: '16px' }}
                >
                  Place Order - ₹{orderTotals.total}
                </button>
              </div>
            </div>
            
            {/* Right Column - Order Summary */}
            <div className="checkout-summary">
              <h2>📋 Order Summary</h2>
              
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={`${item.item._id}-${item.itemType}`} className="order-item">
                    <div className="item-info">
                      <img
                        src={item.item.image || '/placeholder-medicine.jpg'}
                        alt={item.item.name}
                        className="item-image"
                      />
                      <div className="item-details">
                        <h4>{item.item.name}</h4>
                        <p>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="item-price">
                      {formatPriceForDisplay(getEffectivePrice(item.item) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatPriceForDisplay(parseFloat(orderTotals.subtotal))}</span>
                </div>
                <div className="total-row">
                  <span>Tax (17.5%)</span>
                  <span>{formatPriceForDisplay(parseFloat(orderTotals.tax))}</span>
                </div>
                <div className="total-row total">
                  <span>Total</span>
                  <span>{formatPriceForDisplay(parseFloat(orderTotals.total))}</span>
                </div>
              </div>
              
              {!user && (
                <div className="error-message">
                  Please <a href="/login">log in</a> to place your order.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
