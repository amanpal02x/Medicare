import React, { createContext, useState, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/auth';
import { useSocket } from './SocketContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize user and token from localStorage for persistent login
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Add socket context
  const socketContext = useSocket ? useSocket() : {};
  const joinRoom = socketContext.joinRoom;

  const login = async (email, password) => {
    const data = await apiLogin({ email, password });
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Join socket room after login
      if (joinRoom && data.user) {
        if (data.user.role === 'user') joinRoom('user', data.user._id);
        if (data.user.role === 'pharmacist') joinRoom('pharmacist', data.user._id);
        if (data.user.role === 'deliveryBoy') joinRoom('delivery', data.user._id);
      }
    }
    return data;
  };

  const register = async (registrationData) => {
    const data = await apiRegister(registrationData);
    // Only auto-login if not pharmacist or delivery boy
    if (data.token && data.user && data.user.role !== 'pharmacist' && data.user.role !== 'deliveryBoy') {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Join socket room after registration
      if (joinRoom && data.user) {
        if (data.user.role === 'user') joinRoom('user', data.user._id);
        if (data.user.role === 'pharmacist') joinRoom('pharmacist', data.user._id);
        if (data.user.role === 'deliveryBoy') joinRoom('delivery', data.user._id);
      }
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 