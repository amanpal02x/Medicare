import axios from 'axios';

const API_BASE = '/api/delivery';

export const getProfile = () => axios.get(`${API_BASE}/profile`);
export const getOrders = (status = 'active') => axios.get(`${API_BASE}/orders?status=${status}`);
export const getAvailableOrders = () => axios.get(`${API_BASE}/available-orders`);
export const getEarnings = (period = 'today') => axios.get(`${API_BASE}/earnings?period=${period}`);
export const getPerformance = () => axios.get(`${API_BASE}/performance`);
export const updateOnlineStatus = (isOnline) => axios.put(`${API_BASE}/online-status`, { isOnline });
export const updateProfile = (profileData) => axios.put(`${API_BASE}/profile`, profileData); 