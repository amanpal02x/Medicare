import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import notificationSound from '../utils/notificationSound';

const SocketContext = createContext();

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://medicare-ydw4.onrender.com';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Determine user role from localStorage or context
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (error) {
        console.warn('Could not determine user role from token');
      }
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],  // 👈 enable fallback
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5
    });
    

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔌 Socket.IO connected');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket.IO disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 Socket.IO connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔌 Socket.IO reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔌 Socket.IO reconnection error:', error);
      setConnectionError(error.message);
    });

    // Order acceptance notification handlers
    newSocket.on('orderAccepted', (data) => {
      console.log('📦 Order accepted notification:', data);
      
      // Play role-specific sound
      if (userRole === 'delivery') {
        notificationSound.playDeliverySound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Order Accepted',
        message: data.message,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        deliveryBoy: data.deliveryBoy,
        timestamp: new Date()
      });
    });

    newSocket.on('orderRejected', (data) => {
      console.log('❌ Order rejected notification:', data);
      
      // Play role-specific sound
      if (userRole === 'delivery') {
        notificationSound.playDeliverySound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Order Rejected',
        message: data.message,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        deliveryBoy: data.deliveryBoy,
        reason: data.reason,
        timestamp: new Date()
      });
    });

    newSocket.on('orderAcceptedByPharmacist', (data) => {
      console.log('👨‍⚕️ Order accepted by pharmacist notification:', data);
      
      // Play role-specific sound
      if (userRole === 'delivery') {
        notificationSound.playDeliverySound();
      } else if (userRole === 'pharmacist') {
        notificationSound.playPharmacistSound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Order Accepted by Pharmacist',
        message: data.message,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerInfo: data.customerInfo,
        amount: data.amount,
        pharmacist: data.pharmacist,
        timestamp: new Date()
      });
    });

    newSocket.on('orderReadyForDelivery', (data) => {
      console.log('📦 Order ready for delivery notification:', data);
      
      // Play role-specific sound
      if (userRole === 'delivery') {
        notificationSound.playDeliverySound();
      } else if (userRole === 'pharmacist') {
        notificationSound.playPharmacistSound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Order Ready for Delivery',
        message: data.message,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        customerInfo: data.customerInfo,
        amount: data.amount,
        pharmacist: data.pharmacist,
        timestamp: new Date()
      });
    });

    newSocket.on('orderStatusUpdated', (data) => {
      console.log('📋 Order status updated notification:', data);
      
      // Play role-specific sound
      if (userRole === 'delivery') {
        notificationSound.playDeliverySound();
      } else if (userRole === 'pharmacist') {
        notificationSound.playPharmacistSound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Order Status Updated',
        message: data.message,
        orderId: data.orderId,
        status: data.status,
        timestamp: new Date()
      });
    });

    newSocket.on('orderClaimed', (data) => {
      console.log('👨‍⚕️ Order claimed notification:', data);
      
      // Play role-specific sound
      if (userRole === 'pharmacist') {
        notificationSound.playPharmacistSound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Order Claimed',
        message: data.message,
        orderId: data.orderId,
        pharmacist: data.pharmacist,
        timestamp: new Date()
      });
    });

    newSocket.on('orderNoLongerAvailable', (data) => {
      console.log('🚫 Order no longer available notification:', data);
      setNotifications(prev => prev.filter(n => n.orderId !== data.orderId && n.orderNumber !== data.orderNumber));
    });

    // New order notifications for pharmacists
    newSocket.on('newOrder', (data) => {
      console.log('🆕 New order notification:', data);
      
      // Play pharmacist-specific sound for new orders
      if (userRole === 'pharmacist') {
        notificationSound.playPharmacistSound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'New Order Received',
        message: `New order #${data._id?.toString().slice(-6) || 'N/A'} received from ${data.user?.name || 'Customer'}`,
        orderId: data._id,
        orderNumber: data._id?.toString().slice(-6),
        customerInfo: data.user,
        amount: data.total,
        priority: data.priority || 'normal',
        timestamp: new Date()
      });
    });

    // Order assigned to specific pharmacist
    newSocket.on('orderAssigned', (data) => {
      console.log('📋 Order assigned notification:', data);
      
      // Play pharmacist-specific sound for assigned orders
      if (userRole === 'pharmacist') {
        notificationSound.playPharmacistSound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'success',
        title: 'Order Assigned to You',
        message: `Order #${data._id?.toString().slice(-6) || 'N/A'} has been assigned to you`,
        orderId: data._id,
        orderNumber: data._id?.toString().slice(-6),
        customerInfo: data.user,
        amount: data.total,
        priority: 'high',
        timestamp: new Date()
      });
    });

    // Order status changed notifications
    newSocket.on('orderStatusChanged', (data) => {
      console.log('🔄 Order status changed notification:', data);
      
      // Play role-specific sound
      if (userRole === 'pharmacist') {
        notificationSound.playPharmacistSound();
      } else if (userRole === 'delivery') {
        notificationSound.playDeliverySound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'info',
        title: 'Order Status Changed',
        message: `Order status has been updated`,
        orderId: data.orderId,
        status: data.status,
        pharmacist: data.pharmacist,
        timestamp: new Date()
      });
    });

    // Order cancelled notifications
    newSocket.on('orderCancelled', (data) => {
      console.log('❌ Order cancelled notification:', data);
      
      // Play role-specific sound
      if (userRole === 'pharmacist') {
        notificationSound.playPharmacistSound();
      } else if (userRole === 'delivery') {
        notificationSound.playDeliverySound();
      } else {
        notificationSound.play();
      }
      
      addNotification({
        id: Date.now(),
        type: 'warning',
        title: 'Order Cancelled',
        message: data.message,
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        timestamp: new Date()
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userRole]);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const joinRoom = (roomType, id = null) => {
    if (socket && isConnected) {
      switch (roomType) {
        case 'pharmacist':
          socket.emit('join-pharmacist', id);
          console.log(`👨‍⚕️ Joined pharmacist room: ${id}`);
          break;
        case 'admin':
          socket.emit('join-admin');
          console.log('👨‍💼 Joined admin room');
          break;
        case 'delivery':
          socket.emit('join-delivery', id);
          console.log(`🚚 Joined delivery room: ${id}`);
          break;
        case 'user':
          socket.emit('join-user', id);
          console.log(`👤 Joined user room: ${id}`);
          break;
        default:
          console.warn('Unknown room type:', roomType);
      }
    }
  };

  const leaveRoom = (roomType, id = null) => {
    if (socket && isConnected) {
      switch (roomType) {
        case 'pharmacist':
          socket.emit('leave-pharmacist', id);
          break;
        case 'admin':
          socket.emit('leave-admin');
          break;
        case 'delivery':
          socket.emit('leave-delivery', id);
          break;
        case 'user':
          socket.emit('leave-user', id);
          break;
        default:
          console.warn('Unknown room type:', roomType);
      }
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    notifications,
    userRole,
    addNotification,
    removeNotification,
    clearNotifications,
    joinRoom,
    leaveRoom
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 