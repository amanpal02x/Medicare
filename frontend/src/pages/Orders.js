import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import useDeviceDetection from '../hooks/useDeviceDetection';
import { getUserOrders } from '../services/orders';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import TextField from '@mui/material/TextField';
import './Orders.css';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import HelpIcon from '@mui/icons-material/Help';
import ChatWindow from '../components/ChatWindow';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useDeviceDetection();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rateOrderOpen, setRateOrderOpen] = useState(false);
  const [rateDeliveryOpen, setRateDeliveryOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingItemId, setRatingItemId] = useState(null);
  const [ratingType, setRatingType] = useState('');
  const [rateLoading, setRateLoading] = useState(false);
  const { fetchCart } = useCart();
  const { socket } = useSocket();

  // Add state for previous orders modal and filter
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');

  // Add state for support chat modal
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  // Helper to filter orders by time
  const filterOrdersByTime = (orders, filter) => {
    if (filter === 'all') return orders;
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      if (filter === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      } else if (filter === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return orderDate >= monthAgo;
      } else if (filter === 'year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return orderDate >= yearAgo;
      }
      return true;
    });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate, location]);

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    const handleOrderPlaced = (data) => {
      setOrders(prev => [data, ...prev]);
    };
    
    const handleOrderStatusUpdated = (data) => {
      setOrders(prev => prev.map(order =>
        order._id === data.orderId ? { ...order, status: data.status, statusTimestamps: data.statusTimestamps, statusHistory: data.statusHistory } : order
      ));
    };
    
    const handleOrderClaimed = (data) => {
      setOrders(prev => prev.map(order =>
        order._id === data.orderId ? { ...order, status: 'confirmed', pharmacist: data.pharmacist } : order
      ));
    };
    
    const handleOrderAssigned = (data) => {
      setOrders(prev => prev.map(order =>
        order._id === data.orderId ? { ...order, status: 'out_for_delivery', deliveryBoy: data.deliveryBoy } : order
      ));
    };

    socket.on('orderPlaced', handleOrderPlaced);
    socket.on('orderStatusUpdated', handleOrderStatusUpdated);
    socket.on('orderClaimed', handleOrderClaimed);
    socket.on('orderAssigned', handleOrderAssigned);

    return () => {
      socket.off('orderPlaced', handleOrderPlaced);
      socket.off('orderStatusUpdated', handleOrderStatusUpdated);
      socket.off('orderClaimed', handleOrderClaimed);
      socket.off('orderAssigned', handleOrderAssigned);
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getUserOrders();
      // The backend returns orders directly, not wrapped in a data property
      if (Array.isArray(response)) {
        setOrders(response);
      } else if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      out_for_delivery: '#10b981',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      processing: '⚙️',
      out_for_delivery: '🚚',
      delivered: '📦',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  const getOrderTrackingInfo = (order) => {
    const status = order.status;
    if (status === 'delivered') {
      return `Delivered on ${formatDate(order.updatedAt || order.createdAt)}`;
    } else if (status === 'out_for_delivery') {
      return 'Arriving tomorrow (08:00 AM - 07:55 PM)';
    } else if (status === 'processing') {
      return 'Delivery expected by Aug 03';
    } else {
      return `Order placed on ${formatDate(order.createdAt)}`;
    }
  };

  const handleReorder = (order) => {
    // Implementation for reordering
  };

  const handleCardClick = (order) => {
    if (isMobile) {
      // Navigate to mobile order detail page
      navigate(`/mobile/order/${order._id}`);
    } else {
      // Open modal for desktop
      setSelectedOrder(order);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleRateOrder = (order, item) => {
    setSelectedOrder(order);
    setRatingItemId(item._id);
    setRatingType('order');
    setRateOrderOpen(true);
  };

  const handleRateDelivery = (order) => {
    setSelectedOrder(order);
    setRatingType('delivery');
    setRateDeliveryOpen(true);
  };

  const submitRating = async () => {
    try {
      setRateLoading(true);
      // Implementation for submitting rating
      toast.success('Rating submitted successfully!');
      setRateOrderOpen(false);
      setRateDeliveryOpen(false);
      setRatingValue(0);
      setRatingComment('');
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setRateLoading(false);
    }
  };

  const handleOrderAgain = async (order) => {
    try {
      // Implementation for ordering again
      toast.success('Items added to cart!');
      await fetchCart();
    } catch (error) {
      toast.error('Failed to add items to cart');
    }
  };

  // Filter orders based on search and filter criteria
  const filteredOrders = orders.filter(order => {
    let matchesFilter = true;
    if (filter !== 'all') {
      matchesFilter = order.status === filter;
    }
    const matchesSearch = searchTerm === '' || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <>
        {!isMobile && <Header />}
        <div className="orders-container">
          <div className="orders-loading">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="mobile-orders-container">
        {/* Search and Filter Header */}
        <div className="mobile-orders-header">
          <div className="mobile-search-container">
            <div className="mobile-search-box">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder="Search your order here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mobile-search-input"
              />
            </div>
            <button 
              className="mobile-filters-btn"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            >
              <FilterListIcon />
              <span>Filters</span>
            </button>
          </div>
          
          {/* Filter Options */}
          {mobileFilterOpen && (
            <div className="mobile-filter-options">
              <button
                className={`mobile-filter-option ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Orders
              </button>
              <button
                className={`mobile-filter-option ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`mobile-filter-option ${filter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilter('confirmed')}
              >
                Confirmed
              </button>
              <button
                className={`mobile-filter-option ${filter === 'processing' ? 'active' : ''}`}
                onClick={() => setFilter('processing')}
              >
                Processing
              </button>
              <button
                className={`mobile-filter-option ${filter === 'out_for_delivery' ? 'active' : ''}`}
                onClick={() => setFilter('out_for_delivery')}
              >
                Out for Delivery
              </button>
              <button
                className={`mobile-filter-option ${filter === 'delivered' ? 'active' : ''}`}
                onClick={() => setFilter('delivered')}
              >
                Delivered
              </button>
              <button
                className={`mobile-filter-option ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Cancelled
              </button>
            </div>
          )}
        </div>

        {/* Orders List */}
        <div className="mobile-orders-list">
          {filteredOrders.length === 0 ? (
            <div className="mobile-no-orders">
              <p>No orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="mobile-order-item"
                onClick={() => handleCardClick(order)}
              >
                {/* Product Images */}
                <div className="mobile-order-images">
                  {order.products && order.products.length > 0 ? (
                    <div className="mobile-product-grid">
                      {order.products.slice(0, 4).map((item, index) => (
                        <img
                          key={index}
                          src={item.product?.image || '/placeholder-medicine.jpg'}
                          alt={item.product?.name || 'Product'}
                          className="mobile-product-thumbnail"
                        />
                      ))}
                      {order.products.length > 4 && (
                        <div className="mobile-more-items">
                          +{order.products.length - 4}
                        </div>
                      )}
                    </div>
                  ) : order.medicines && order.medicines.length > 0 ? (
                    <div className="mobile-product-grid">
                      {order.medicines.slice(0, 4).map((item, index) => (
                        <img
                          key={index}
                          src={item.medicine?.image || '/placeholder-medicine.jpg'}
                          alt={item.medicine?.name || 'Medicine'}
                          className="mobile-product-thumbnail"
                        />
                      ))}
                      {order.medicines.length > 4 && (
                        <div className="mobile-more-items">
                          +{order.medicines.length - 4}
                        </div>
                      )}
                    </div>
                  ) : (
                    <img
                      src="/placeholder-medicine.jpg"
                      alt="Order"
                      className="mobile-single-product"
                    />
                  )}
                </div>

                {/* Order Details */}
                <div className="mobile-order-details">
                  <div 
                    className="mobile-delivery-status"
                    style={{ 
                      color: order.status === 'out_for_delivery' ? '#10b981' : '#000',
                      fontWeight: order.status === 'out_for_delivery' ? '600' : '400'
                    }}
                  >
                    {getOrderTrackingInfo(order)}
                  </div>
                  <div className="mobile-order-product-name">
                    {order.products && order.products.length > 0 
                      ? `${order.products[0]?.product?.name || 'Product'}${order.products.length > 1 ? ` (${order.products.length} items)` : ''}`
                      : order.medicines && order.medicines.length > 0
                      ? `${order.medicines[0]?.medicine?.name || 'Medicine'}${order.medicines.length > 1 ? ` (${order.medicines.length} items)` : ''}`
                      : 'Order'
                    }
                  </div>
                </div>

                {/* Navigation Arrow */}
                <div className="mobile-order-arrow">
                  <ChevronRightIcon />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Continue Shopping */}
        <div className="mobile-continue-shopping">
          <button 
            onClick={() => navigate('/medicines')}
            className="mobile-shop-now-btn"
          >
            Continue Shopping
          </button>
        </div>



        {/* Rating Modals */}
        <Dialog open={rateOrderOpen} onClose={() => setRateOrderOpen(false)}>
          <DialogTitle>Rate Your Order</DialogTitle>
          <DialogContent>
            <Rating
              value={ratingValue}
              onChange={(event, newValue) => setRatingValue(newValue)}
              size="large"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write your review..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRateOrderOpen(false)}>Cancel</Button>
            <Button onClick={submitRating} disabled={rateLoading}>
              {rateLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={rateDeliveryOpen} onClose={() => setRateDeliveryOpen(false)}>
          <DialogTitle>Rate Delivery Service</DialogTitle>
          <DialogContent>
            <Rating
              value={ratingValue}
              onChange={(event, newValue) => setRatingValue(newValue)}
              size="large"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Write your review..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRateDeliveryOpen(false)}>Cancel</Button>
            <Button onClick={submitRating} disabled={rateLoading}>
              {rateLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>



        <ToastContainer />
      </div>
    );
  }

  // Desktop Layout (existing code)
  return (
    <>
      {!isMobile && <Header />}
      <div className="orders-container">
        <div className="orders-main-box">
          <div className="orders-content">
            <div className="orders-header">
              <div className="orders-header-row">
                <h1>My Orders</h1>
                <p>Track and manage your orders</p>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Controls Section */}
            <div className="orders-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>

              {/* Hamburger for mobile - moved to right */}
              <button
                className="mobile-filter-toggle"
                onClick={() => setMobileFilterOpen((open) => !open)}
                aria-label="Show filters"
                style={{ marginLeft: 'auto' }}
              >
                <span className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>

              {/* Filter Buttons */}
              <div className={`filter-buttons${mobileFilterOpen ? ' open' : ''}`}>
                <button
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Orders
                </button>
                <button
                  className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilter('pending')}
                >
                  Pending
                </button>
                <button
                  className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
                  onClick={() => setFilter('confirmed')}
                >
                  Confirmed
                </button>
                <button
                  className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
                  onClick={() => setFilter('processing')}
                >
                  Processing
                </button>
                <button
                  className={`filter-btn ${filter === 'out_for_delivery' ? 'active' : ''}`}
                  onClick={() => setFilter('out_for_delivery')}
                >
                  Out for Delivery
                </button>
                <button
                  className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                  onClick={() => setFilter('delivered')}
                >
                  Delivered
                </button>
                <button
                  className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setFilter('cancelled')}
                >
                  Cancelled
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="orders-list">
              {/* Show only 6 most recent orders */}
              {(filteredOrders.slice(0, 6)).map((order) => (
                  <div
                    key={order._id}
                    className="order-card modern"
                    onClick={() => handleCardClick(order)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="order-card-top">
                      <div className="order-card-imgbox">
                        <img
                          src={
                            order.products?.[0]?.product?.image ||
                            order.medicines?.[0]?.medicine?.image ||
                            '/placeholder-medicine.jpg'
                          }
                          alt="Order"
                          className="order-card-img"
                        />
                      </div>
                      <div className="order-card-main">
                        <div className="order-card-header-row">
                          <div className="order-card-status-block">
                            <span 
                              className="order-card-status"
                              style={{ color: getStatusColor(order.status), fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <span className="status-icon">{getStatusIcon(order.status)}</span>
                              <span className="status-text">{getStatusText(order.status)}</span>
                            </span>
                            <div className="order-card-date">
                              Placed at {formatDate(order.createdAt)}
                            </div>
                            <div className="order-card-id" style={{ fontSize: '0.95rem', color: '#555', marginTop: 2 }}>
                              Order ID: {order.orderNumber || order._id}
                            </div>
                          </div>
                          <div className="order-card-total">
                            ₹{order.total?.toFixed(0)}
                          </div>
                        </div>
                        {/* Only show Rate Delivery, Rate Order, and Order Again if delivered */}
                        {order.status === 'delivered' && (
                          <button className="rate-delivery-btn" onClick={e => { e.stopPropagation(); handleRateDelivery(order); }}>Rate Delivery</button>
                        )}
                      </div>
                    </div>
                    <hr className="order-card-divider" />
                    {/* Only show Rate Order if delivered, but Order Again if delivered or cancelled */}
                    {(order.status === 'delivered' || order.status === 'cancelled') && (
                      <div className="order-card-actions">
                        {order.status === 'delivered' && (
                          <button
                            className="rate-order-btn outlined"
                            onClick={e => {
                              e.stopPropagation();
                              const item = (order.medicines && order.medicines[0]) || (order.products && order.products[0]);
                              if (item) {
                                handleRateOrder(order, item);
                              } else {
                                toast.error('No items to rate in this order.');
                              }
                            }}
                          >
                            RATE ORDER
                          </button>
                        )}
                        <button className="order-again-btn filled" onClick={e => { e.stopPropagation(); handleOrderAgain(order); }}>ORDER AGAIN</button>
                      </div>
                    )}
                  </div>
                ))}
              {/* Show Previous Orders button if there are more than 6 orders */}
              {filteredOrders.length > 6 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 24 }}>
                  <button
                    className="previous-orders-btn"
                    style={{
                      padding: '12px 28px',
                      background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 16,
                      fontWeight: 700,
                      fontSize: '1.08rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 18px rgba(37,99,235,0.18)',
                      letterSpacing: '0.5px',
                      transition: 'background 0.2s, transform 0.2s',
                      outline: 'none',
                      position: 'relative',
                      left: 0,
                      zIndex: 2,
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #1e40af 0%, #2563eb 100%)'}
                    onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)'}
                    onClick={() => setShowPreviousOrders(true)}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" style={{ marginRight: 4 }}><path d="M3 12l18 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/><circle cx="5.5" cy="12" r="2.5" fill="#fff" fillOpacity=".18"/><circle cx="18.5" cy="12" r="2.5" fill="#fff" fillOpacity=".18"/></svg>
                      Previous Orders
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Previous Orders Modal/Section */}
            {showPreviousOrders && (
              <div
                className="previous-orders-modal-backdrop"
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(30, 41, 59, 0.25)',
                  zIndex: 1000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'fadeIn 0.2s',
                }}
                onClick={e => {
                  // Only close if click is on the backdrop, not inside the modal
                  if (e.target.classList.contains('previous-orders-modal-backdrop')) {
                    setShowPreviousOrders(false);
                  }
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 18,
                    padding: 36,
                    minWidth: 400,
                    maxWidth: 700,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(30,41,59,0.18)',
                    animation: 'slideUp 0.25s',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <button onClick={() => setShowPreviousOrders(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#2563eb', fontWeight: 700, transition: 'color 0.2s' }}>&times;</button>
                  <h2 style={{ marginBottom: 18, color: '#1e40af', fontWeight: 800, letterSpacing: '0.5px' }}>Previous Orders</h2>
                  {/* Filter Controls */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                    <button onClick={() => setOrderFilter('all')} style={{ background: orderFilter === 'all' ? '#2563eb' : '#f1f1f1', color: orderFilter === 'all' ? '#fff' : '#222', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: orderFilter === 'all' ? '0 2px 8px #2563eb22' : 'none' }}>All</button>
                    <button onClick={() => setOrderFilter('week')} style={{ background: orderFilter === 'week' ? '#2563eb' : '#f1f1f1', color: orderFilter === 'week' ? '#fff' : '#222', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: orderFilter === 'week' ? '0 2px 8px #2563eb22' : 'none' }}>Last Week</button>
                    <button onClick={() => setOrderFilter('month')} style={{ background: orderFilter === 'month' ? '#2563eb' : '#f1f1f1', color: orderFilter === 'month' ? '#fff' : '#222', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: orderFilter === 'month' ? '0 2px 8px #2563eb22' : 'none' }}>Last Month</button>
                    <button onClick={() => setOrderFilter('year')} style={{ background: orderFilter === 'year' ? '#2563eb' : '#f1f1f1', color: orderFilter === 'year' ? '#fff' : '#222', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: orderFilter === 'year' ? '0 2px 8px #2563eb22' : 'none' }}>Last Year</button>
                  </div>
                  {/* Previous Orders List */}
                  {filterOrdersByTime(filteredOrders.slice(6), orderFilter).length === 0 ? (
                    <div style={{ color: '#888', textAlign: 'center', marginTop: 32 }}>No previous orders found for this filter.</div>
                  ) : (
                    filterOrdersByTime(filteredOrders.slice(6), orderFilter).map((order) => (
                      <div
                        key={order._id}
                        className="order-card modern"
                        onClick={() => handleCardClick(order)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="order-card-top">
                          <div className="order-card-imgbox">
                            <img
                              src={
                                order.products?.[0]?.product?.image ||
                                order.medicines?.[0]?.medicine?.image ||
                                '/placeholder-medicine.jpg'
                              }
                              alt="Order"
                              className="order-card-img"
                            />
                          </div>
                          <div className="order-card-main">
                            <div className="order-card-header-row">
                              <div className="order-card-status-block">
                                <span 
                                  className="order-card-status"
                                  style={{ color: getStatusColor(order.status), fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                  <span className="status-icon">{getStatusIcon(order.status)}</span>
                                  <span className="status-text">{getStatusText(order.status)}</span>
                                </span>
                                <div className="order-card-date">
                                  Placed at {formatDate(order.createdAt)}
                                </div>
                                <div className="order-card-id" style={{ fontSize: '0.95rem', color: '#555', marginTop: 2 }}>
                                  Order ID: {order.orderNumber || order._id}
                                </div>
                              </div>
                              <div className="order-card-total">
                                ₹{order.total?.toFixed(0)}
                              </div>
                            </div>
                            {/* Only show Rate Delivery, Rate Order, and Order Again if delivered */}
                            {order.status === 'delivered' && (
                              <button className="rate-delivery-btn" onClick={e => { e.stopPropagation(); handleRateDelivery(order); }}>Rate Delivery</button>
                            )}
                          </div>
                        </div>
                        <hr className="order-card-divider" />
                        {/* Only show Rate Order if delivered, but Order Again if delivered or cancelled */}
                        {(order.status === 'delivered' || order.status === 'cancelled') && (
                          <div className="order-card-actions">
                            {order.status === 'delivered' && (
                              <button
                                className="rate-order-btn outlined"
                                onClick={e => {
                                  e.stopPropagation();
                                  const item = (order.medicines && order.medicines[0]) || (order.products && order.products[0]);
                                  if (item) {
                                    handleRateOrder(order, item);
                                  } else {
                                    toast.error('No items to rate in this order.');
                                  }
                                }}
                              >
                                RATE ORDER
                              </button>
                            )}
                            <button className="order-again-btn filled" onClick={e => { e.stopPropagation(); handleOrderAgain(order); }}>ORDER AGAIN</button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Continue Shopping */}
            <div className="continue-shopping">
              <button 
                onClick={() => navigate('/medicines')}
                className="shop-now-btn large"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* MUI Dialog for order details */}
      <Dialog open={modalOpen} onClose={handleModalClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ position: 'relative', pr: 6 }}>
          Order #{selectedOrder?.orderNumber || selectedOrder?._id}
          {/* Help Button at top right */}
          {selectedOrder && (
            <Button
              onClick={() => setSupportChatOpen(true)}
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                minWidth: 0, 
                padding: 1, 
                borderRadius: '50%',
                zIndex: 10,
                backgroundColor: '#3b82f6',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#2563eb'
                }
              }}
              aria-label="Help with this order"
            >
              <HelpIcon />
            </Button>
          )}
        </DialogTitle>
        <DialogContent>
          {/* Render order details here, similar to your screenshot */}
          {/* Example: */}
          {selectedOrder && (
            <div className="order-detail-modal-content">
              {/* Timeline/status */}
              <div className="order-timeline">
                {['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'].map((status, idx) => {
                  const statusMap = {
                    pending: 'Pending',
                    accepted: 'Accepted',
                    preparing: 'Preparing',
                    out_for_delivery: 'Out for Delivery',
                    delivered: 'Delivered',
                  };
                  const isCompleted = ['pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered'].indexOf(selectedOrder.status) >= idx;
                  const isCurrent = selectedOrder.status === status;
                  
                  return (
                    <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                      <div className="timeline-icon">
                        {isCompleted ? '✓' : '○'}
                      </div>
                      <div className="timeline-label">
                        {statusMap[status]}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="order-items">
                <h4>Order Items</h4>
                {selectedOrder.products?.map((item, index) => (
                  <div key={index} className="order-item-detail">
                    <img src={item.product?.image || '/placeholder-medicine.jpg'} alt={item.product?.name} />
                    <div>
                      <p>{item.product?.name}</p>
                      <p>Qty: {item.quantity}</p>
                      <p>₹{item.price}</p>
                    </div>
                  </div>
                ))}
                {selectedOrder.medicines?.map((item, index) => (
                  <div key={index} className="order-item-detail">
                    <img src={item.medicine?.image || '/placeholder-medicine.jpg'} alt={item.medicine?.name} />
                    <div>
                      <p>{item.medicine?.name}</p>
                      <p>Qty: {item.quantity}</p>
                      <p>₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="order-summary">
                <h4>Order Summary</h4>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee:</span>
                  <span>₹{selectedOrder.deliveryFee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Close</Button>
          {(selectedOrder?.status === 'delivered' || selectedOrder?.status === 'cancelled') && (
            <Button 
              onClick={() => handleOrderAgain(selectedOrder)}
              variant="contained"
              color="primary"
            >
              Order Again
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Rating Modals */}
      <Dialog open={rateOrderOpen} onClose={() => setRateOrderOpen(false)}>
        <DialogTitle>Rate Your Order</DialogTitle>
        <DialogContent>
          <Rating
            value={ratingValue}
            onChange={(event, newValue) => setRatingValue(newValue)}
            size="large"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your review..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRateOrderOpen(false)}>Cancel</Button>
          <Button onClick={submitRating} disabled={rateLoading}>
            {rateLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rateDeliveryOpen} onClose={() => setRateDeliveryOpen(false)}>
        <DialogTitle>Rate Delivery Service</DialogTitle>
        <DialogContent>
          <Rating
            value={ratingValue}
            onChange={(event, newValue) => setRatingValue(newValue)}
            size="large"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your review..."
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRateDeliveryOpen(false)}>Cancel</Button>
          <Button onClick={submitRating} disabled={rateLoading}>
            {rateLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Support Chat Modal */}
      <Dialog 
        open={supportChatOpen} 
        onClose={() => setSupportChatOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            minHeight: '500px',
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ position: 'relative', pr: 6 }}>
          Support Chat - Order #{selectedOrder?.orderNumber || selectedOrder?._id}
          <Button
            onClick={() => setSupportChatOpen(false)}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              minWidth: 0, 
              padding: 1, 
              borderRadius: '50%',
              zIndex: 10,
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#e5e7eb'
              }
            }}
            aria-label="Close support chat"
          >
            ×
          </Button>
        </DialogTitle>
        <DialogContent>
          <ChatWindow
            currentUser={user}
            orderId={selectedOrder?._id}
          />
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </>
  );
};

export default Orders; 