import axios from 'axios';

import config from '../utils/config';

const API_BASE = config.API_BASE_URL.replace(/\/$/, '');
function joinUrl(base, path) {
  return `${base}/${path.replace(/^\//, '')}`;
}
// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Submit a rating
export const submitRating = async (ratingData) => {
  try {
    const response = await api.post('/ratings/submit', ratingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit rating' };
  }
};

// Get product ratings
export const getProductRatings = async (itemId, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/ratings/product/${itemId}?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get product ratings' };
  }
};

// Get delivery boy ratings
export const getDeliveryBoyRatings = async (deliveryBoyId, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/ratings/delivery/${deliveryBoyId}?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get delivery boy ratings' };
  }
};

// Get user's ratings
export const getUserRatings = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/ratings/user?${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to get user ratings' };
  }
};

// Update a rating
export const updateRating = async (ratingId, ratingData) => {
  try {
    const response = await api.put(`/ratings/${ratingId}`, ratingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update rating' };
  }
};

// Delete a rating
export const deleteRating = async (ratingId) => {
  try {
    const response = await api.delete(`/ratings/${ratingId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete rating' };
  }
};

// Helper function to get rating color
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return '#4caf50'; // Green
  if (rating >= 4.0) return '#ff9800'; // Orange
  if (rating >= 3.0) return '#ffc107'; // Yellow
  return '#f44336'; // Red
};

// Helper function to get rating text
export const getRatingText = (rating) => {
  if (rating >= 4.5) return 'Excellent';
  if (rating >= 4.0) return 'Very Good';
  if (rating >= 3.5) return 'Good';
  if (rating >= 3.0) return 'Average';
  if (rating >= 2.0) return 'Below Average';
  return 'Poor';
}; 