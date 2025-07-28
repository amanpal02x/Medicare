import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'https://medicare-ydw4.onrender.com/api/';

export const getProfile = () => fetch(`${API_BASE}delivery/profile`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());
export const getOrders = (status = 'active') => fetch(`${API_BASE}delivery/orders?status=${status}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());
export const getAvailableOrders = () => fetch(`${API_BASE}delivery/available-orders`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());
export const getEarnings = (period = 'today') => fetch(`${API_BASE}delivery/earnings?period=${period}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());
export const getPerformance = () => fetch(`${API_BASE}delivery/performance`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json());
export const updateOnlineStatus = (isOnline) => fetch(`${API_BASE}delivery/online-status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify({ isOnline }) }).then(res => res.json());
export const updateProfile = (profileData) => fetch(`${API_BASE}delivery/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: JSON.stringify(profileData) }).then(res => res.json()); 