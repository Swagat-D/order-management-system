import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Products API
export const getProducts = async () => {
  const res = await axios.get(`${API_URL}/products`);
  return res.data;
};

export const createProduct = async (productData) => {
  const res = await axios.post(`${API_URL}/products`, productData);
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await axios.put(`${API_URL}/products/${id}`, productData);
  return res.data;
};

// Stores API
export const getStores = async (search = '') => {
  const res = await axios.get(`${API_URL}/stores?search=${search}`);
  return res.data;
};

export const getOutstandingStores = async () => {
  const res = await axios.get(`${API_URL}/stores/outstanding`);
  return res.data;
};

export const createStore = async (storeData) => {
  const res = await axios.post(`${API_URL}/stores`, storeData);
  return res.data;
};

export const recordStorePayment = async (storeId, paymentData) => {
  const res = await axios.post(`${API_URL}/stores/${storeId}/payment`, paymentData);
  return res.data;
};

// Orders API
export const createOrder = async (orderData) => {
  const res = await axios.post(`${API_URL}/orders`, orderData);
  return res.data;
};

export const getPendingOrders = async () => {
  const res = await axios.get(`${API_URL}/orders/pending`);
  return res.data;
};

export const getOrders = async (page = 1, limit = 10, status = '', storeId = '') => {
  const res = await axios.get(
    `${API_URL}/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}${storeId ? `&storeId=${storeId}` : ''}`
  );
  return res.data;
};

export const deliverOrder = async (orderId, paymentData) => {
  const res = await axios.put(`${API_URL}/orders/${orderId}/deliver`, paymentData);
  return res.data;
};

export const cancelOrder = async (orderId) => {
  const res = await axios.put(`${API_URL}/orders/${orderId}/cancel`);
  return res.data;
};

// Dashboard API
export const getDashboardSummary = async (startDate, endDate) => {
  let url = `${API_URL}/dashboard/summary`;
  if (startDate && endDate) {
    url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
  }
  const res = await axios.get(url);
  return res.data;
};

export const getSalesChartData = async () => {
  const res = await axios.get(`${API_URL}/dashboard/sales-chart`);
  return res.data;
};

export const getProductChartData = async () => {
  const res = await axios.get(`${API_URL}/dashboard/product-chart`);
  return res.data;
};