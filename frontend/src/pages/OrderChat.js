import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { getOrderById } from '../services/orders';
import './OrderChat.css';

const OrderChat = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/api/support/chat/${orderId}`);
        setMessages(res.data.messages || []);
        setStatus(res.data.status || 'open');
      } catch (err) {
        setError('Failed to load chat.');
      } finally {
        setLoading(false);
      }
    };
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchChat();
    fetchOrder();
  }, [orderId]);

  if (loading) return <div>Loading chat...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (status === 'closed') return <div style={{ color: '#ef4444', fontWeight: 600, fontSize: 18, textAlign: 'center', marginTop: 40 }}>This query is closed.</div>;

  // Debug: log the order object to inspect its structure
  console.log('Order object:', order);
  // Pass orderId and currentUser to ChatWindow for further chat
  return (
    <div className="order-chat-container">
      {order && (
        <div
          className="order-summary-card"
          onClick={() => navigate(`/order-detail/${order.orderNumber || order._id}`)}
          title="View full order details"
          onMouseOver={e => { e.currentTarget.style.boxShadow = '0 12px 36px rgba(59,130,246,0.16)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; }}
          onMouseOut={e => { e.currentTarget.style.boxShadow = '0 6px 32px rgba(59,130,246,0.08)'; e.currentTarget.style.transform = 'none'; }}
        >
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, color: '#222' }}>
            Order Number: <span style={{ fontWeight: 500 }}>{order.orderNumber || order._id}</span>
          </div>
          <div style={{ fontWeight: 600, color: '#3b82f6', marginBottom: 2 }}>
            Status: <span style={{ fontWeight: 500, color: '#222' }}>{order.status}</span>
          </div>
          {order.createdAt && <div style={{ color: '#666', fontSize: 15, marginBottom: 8 }}><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</div>}
          <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 2, color: '#222' }}>Order Items:</div>
          <div style={{ marginLeft: 8 }}>
            {(order.medicines && order.medicines.length > 0) ? (
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {order.medicines.map((item, idx) => (
                  <li key={item._id || idx} style={{ marginBottom: 4, fontSize: 15 }}>
                    <span style={{ fontWeight: 500 }}>{item.medicine?.name || item.name || item.medicineName || item.productName}</span>
                    {item.quantity && <span> &times; {item.quantity}</span>}
                    {item.price && <span style={{ color: '#3b82f6', marginLeft: 8 }}>₹{item.price}</span>}
                  </li>
                ))}
              </ul>
            ) : (order.products && order.products.length > 0) ? (
              <ul style={{ paddingLeft: 16, margin: 0 }}>
                {order.products.map((item, idx) => (
                  <li key={item._id || idx} style={{ marginBottom: 4, fontSize: 15 }}>
                    <span style={{ fontWeight: 500 }}>{item.product?.name || item.name || item.productName}</span>
                    {item.quantity && <span> &times; {item.quantity}</span>}
                    {item.price && <span style={{ color: '#3b82f6', marginLeft: 8 }}>₹{item.price}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: '#888', fontSize: 14 }}>No items found for this order.</div>
            )}
          </div>
          <span style={{ position: 'absolute', right: 18, top: 24, fontSize: 22, color: '#3b82f6', display: 'flex', alignItems: 'center' }}>&#8594;</span>
        </div>
      )}
      <div style={{ flex: 1, minWidth: 320, maxWidth: 700 }}>
        <ChatWindow currentUser={user} orderId={orderId} />
      </div>
    </div>
  );
};

export default OrderChat; 