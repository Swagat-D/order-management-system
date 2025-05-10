import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, CircularProgress, Pagination,
  FormControl, InputLabel, Select, MenuItem, Grid, Button
} from '@mui/material';
import { getAllTransactions } from '../../utils/inventoryApi';

const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch transactions
  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllTransactions(page, 20);
      
      // Handle potential missing or malformed data
      if (!data || (!data.transactions && !Array.isArray(data))) {
        throw new Error('Invalid response data structure');
      }
      
      // If data is an array, it's not paginated
      if (Array.isArray(data)) {
        setTransactions(data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalTransactions: data.length
        });
      } else {
        // It's the expected paginated structure
        setTransactions(data.transactions || []);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalTransactions: data.totalTransactions || 0
        });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load inventory transactions. Please try refreshing.');
      setTransactions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalTransactions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle page change
  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, currentPage: value });
    fetchTransactions(value);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get reference type display
  const getReferenceDisplay = (reference) => {
    switch (reference) {
      case 'manual':
        return 'Manual Adjustment';
      case 'order':
        return 'Order Fulfillment';
      case 'adjustment':
        return 'System Adjustment';
      default:
        return reference;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Inventory Transaction History
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => setError('')}
          action={
            <Button color="inherit" size="small" onClick={() => fetchTransactions(pagination.currentPage)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : transactions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No inventory transactions found.</Typography>
        </Paper>
      ) : (
        <>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2" align="right">
              Total Transactions: {pagination.totalTransactions}
            </Typography>
          </Paper>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Transaction</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Before</TableCell>
                  <TableCell align="right">After</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction._id || Math.random().toString()}>
                    <TableCell>{transaction.date ? formatDate(transaction.date) : 'N/A'}</TableCell>
                    <TableCell>{transaction.product && transaction.product.name ? transaction.product.name : 'Unknown Product'}</TableCell>
                    <TableCell sx={{ 
                      color: transaction.transactionType === 'add' ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}>
                      {transaction.transactionType === 'add' ? 'ADDED' : 'REMOVED'}
                    </TableCell>
                    <TableCell>{transaction.reference ? getReferenceDisplay(transaction.reference) : 'N/A'}</TableCell>
                    <TableCell align="right">{transaction.quantity !== undefined ? transaction.quantity : 'N/A'}</TableCell>
                    <TableCell align="right">{transaction.previousQuantity !== undefined ? transaction.previousQuantity : 'N/A'}</TableCell>
                    <TableCell align="right">{transaction.newQuantity !== undefined ? transaction.newQuantity : 'N/A'}</TableCell>
                    <TableCell>{transaction.notes || 'No notes'}</TableCell>
                    <TableCell>{transaction.user && transaction.user.name ? transaction.user.name : 'System'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={pagination.totalPages} 
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default InventoryTransactions;