import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, CircularProgress, Pagination,
  FormControl, InputLabel, Select, MenuItem, Grid
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
    try {
      const data = await getAllTransactions(page, 20);
      setTransactions(data.transactions);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalTransactions: data.totalTransactions
      });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load inventory transactions. Please try refreshing.');
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
        <Alert severity="error" sx={{ mb: 2 }}>
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
                  <TableRow key={transaction._id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.product.name}</TableCell>
                    <TableCell sx={{ 
                      color: transaction.transactionType === 'add' ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}>
                      {transaction.transactionType === 'add' ? 'ADDED' : 'REMOVED'}
                    </TableCell>
                    <TableCell>{getReferenceDisplay(transaction.reference)}</TableCell>
                    <TableCell align="right">{transaction.quantity}</TableCell>
                    <TableCell align="right">{transaction.previousQuantity}</TableCell>
                    <TableCell align="right">{transaction.newQuantity}</TableCell>
                    <TableCell>{transaction.notes}</TableCell>
                    <TableCell>{transaction.user ? transaction.user.name : 'System'}</TableCell>
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