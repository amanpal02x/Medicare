import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderById } from '../services/orders';
import ChatWindow from '../components/ChatWindow';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpIcon from '@mui/icons-material/Help';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import './MobileOrderDetail.css';

const MobileOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [supportChatOpen, setSupportChatOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchOrder() {
      setLoading(true);
      setError('');
      try {
        const data = await getOrderById(orderId);
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
  }, [orderId, user, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      processing: '#8b5cf6',
      out_for_delivery: '#10b981',
      delivered: '#059669',
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

  const handleOrderAgain = async (order) => {
    try {
      // Implementation for ordering again
      toast.success('Items added to cart!');
      navigate('/cart');
    } catch (error) {
      toast.error('Failed to add items to cart');
    }
  };

  if (loading) {
    return (
      <div className="mobile-order-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mobile-order-detail-error">
        <p>{error || 'Order not found'}</p>
        <button onClick={() => navigate('/orders')}>Back to Orders</button>
      </div>
    );
  }

  return (
    <div className="mobile-order-detail-container">
      {/* Header */}
      <div className="mobile-order-detail-header">
        <button 
          className="mobile-back-button"
          onClick={() => navigate('/orders')}
        >
          <ArrowBackIcon />
        </button>
        <div className="mobile-order-detail-title">
          <h2>Order #{order.orderNumber || order._id}</h2>
          <button
            className="mobile-help-button"
            onClick={() => setSupportChatOpen(true)}
            aria-label="Help with this order"
          >
            <HelpIcon />
          </button>
        </div>
      </div>

      {/* Order Content */}
      <div className="mobile-order-detail-content">
        {/* Order Timeline */}
        <div className="mobile-order-timeline">
          {['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'].map((status, idx) => {
            const isCompleted = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered'].indexOf(order.status) >= idx;
            const isCurrent = order.status === status;
            
            return (
              <div key={status} className={`mobile-timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="mobile-timeline-icon">
                  {isCompleted ? '✓' : '○'}
                </div>
                <div className="mobile-timeline-label">
                  {getStatusText(status)}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Order Items */}
        <div className="mobile-order-items">
          <h4>Order Items</h4>
          {order.products?.map((item, index) => (
            <div key={index} className="mobile-order-item-detail">
              <img src={item.product?.image || '/placeholder-medicine.jpg'} alt={item.product?.name} />
              <div>
                <p>{item.product?.name}</p>
                <p>Qty: {item.quantity}</p>
                <p>₹{item.price}</p>
              </div>
            </div>
          ))}
          {order.medicines?.map((item, index) => (
            <div key={index} className="mobile-order-item-detail">
              <img src={item.medicine?.image || '/placeholder-medicine.jpg'} alt={item.medicine?.name} />
              <div>
                <p>{item.medicine?.name}</p>
                <p>Qty: {item.quantity}</p>
                <p>₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="mobile-order-summary">
          <h4>Order Summary</h4>
          <div className="mobile-summary-row">
            <span>Subtotal:</span>
            <span>₹{order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="mobile-summary-row">
            <span>Delivery Fee:</span>
            <span>₹{order.deliveryFee?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="mobile-summary-row total">
            <span>Total:</span>
            <span>₹{order.total?.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mobile-order-actions">
          {(order.status === 'delivered' || order.status === 'cancelled') && (
            <button 
              className="mobile-order-again-btn"
              onClick={() => handleOrderAgain(order)}
            >
              Order Again
            </button>
          )}
        </div>
      </div>

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
          Support Chat - Order #{order?.orderNumber || order?._id}
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
            orderId={order?._id}
          />
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default MobileOrderDetail; 