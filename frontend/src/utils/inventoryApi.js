import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all products with inventory
export const getInventory = async () => {
  try {
    const res = await axios.get(`${API_URL}/inventory`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Add inventory to a product
export const addInventory = async (productId, data) => {
  try {
    const res = await axios.post(`${API_URL}/inventory/${productId}/add`, data, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Remove inventory from a product
export const removeInventory = async (productId, data) => {
  try {
    const res = await axios.post(`${API_URL}/inventory/${productId}/remove`, data, {
      headers: {
        'x-auth-token': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      }
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get inventory transactions for a product
export const getProductTransactions = async (productId) => {
  try {
    const res = await axios.get(`${API_URL}/inventory/${productId}/transactions`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get all inventory transactions with pagination
export const getAllTransactions = async (page = 1, limit = 10) => {
  try {
    const res = await axios.get(`${API_URL}/inventory/transactions?page=${page}&limit=${limit}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    return res.data;
  } catch (error) {
    throw error.response.data;
  }
};