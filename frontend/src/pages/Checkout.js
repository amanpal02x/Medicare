import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder, validateAddress, validatePhone, validatePincode, calculateOrderTotals } from '../services/checkout';
import { getProfile, updateProfile, getAddresses, addAddress, removeAddress } from '../services/auth';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, loading: cartLoading, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    paymentMethod: 'cod',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderTotals, setOrderTotals] = useState({ subtotal: '0.00', tax: '0.00', total: '0.00' });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [profileAddress, setProfileAddress] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    setOrderTotals(calculateOrderTotals(cartItems));
    loadAddresses();
    loadProfileAddress();
  }, [user, cartItems, navigate]);

  const loadAddresses = async () => {
    try {
      const res = await getAddresses();
      setSavedAddresses(res.addresses || []);
      if ((res.addresses || []).length === 0) {
        setShowAddressForm(true);
      } else {
        setShowAddressForm(false);
      }
    } catch (e) {
      setSavedAddresses([]);
      setShowAddressForm(true);
    }
  };

  const loadProfileAddress = async () => {
    try {
      const res = await getProfile();
      if (res.address || res.city || res.state || res.pincode) {
        setProfileAddress({
          address: res.address || '',
          city: res.city || '',
          state: res.state || '',
          pincode: res.pincode || '',
          phone: res.phone || '',
        });
      }
    } catch (e) {
      setProfileAddress(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const addressErrors = validateAddress(formData.address);
    if (addressErrors.address) newErrors.address = addressErrors.address;
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    const pincodeErrors = validatePincode(formData.pincode);
    if (pincodeErrors.pincode) newErrors.pincode = pincodeErrors.pincode;
    const phoneErrors = validatePhone(formData.phone);
    if (phoneErrors.phone) newErrors.phone = phoneErrors.phone;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id);
    setFormData({
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      paymentMethod: formData.paymentMethod,
    });
  };

  const handleRemoveAddress = async (addressId) => {
    setLoading(true);
    try {
      await removeAddress(addressId);
      await loadAddresses();
      setSelectedAddressId(null);
    } catch (e) {
      setErrors({ general: 'Failed to remove address.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUseProfileAddress = () => {
    if (profileAddress) {
      setFormData({
        ...profileAddress,
        paymentMethod: formData.paymentMethod,
      });
      setSelectedAddressId(null);
    }
  };

  const handleAddAddress = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const addressData = {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        phone: formData.phone,
        isDefault: savedAddresses.length === 0,
      };
      
      console.log('Sending address data:', addressData);
      
      const response = await addAddress(addressData);
      console.log('Address response:', response);
      
      if (response.message) {
        await loadAddresses();
        setFormData({ address: '', city: '', state: '', pincode: '', phone: '', paymentMethod: formData.paymentMethod });
        setSelectedAddressId(null);
        // Hide form if there are now addresses
        setShowAddressForm(false);
      } else {
        throw new Error(response.message || 'Failed to add address');
      }
    } catch (e) {
      console.error('Error adding address:', e);
      setErrors({ general: e.message || 'Failed to add address. Please check all fields and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      // Save intended redirect and go to login
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
      return;
    }
    // Validate required fields
    const validationErrors = {};
    
    if (!selectedAddressId && !formData.address) {
      validationErrors.address = 'Please select an address or enter a new one';
    }
    
    if (!formData.paymentMethod) {
      validationErrors.paymentMethod = 'Please select a payment method';
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Get the selected address or use form data
      let orderAddress, orderPhone;
      
      if (selectedAddressId) {
        const selectedAddress = savedAddresses.find(addr => addr._id === selectedAddressId);
        if (selectedAddress) {
          orderAddress = `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;
          orderPhone = selectedAddress.phone;
        }
      } else {
        orderAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;
        orderPhone = formData.phone;
      }
      
      // Prepare order data
      const orderData = {
        address: orderAddress,
        phone: orderPhone,
        payment: {
          mode: formData.paymentMethod,
          status: formData.paymentMethod === 'cod' ? 'pending' : 'completed',
          cardLast4: formData.paymentMethod === 'card' ? '1234' : null
        }
      };
      
      console.log('Placing order with data:', orderData);
      
      const response = await placeOrder(orderData);
      
      if (response.order) {
        // Order placed successfully
        setOrderSuccess(true);
        setOrderNumber(response.orderNumber);
        
        // Clear cart
        clearCart();
        
        // Redirect to orders page after 3 seconds
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setErrors({ general: error.message || 'Failed to place order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <>
        <Header />
        <div className="checkout-container">
          <div className="checkout-loading">
            <div className="loading-spinner"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="checkout-container">
        
        
        {errors.general && (
          <div className="error-message">{errors.general}</div>
        )}
        
        {orderSuccess && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order #{orderNumber} has been placed and is being processed.</p>
            <p>You will be redirected to your orders page in a few seconds...</p>
          </div>
        )}
        
        {!orderSuccess && (
          <div className="checkout-main-box">
            <div className="checkout-content">
              <div className="checkout-header">
                <h1>Checkout</h1>
                <p>Complete your order</p>
              </div>
              {errors.general && <div className="error-message">{errors.general}</div>}
              <div className="checkout-layout">
                <div className="checkout-form-section">
                  {/* Saved Addresses */}
                  <div className="checkout-section">
                    <h2>Saved Addresses</h2>
                    {savedAddresses.length === 0 && <p>No saved addresses yet.</p>}
                    <div className="saved-addresses">
                      {savedAddresses.map((address) => (
                        <div
                          key={address._id}
                          className={`address-card${selectedAddressId === address._id ? ' selected' : ''}`}
                          onClick={() => handleSelectAddress(address)}
                        >
                          <div className="address-content">
                            <p><strong>{address.address}</strong></p>
                            <p>{address.city}, {address.state} - {address.pincode}</p>
                            <p>Phone: {address.phone}</p>
                          </div>
                          <button
                            className="remove-address-btn"
                            onClick={e => { e.stopPropagation(); handleRemoveAddress(address._id); }}
                            disabled={loading}
                          >
                            Remove
                          </button>
                          {address.isDefault && <span className="default-badge">Default</span>}
                        </div>
                      ))}
                    </div>
                    {profileAddress && (
                      <button className="use-profile-address-btn" onClick={handleUseProfileAddress}>
                        Use My Profile Address
                      </button>
                    )}
                    {/* Add New Address Button */}
                    {savedAddresses.length > 0 && !showAddressForm && (
                      <button
                        className="add-new-address-btn"
                        onClick={() => setShowAddressForm(true)}
                        style={{ marginTop: '10px' }}
                      >
                        Add New Address
                      </button>
                    )}
                  </div>
                  {/* Address Form */}
                  {showAddressForm && (
                    <div className="checkout-section">
                      <h2>{selectedAddressId ? 'Edit Address' : 'Add New Address'}</h2>
                      <div className="address-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Address *</label>
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="Enter your full address"
                              className={errors.address ? 'error' : ''}
                            />
                            {errors.address && <span className="error-text">{errors.address}</span>}
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>City *</label>
                            <input
                              type="text"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              placeholder="Enter city"
                              className={errors.city ? 'error' : ''}
                            />
                            {errors.city && <span className="error-text">{errors.city}</span>}
                          </div>
                          <div className="form-group">
                            <label>State *</label>
                            <input
                              type="text"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              placeholder="Enter state"
                              className={errors.state ? 'error' : ''}
                            />
                            {errors.state && <span className="error-text">{errors.state}</span>}
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Pincode *</label>
                            <input
                              type="text"
                              name="pincode"
                              value={formData.pincode}
                              onChange={handleInputChange}
                              placeholder="Enter 6-digit pincode"
                              maxLength="6"
                              className={errors.pincode ? 'error' : ''}
                            />
                            {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                          </div>
                          <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Enter 10-digit phone number"
                              maxLength="10"
                              className={errors.phone ? 'error' : ''}
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                          </div>
                        </div>
                        <div className="form-actions">
                          <button
                            className="save-address-btn"
                            onClick={handleAddAddress}
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save Address'}
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => {
                              setFormData({ address: '', city: '', state: '', pincode: '', phone: '', paymentMethod: formData.paymentMethod });
                              setShowAddressForm(false);
                            }}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Payment Method Section */}
                  <div className="checkout-section">
                    <h2>Payment Method</h2>
                    <div className="payment-methods">
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                        />
                        <span className="payment-label">
                          <span className="payment-icon">💳</span>
                          Cash on Delivery
                        </span>
                      </label>
                      <label className="payment-option">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="online"
                          checked={formData.paymentMethod === 'online'}
                          onChange={handleInputChange}
                        />
                        <span className="payment-label">
                          <span className="payment-icon">💳</span>
                          Online Payment (Coming Soon)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                {/* Order Summary */}
                <div className="checkout-summary">
                  <h2>Order Summary</h2>
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
                          ₹{((item.item.discountedPrice || item.item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-totals">
                    <div className="total-row">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>₹{orderTotals.subtotal}</span>
                    </div>
                    <div className="total-row">
                      <span>Tax (17.5%)</span>
                      <span>₹{orderTotals.tax}</span>
                    </div>
                    <div className="total-row total">
                      <span>Total</span>
                      <span>₹{orderTotals.total}</span>
                    </div>
                  </div>
                  { !user && (
                    <div className="error-message" style={{ marginBottom: 10 }}>
                      Please <a href="/login">log in</a> to place your order.
                    </div>
                  )}
                  <button
                    className="place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading || cartItems.length === 0 || !user}
                  >
                    {loading && <span className="loading-spinner"></span>}
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                  <button
                    className="back-to-cart-btn"
                    onClick={() => navigate('/cart')}
                    disabled={loading}
                  >
                    Back to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
