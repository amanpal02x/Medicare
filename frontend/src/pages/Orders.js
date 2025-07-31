import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
import { useCart } from '../context/CartContext'; // add this import
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import HelpIcon from '@mui/icons-material/Help';
import ChatWindow from '../components/ChatWindow';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // add this line
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
  const { fetchCart } = useCart(); // get the cart reload function
  const { socket } = useSocket();

  // Add state for previous orders modal and filter
  const [showPreviousOrders, setShowPreviousOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all'); // 'all', 'week', 'month', 'year'

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
  }, [user, navigate, location]); // add location to dependencies

  // Real-time socket event listeners
  useEffect(() => {
    if (!socket) return;
    // New order placed (for pharmacists, but safe to listen for all)
    const handleOrderPlaced = (data) => {
      setOrders(prev => [data, ...prev]);
    };
    // Order status updated (for users and pharmacists)
    const handleOrderStatusUpdated = (data) => {
      setOrders(prev => prev.map(order =>
        order._id === data.orderId ? { ...order, status: data.status, statusTimestamps: data.statusTimestamps, statusHistory: data.statusHistory } : order
      ));
    };
    // Order claimed (for pharmacists)
    const handleOrderClaimed = (data) => {
      setOrders(prev => prev.map(order =>
        order._id === data.orderId ? { ...order, isAssignedToMe: true } : order
      ));
    };
    // Order assigned (for pharmacists)
    const handleOrderAssigned = (data) => {
      setOrders(prev => [data, ...prev]);
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
    setLoading(true);
    setError('');
    try {
      const response = await getUserOrders();
      console.log('Orders response:', response);
      
      // The backend returns orders directly, not wrapped in an 'orders' property
      if (Array.isArray(response)) {
        setOrders(response);
      } else if (response.orders && Array.isArray(response.orders)) {
        setOrders(response.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'processing': return '#8b5cf6';
      case 'out_for_delivery': return '#f59e0b';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
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
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'processing': return '⚙️';
      case 'out_for_delivery': return '🚚';
      case 'delivered': return '📦';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const getOrderTrackingInfo = (order) => {
    if (!order.tracking || !order.tracking.updates) return null;
    
    const updates = order.tracking.updates;
    if (updates.length === 0) return null;
    
    // Get the latest update
    const latestUpdate = updates[updates.length - 1];
    return {
      status: latestUpdate.status,
      description: latestUpdate.description,
      timestamp: latestUpdate.timestamp
    };
  };

  const handleReorder = (order) => {
    // TODO: Implement reorder functionality
    alert('Reorder functionality will be implemented soon!');
  };

  const handleCardClick = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  // Handler for Rate Order button
  const handleRateOrder = (order, item) => {
    setSelectedOrder(order);
    setRatingItemId(item?.medicine?._id || item?.product?._id);
    setRatingType(item?.medicine ? 'medicine' : 'product');
    setRatingValue(0);
    setRatingComment('');
    setRateOrderOpen(true);
  };

  // Handler for Rate Delivery button
  const handleRateDelivery = (order) => {
    setSelectedOrder(order);
    setRatingType('delivery');
    setRatingValue(0);
    setRatingComment('');
    setRateDeliveryOpen(true);
  };

  // Submit rating
  const submitRating = async () => {
    setRateLoading(true);
    try {
      const payload = {
        orderId: selectedOrder._id,
        type: ratingType,
        rating: ratingValue,
        comment: ratingComment,
      };
      if (ratingType === 'medicine' || ratingType === 'product') {
        payload.itemId = ratingItemId;
      }
      const res = await fetch(joinUrl(API_BASE, '/ratings/submit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit rating');
      setRateOrderOpen(false);
      setRateDeliveryOpen(false);
      alert('Rating submitted!');
    } catch (e) {
      alert(e.message);
    } finally {
      setRateLoading(false);
    }
  };

  // Handler for Order Again button
  const handleOrderAgain = async (order) => {
    try {
      for (const item of order.medicines || []) {
        await fetch(joinUrl(API_BASE, '/cart/add'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ itemId: item.medicine?._id, itemType: 'medicine', quantity: item.quantity }),
        });
      }
      for (const item of order.products || []) {
        await fetch(joinUrl(API_BASE, '/cart/add'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ itemId: item.product?._id, itemType: 'product', quantity: item.quantity }),
        });
      }
      await fetchCart();
      toast.success('Items added to cart!');
      navigate('/cart');
    } catch (e) {
      toast.error('Failed to add items to cart: ' + e.message);
    }
  };

  const activeStatuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'accepted', 'preparing'];
  const filteredOrders = orders.filter(order => {
    let matchesFilter;
    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'active') {
      matchesFilter = activeStatuses.includes(order.status);
    } else {
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
        {!isMobile && <Footer />}
      </>
    );
  }

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
              sx={{ position: 'absolute', top: 8, right: 8, minWidth: 0, padding: 1, borderRadius: '50%' }}
              color="primary"
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
                  const isCompleted =
                    selectedOrder.status === status ||
                    [
                      'delivered',
                      'out_for_delivery',
                      'preparing',
                      'accepted',
                      'pending',
                    ].indexOf(selectedOrder.status) >= idx;
                  const date = selectedOrder.statusTimestamps?.[status] || '';
                  const color = isCompleted ? getStatusColor(status) : '#cbd5e1';
                  return (
                    <div className={`timeline-step ${isCompleted ? 'completed' : ''}`} key={status}>
                      <div className="timeline-icon" style={{ color, background: isCompleted ? '#f8fafc' : '#fff', borderRadius: '50%', fontWeight: 700 }}>{getStatusIcon(status)}</div>
                      <div className="timeline-label" style={{ color, fontWeight: isCompleted ? 700 : 500 }}>{statusMap[status]}</div>
                      <div className="timeline-date">{date ? new Date(date).toLocaleString() : ''}</div>
                      {idx < 4 && <div className="timeline-line" style={{ background: color, height: 2, margin: '0 8px', borderRadius: 2 }} />}
                    </div>
                  );
                })}
              </div>
              {/* Order Items and Delivery Details */}
              <div className="order-detail-main-row">
                <div className="order-detail-items">
                  <h3>Order Items</h3>
                  {(selectedOrder.medicines || []).map((item, idx) => (
                    <div
                      className="order-detail-item"
                      key={item.medicine?._id || idx}
                      style={{ cursor: 'pointer', textDecoration: 'underline', color: '#2563eb' }}
                      onClick={e => {
                        e.stopPropagation();
                        if (item.medicine?._id) navigate(`/medicines/${item.medicine._id}`);
                      }}
                    >
                      <img
                        src={item.medicine?.image || '/placeholder-medicine.jpg'}
                        alt={item.medicine?.name}
                        className="order-detail-item-img"
                      />
                      <span>{item.medicine?.name} ({item.quantity})</span>
                    </div>
                  ))}
                  {(selectedOrder.products || []).map((item, idx) => (
                    <div
                      className="order-detail-item"
                      key={item.product?._id || idx}
                      style={{ cursor: 'pointer', textDecoration: 'underline', color: '#2563eb' }}
                      onClick={e => {
                        e.stopPropagation();
                        if (item.product?._id) navigate(`/products/${item.product._id}`);
                      }}
                    >
                      <img
                        src={item.product?.image || '/placeholder-medicine.jpg'}
                        alt={item.product?.name}
                        className="order-detail-item-img"
                      />
                      <span>{item.product?.name} ({item.quantity})</span>
                    </div>
                  ))}
                </div>
                <div className="order-detail-delivery">
                  <h3>Delivery Details</h3>
                  <div className="order-detail-delivery-box">
                    <div><b>Delivery Address:</b><br />{selectedOrder.address}</div>
                    <div style={{ marginTop: 8 }}><b>Contact Number:</b><br />{selectedOrder.phone}</div>
                  </div>
                </div>
              </div>
              {/* Total */}
              <div className="order-detail-total-box">
                <div>
                  <b>Total Amount:</b>
                  <span style={{ float: 'right', fontSize: '1.4rem', fontWeight: 700 }}>
                    ₹{selectedOrder.total?.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#555', marginTop: 4 }}>
                  Payment Method: {selectedOrder.payment?.mode?.toUpperCase() || 'N/A'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
      {/* Support Chat Modal */}
      <Dialog open={supportChatOpen} onClose={() => setSupportChatOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Support - Order Help</DialogTitle>
        <DialogContent>
          {selectedOrder && user && (
            <ChatWindow
              currentUser={user}
              orderId={selectedOrder._id}
            />
          )}
          <div style={{ marginTop: 12, fontSize: 13, color: '#888' }}>
            Raise your query regarding this order. Our support team will assist you.
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSupportChatOpen(false)} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
      {/* MUI Dialog for rating */}
      <Dialog open={rateOrderOpen || rateDeliveryOpen} onClose={() => { setRateOrderOpen(false); setRateDeliveryOpen(false); }}>
        <DialogTitle>{ratingType === 'delivery' ? 'Rate Delivery' : 'Rate Order Item'}</DialogTitle>
        <DialogContent>
          <Rating
            name="order-rating"
            value={ratingValue}
            onChange={(_, newValue) => setRatingValue(newValue)}
            size="large"
          />
          <TextField
            label="Comment"
            multiline
            minRows={2}
            fullWidth
            value={ratingComment}
            onChange={e => setRatingComment(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRateOrderOpen(false); setRateDeliveryOpen(false); }} disabled={rateLoading}>Cancel</Button>
          <Button onClick={submitRating} disabled={rateLoading || !ratingValue} variant="contained">Submit</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />
      {!isMobile && <Footer />}
    </>
  );
};

export default Orders; 