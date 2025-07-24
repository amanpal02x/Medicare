import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

/**
 * ChatWindow component for support ticket chat
 * @param {object} props
 *   - currentUser: { _id, role, name }
 *   - orderId: string (optional, for order-related support)
 */
const ChatWindow = ({ currentUser, orderId }) => {
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('open');
  const messagesEndRef = useRef(null);

  // Fetch or create ticket on mount
  useEffect(() => {
    const fetchOrCreateTicket = async () => {
      setLoading(true);
      setError('');
      try {
        // Try to find an open ticket for this user/order
        const res = await axios.get('/api/support');
        let found = null;
        if (orderId) {
          found = res.data.find(t => t.order && t.order.toString() === orderId && t.status !== 'closed');
        }
        if (!found && orderId) {
          // No ticket found, create one on first message
          setTicket(null);
          setMessages([]);
          setStatus('open');
        } else if (found) {
          setTicket(found);
          setMessages(found.conversation || []);
          setStatus(found.status);
        } else if (!orderId && res.data.length > 0) {
          // fallback: show most recent open ticket
          setTicket(res.data[0]);
          setMessages(res.data[0].conversation || []);
          setStatus(res.data[0].status);
        }
      } catch (err) {
        setError('Failed to load support ticket.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrCreateTicket();
    // eslint-disable-next-line
  }, [orderId, currentUser?._id]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle file input
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Send a message (with optional images)
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && files.length === 0) return;
    setLoading(true);
    setError('');
    try {
      let newTicket = ticket;
      let msgRes;
      if (!ticket) {
        // Create ticket on first message
        const formData = new FormData();
        formData.append('message', input);
        if (orderId) formData.append('order', orderId); // Ensure orderId is sent as 'order'
        console.log('DEBUG: Creating ticket with orderId =', orderId); // Debug log
        files.forEach(f => formData.append('files', f));
        msgRes = await axios.post('/api/support', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        newTicket = msgRes.data;
        setTicket(newTicket);
        setStatus(newTicket.status);
        setMessages(newTicket.conversation || []);
      } else {
        // Reply to existing ticket
        const formData = new FormData();
        formData.append('message', input);
        files.forEach(f => formData.append('files', f));
        msgRes = await axios.post(`/api/support/${ticket._id}/reply`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessages(msgRes.data.conversation || []);
        setStatus(msgRes.data.status);
      }
      setInput('');
      setFiles([]);
    } catch (err) {
      setError('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  // Show ticket status and allow user to close if open
  const handleCloseTicket = async () => {
    if (!ticket) return;
    setLoading(true);
    setError('');
    try {
      await axios.put(`/api/admin/support/${ticket._id}/close`); // You may need to adjust endpoint/role
      setStatus('closed');
    } catch (err) {
      setError('Failed to close ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: 8, width: 350, height: 400, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ padding: 8, borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 15, color: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Support Chat
        <span style={{ fontSize: 12, color: status === 'closed' ? '#ef4444' : '#10b981', fontWeight: 700, marginLeft: 8 }}>{status === 'closed' ? 'Closed' : 'Open'}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {loading && <div style={{ color: '#888', textAlign: 'center' }}>Loading...</div>}
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ textAlign: msg.sender?._id === currentUser._id ? 'right' : 'left', margin: '4px 0' }}>
            <span style={{ fontWeight: 'bold', fontSize: 12 }}>{msg.sender?.name || (msg.sender?._id === currentUser._id ? 'You' : 'Support')}</span>
            <div style={{ display: 'inline-block', background: msg.sender?._id === currentUser._id ? '#e0f7fa' : '#f1f1f1', borderRadius: 6, padding: '4px 8px', marginLeft: 4, marginRight: 4, maxWidth: 220, wordBreak: 'break-word' }}>
              {msg.message}
              {msg.files && msg.files.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  {msg.files.map((file, i) => (
                    <a key={i} href={file} target="_blank" rel="noopener noreferrer">
                      <img src={file} alt="attachment" style={{ maxWidth: 80, maxHeight: 80, borderRadius: 4, marginRight: 4, marginTop: 2, border: '1px solid #eee' }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div style={{ fontSize: 10, color: '#888' }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {status !== 'closed' && (
        <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14 }}
              disabled={loading}
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ width: 90 }}
              disabled={loading}
            />
            <button type="submit" style={{ marginLeft: 4, padding: '4px 12px' }} disabled={loading || (!input.trim() && files.length === 0)}>Send</button>
          </div>
          {files.length > 0 && (
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              {files.map((file, idx) => (
                <img key={idx} src={URL.createObjectURL(file)} alt="preview" style={{ maxWidth: 40, maxHeight: 40, borderRadius: 3, border: '1px solid #eee' }} />
              ))}
            </div>
          )}
        </form>
      )}
      {status === 'open' && ticket && (
        <button onClick={handleCloseTicket} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, margin: 8, padding: '4px 0', fontWeight: 600, cursor: 'pointer' }} disabled={loading}>Mark as Solved</button>
      )}
    </div>
  );
};

export default ChatWindow; 