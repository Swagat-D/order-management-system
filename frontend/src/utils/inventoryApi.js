// utils/inventoryApi.js

// Get inventory for all products
export const getInventory = async () => {
  try {
    const response = await fetch('/api/inventory');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch inventory');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Add inventory to a product
export const addInventory = async (productId, data) => {
  try {
    const response = await fetch(`/api/inventory/${productId}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add inventory');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Remove inventory from a product
export const removeInventory = async (productId, data) => {
  try {
    const response = await fetch(`/api/inventory/${productId}/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to remove inventory');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get transactions for a specific product
export const getProductTransactions = async (productId) => {
  try {
    const response = await fetch(`/api/inventory/transactions/product/${productId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch product transactions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Get all inventory transactions with pagination
export const getAllTransactions = async (page = 1, limit = 20) => {
  try {
    const response = await fetch(`/api/inventory/transactions?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch transactions');
    }
    
    const data = await response.json();
    
    // If the response doesn't match expected structure, transform it
    if (!data.transactions && Array.isArray(data)) {
      return {
        transactions: data,
        currentPage: page,
        totalPages: 1,
        totalTransactions: data.length
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};