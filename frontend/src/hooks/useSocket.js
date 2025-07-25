// useSocket.js
// Custom React hook for Socket.IO real-time integration for delivery boy app
// Usage: const { socket, sendLocation, onOrderRequest, ... } = useSocket(user)

import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://medicare-ydw4.onrender.com';

export default function useSocket(user) {
  const socketRef = useRef(null);

  // Connect/disconnect logic
  useEffect(() => {
    if (!user || !user.token) return;
    const socket = io(SOCKET_URL, {
      auth: { token: user.token },
      query: { userId: user._id, role: user.role },
      transports: ['websocket'],
      reconnection: true,
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Emit location update
  const sendLocation = useCallback((location) => {
    if (socketRef.current) {
      socketRef.current.emit('delivery:locationUpdate', location);
    }
  }, []);

  // Emit order status update
  const sendOrderStatus = useCallback((orderId, status) => {
    if (socketRef.current) {
      socketRef.current.emit('delivery:orderStatusUpdate', { orderId, status });
    }
  }, []);

  // Listen for new order requests
  const onOrderRequest = useCallback((handler) => {
    if (socketRef.current) {
      socketRef.current.on('delivery:newOrderRequest', handler);
      return () => socketRef.current.off('delivery:newOrderRequest', handler);
    }
    return () => {};
  }, []);

  // Listen for other events (order updates, etc.)
  const onEvent = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      return () => socketRef.current.off(event, handler);
    }
    return () => {};
  }, []);

  // Start/stop location tracking
  const startLocationTracking = useCallback((onUpdate) => {
    if (!navigator.geolocation) return null;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const location = { lat: latitude, lng: longitude, timestamp: Date.now() };
        sendLocation(location);
        if (onUpdate) onUpdate(location);
      },
      (err) => { console.error('Location error', err); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return watchId;
  }, [sendLocation]);

  const stopLocationTracking = useCallback((watchId) => {
    if (navigator.geolocation && watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return {
    socket: socketRef.current,
    sendLocation,
    sendOrderStatus,
    onOrderRequest,
    onEvent,
    startLocationTracking,
    stopLocationTracking,
  };
} 