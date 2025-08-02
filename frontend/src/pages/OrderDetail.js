import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getOrderById } from '../services/orders';
import './OrderDetail.css';
import ChatWindow from '../components/ChatWindow';
import { getPharmacistById } from '../services/adminPharmacies';
import { getAllDeliveryBoys, getDeliveryBoyById, assignDeliveryBoyToOrder } from '../services/adminDeliveries';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';

const OrderDetail = ({ standalone = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pharmacistDetails, setPharmacistDetails] = useState(null);
  const [pharmacistDialogOpen, setPharmacistDialogOpen] = useState(false);
  const [deliveryBoyDialogOpen, setDeliveryBoyDialogOpen] = useState(false);
  const [deliveryBoyDetails, setDeliveryBoyDetails] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [availableDeliveryBoys, setAvailableDeliveryBoys] = useState([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState('');
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMobile = window.innerWidth <= 600;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchOrder() {
      setLoading(true);
      setError('');
      try {
        const data = await getOrderById(id);
        if (data && data.order) {
          setOrder(data.order);
        } else {
          setOrder(data);
        }
      } catch (err) {
        setError('Failed to load order details');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id, user, navigate]);

  // Fetch pharmacist details when order loads
  useEffect(() => {
    if (order && order.pharmacist) {
      getPharmacistById(order.pharmacist._id || order.pharmacist)
        .then(setPharmacistDetails)
        .catch(() => setPharmacistDetails(null));
    }
  }, [order]);

  const handleOpenPharmacistDialog = () => setPharmacistDialogOpen(true);
  const handleClosePharmacistDialog = () => setPharmacistDialogOpen(false);

  const handleOpenDeliveryBoyDialog = async () => {
    if (order && order.deliveryBoy) {
      const details = await getDeliveryBoyById(order.deliveryBoy._id || order.deliveryBoy);
      setDeliveryBoyDetails(details);
      setDeliveryBoyDialogOpen(true);
    }
  };
  const handleCloseDeliveryBoyDialog = () => setDeliveryBoyDialogOpen(false);

  const handleOpenAssignDialog = async () => {
    setAssignDialogOpen(true);
    setAssigning(true);
    try {
      const data = await getAllDeliveryBoys({ status: 'active' });
      setAvailableDeliveryBoys(data.deliveryBoys || data);
    } catch {
      setAvailableDeliveryBoys([]);
    }
    setAssigning(false);
  };
  const handleCloseAssignDialog = () => setAssignDialogOpen(false);

  const handleAssignDeliveryBoy = async () => {
    if (!selectedDeliveryBoy) return;
    setAssigning(true);
    try {
      await assignDeliveryBoyToOrder(order._id, selectedDeliveryBoy);
      setAssignDialogOpen(false);
      window.location.reload(); // Or refetch order
    } catch {
      // handle error
    }
    setAssigning(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <>
        {standalone && <Header />}
        <div className="order-detail-container">
          <div className="order-detail-loading">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        {standalone && <Header />}
        <div className="order-detail-container">
          <div className="order-detail-error">
            <h2>Order Not Found</h2>
            <p>{error || 'The order you are looking for does not exist.'}</p>
            <button onClick={() => navigate('/orders')} className="back-btn">
              View All Orders
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {standalone && <Header />}
      <div className="order-detail-container">
        <div className="order-detail-main-box">
          <div className="order-detail-content">
            {/* Order Header */}
            <div className="order-header">
              <div className="order-header-left">
                <h1>Order #{order.orderNumber || order._id}</h1>
                <p>Placed on {formatDate(order.createdAt)}</p>
              </div>
              {/* Hamburger for mobile */}
              {isMobile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MenuIcon
                    style={{ cursor: 'pointer', fontSize: 32 }}
                    onClick={() => setDrawerOpen(true)}
                    data-testid="order-status-drawer-btn"
                  />
                  {/* Show current status next to hamburger on mobile */}
                  <div className="order-status" style={{ margin: 0 }}>
                    <span className="status-icon">{getStatusIcon(order.status)}</span>
                    <span 
                      className="status-text"
                      style={{ color: getStatusColor(order.status), fontSize: 16 }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="order-status">
                  <span className="status-icon">{getStatusIcon(order.status)}</span>
                  <span 
                    className="status-text"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                  {/* Current status timestamp inside the card, stacked below */}
                  {(() => {
                    let label = '';
                    let value = '';
                    if (order.status === 'delivered' && order.deliveredAt) {
                      label = 'Delivered on';
                      value = formatDate(order.deliveredAt);
                    } else if (order.status === 'out_for_delivery' && order.outForDeliveryAt) {
                      label = 'Out for delivery on';
                      value = formatDate(order.outForDeliveryAt);
                    } else if (order.status === 'processing' && order.processingAt) {
                      label = 'Processing on';
                      value = formatDate(order.processingAt);
                    } else if (order.status === 'confirmed' && order.confirmedAt) {
                      label = 'Confirmed on';
                      value = formatDate(order.confirmedAt);
                    } else if (order.status === 'pending' && order.createdAt) {
                      label = 'Placed on';
                      value = formatDate(order.createdAt);
                    }
                    return label && value ? (
                      <div style={{ fontSize: 14, color: '#000', marginTop: 2 }}>
                        {value}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Order Progress - Desktop only */}
            {!isMobile && (
              <div className="order-progress">
                <div className="progress-steps">
                  <div className={`progress-step ${order.status !== 'cancelled' ? 'completed' : ''}`}>
                    <div className="step-icon">📋</div>
                    <div className="step-label">Order Placed</div>
                  </div>
                  <div className={`progress-step ${['confirmed', 'processing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-icon">✅</div>
                    <div className="step-label">Confirmed</div>
                  </div>
                  <div className={`progress-step ${['processing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-icon">⚙️</div>
                    <div className="step-label">Processing</div>
                  </div>
                  <div className={`progress-step ${['out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-icon">🚚</div>
                    <div className="step-label">Out for Delivery</div>
                  </div>
                  <div className={`progress-step ${order.status === 'delivered' ? 'completed' : ''}`}>
                    <div className="step-icon">📦</div>
                    <div className="step-label">Delivered</div>
                  </div>
                </div>
              </div>
            )}

            {/* Drawer for mobile status/progress */}
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              PaperProps={{ style: { width: 280 } }}
            >
              <div style={{ padding: 16 }}>
                {/* Order placed timestamp */}
                <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
                  Placed on {formatDate(order.createdAt)}
                </div>
                <div className="order-status" style={{ marginBottom: 24 }}>
                  <span className="status-icon">{getStatusIcon(order.status)}</span>
                  <span 
                    className="status-text"
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="order-progress">
                  <div className="progress-steps">
                    <div className={`progress-step ${order.status !== 'cancelled' ? 'completed' : ''}`}>
                      <div className="step-icon">📋</div>
                      <div className="step-label">Order Placed</div>
                    </div>
                    <div className={`progress-step ${['confirmed', 'processing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                      <div className="step-icon">✅</div>
                      <div className="step-label">Confirmed</div>
                    </div>
                    <div className={`progress-step ${['processing', 'out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                      <div className="step-icon">⚙️</div>
                      <div className="step-label">Processing</div>
                    </div>
                    <div className={`progress-step ${['out_for_delivery', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                      <div className="step-icon">🚚</div>
                      <div className="step-label">Out for Delivery</div>
                    </div>
                    <div className={`progress-step ${order.status === 'delivered' ? 'completed' : ''}`}>
                      <div className="step-icon">📦</div>
                      <div className="step-label">Delivered</div>
                    </div>
                  </div>
                </div>
                {/* Delivered timestamp for delivered orders */}
                {order.status === 'delivered' && order.deliveredAt && (
                  <div style={{ marginTop: 16, fontSize: 14, color: '#000' }}>
                    Delivered on {formatDate(order.deliveredAt)}
                  </div>
                )}
              </div>
            </Drawer>

            <div className="order-detail-layout">
              {/* Order Information */}
              <div className="order-info-section">
                {/* Pharmacist Info Card */}
                {pharmacistDetails && (
                  <div className="info-card">
                    <h3>Pharmacy Information</h3>
                    <div className="info-grid">
                      <div className="info-item"><span className="info-label">Pharmacy Name:</span> <span className="info-value">{pharmacistDetails.pharmacyName || 'N/A'}</span></div>
                      <div className="info-item"><span className="info-label">Contact:</span> <span className="info-value">{pharmacistDetails.contact || 'N/A'}</span></div>
                      <div className="info-item"><span className="info-label">Address:</span> <span className="info-value">{pharmacistDetails.address || 'N/A'}</span></div>
                      <div className="info-item"><span className="info-label">Owner:</span> <span className="info-value">{pharmacistDetails.user?.name || 'N/A'}</span></div>
                      <div className="info-item"><span className="info-label">Email:</span> <span className="info-value">{pharmacistDetails.user?.email || 'N/A'}</span></div>
                      <div className="info-item"><span className="info-label">Phone:</span> <span className="info-value">{pharmacistDetails.user?.phone || 'N/A'}</span></div>
                      <div className="info-item"><Button size="small" variant="outlined" onClick={handleOpenPharmacistDialog}>View Full Details</Button></div>
                    </div>
                  </div>
                )}
                <div className="info-card">
                  <h3>Order Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Order ID:</span>
                      <span className="info-value">{order.orderNumber || order._id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Order Date:</span>
                      <span className="info-value">{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Payment Method:</span>
                      <span className="info-value">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Total Amount:</span>
                      <span className="info-value">₹{order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Delivery Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Delivery Address:</span>
                      <span className="info-value">{order.address}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Contact Number:</span>
                      <span className="info-value">{order.phone}</span>
                    </div>
                    {order.deliveryBoy && (
                      <div className="info-item">
                        <span className="info-label">Delivery Partner:</span>
                        <span className="info-value">
                          <Button size="small" variant="text" onClick={handleOpenDeliveryBoyDialog} style={{ textTransform: 'none', padding: 0 }}>
                            {order.deliveryBoy.personalInfo?.fullName || order.deliveryBoy.name || 'View'}
                          </Button>
                        </span>
                      </div>
                    )}
                    {!order.deliveryBoy && order.status !== 'delivered' && (
                      <div className="info-item">
                        <span className="info-label">Assign Delivery Boy:</span>
                        <Button size="small" variant="contained" onClick={handleOpenAssignDialog}>Assign</Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items-section">
                <div className="info-card">
                  <h3>Order Items</h3>
                  <div className="order-items">
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          <img 
                            src={item.item?.image || '/placeholder-medicine.jpg'} 
                            alt={item.item?.name}
                          />
                        </div>
                        <div className="item-details">
                          <h4>{item.item?.name}</h4>
                          <p className="item-category">{item.itemType === 'medicine' ? 'Medicine' : 'Product'}</p>
                          <p className="item-quantity">Quantity: {item.quantity}</p>
                        </div>
                        <div className="item-price">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>₹{order.subtotal?.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax:</span>
                      <span>₹{order.tax?.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>₹{order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="order-actions">
              <button 
                onClick={() => navigate('/orders')}
                className="action-btn secondary"
              >
                View All Orders
              </button>
              <button 
                onClick={() => navigate('/medicines')}
                className="action-btn primary"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        {/* Removed Chat with Pharmacist section here */}
      </div>
      {/* Pharmacist Detail Dialog */}
      <Dialog open={pharmacistDialogOpen} onClose={handleClosePharmacistDialog} maxWidth="md" fullWidth>
        <DialogTitle>Pharmacist Details</DialogTitle>
        <DialogContent>
          {pharmacistDetails ? (
            <div>
              <p><strong>Pharmacy Name:</strong> {pharmacistDetails.pharmacyName || 'N/A'}</p>
              <p><strong>Contact:</strong> {pharmacistDetails.contact || 'N/A'}</p>
              <p><strong>Address:</strong> {pharmacistDetails.address || 'N/A'}</p>
              <p><strong>Timings:</strong> {pharmacistDetails.timings || 'N/A'}</p>
              <p><strong>KYC Docs:</strong> {Array.isArray(pharmacistDetails.kycDocs) && pharmacistDetails.kycDocs.length > 0 ? pharmacistDetails.kycDocs.join(', ') : 'N/A'}</p>
              <p><strong>Status:</strong> {pharmacistDetails.status || 'N/A'}</p>
              <p><strong>Verified:</strong> {pharmacistDetails.isVerified ? 'Yes' : 'No'}</p>
              <p><strong>Joined:</strong> {pharmacistDetails.createdAt ? new Date(pharmacistDetails.createdAt).toLocaleString() : 'N/A'}</p>
              <p><strong>Owner Name:</strong> {pharmacistDetails.user?.name || 'N/A'}</p>
              <p><strong>Owner Email:</strong> {pharmacistDetails.user?.email || 'N/A'}</p>
              <p><strong>Owner Phone:</strong> {pharmacistDetails.user?.phone || 'N/A'}</p>
              <p><strong>Total Medicines:</strong> {pharmacistDetails.statistics?.medicinesCount ?? 'N/A'}</p>
              <p><strong>Total Orders:</strong> {pharmacistDetails.statistics?.ordersCount ?? 'N/A'}</p>
            </div>
          ) : <CircularProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePharmacistDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Delivery Boy Detail Dialog */}
      <Dialog open={deliveryBoyDialogOpen} onClose={handleCloseDeliveryBoyDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Delivery Boy Details</DialogTitle>
        <DialogContent>
          {deliveryBoyDetails ? (
            <div>
              <p><strong>Name:</strong> {deliveryBoyDetails.personalInfo?.fullName || 'N/A'}</p>
              <p><strong>Email:</strong> {deliveryBoyDetails.user?.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {deliveryBoyDetails.personalInfo?.phone || 'N/A'}</p>
              <p><strong>Vehicle Type:</strong> {deliveryBoyDetails.vehicleInfo?.vehicleType || 'N/A'}</p>
              <p><strong>Vehicle Number:</strong> {deliveryBoyDetails.vehicleInfo?.vehicleNumber || 'N/A'}</p>
              <p><strong>Status:</strong> {deliveryBoyDetails.status || 'N/A'}</p>
              <p><strong>Total Deliveries:</strong> {deliveryBoyDetails.performance?.totalDeliveries ?? 'N/A'}</p>
              <p><strong>Success Rate:</strong> {deliveryBoyDetails.performance?.successRate ?? 'N/A'}%</p>
              <p><strong>Average Rating:</strong> {deliveryBoyDetails.ratings?.average ?? 'N/A'}</p>
            </div>
          ) : <CircularProgress />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeliveryBoyDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Assign Delivery Boy Dialog */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Delivery Boy</DialogTitle>
        <DialogContent>
          {assigning ? <CircularProgress /> : (
            <Select
              value={selectedDeliveryBoy}
              onChange={e => setSelectedDeliveryBoy(e.target.value)}
              fullWidth
              displayEmpty
            >
              <MenuItem value="" disabled>Select Delivery Boy</MenuItem>
              {availableDeliveryBoys.map(boy => (
                <MenuItem key={boy._id} value={boy._id}>
                  {boy.personalInfo?.fullName || boy.name || boy.user?.email}
                </MenuItem>
              ))}
            </Select>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancel</Button>
          <Button onClick={handleAssignDeliveryBoy} disabled={!selectedDeliveryBoy || assigning} variant="contained" color="primary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderDetail;
