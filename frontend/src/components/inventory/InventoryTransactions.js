import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Pagination,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { getAllTransactions } from '../../utils/inventoryApi';

const InventoryTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllTransactions(page, 20);
      if (!data || (!data.transactions && !Array.isArray(data))) {
        throw new Error('Invalid response data structure');
      }
      if (Array.isArray(data)) {
        setTransactions(data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalTransactions: data.length,
        });
      } else {
        setTransactions(data.transactions || []);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalTransactions: data.totalTransactions || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load inventory transactions. Please try refreshing.');
      setTransactions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalTransactions: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, currentPage: value });
    fetchTransactions(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReferenceDisplay = (reference) => {
    switch (reference) {
      case 'manual':
        return 'Manual Adjustment';
      case 'order':
        return 'Order Fulfillment';
      case 'adjustment':
        return 'System Adjustment';
      default:
        return reference || 'N/A';
    }
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 1200 }, mx: 'auto', px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          letterSpacing: '0.5px',
          color: 'text.primary',
          position: 'relative',
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -2,
            left: 0,
            width: '50px',
            height: '4px',
            bgcolor: 'secondary.main',
            borderRadius: '2px',
          },
        }}
      >
        Inventory Transaction History
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Total Transactions
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {loading ? <CircularProgress size={24} /> : pagination.totalTransactions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: '12px',
            bgcolor: 'error.light',
            color: 'error.contrastText',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => fetchTransactions(pagination.currentPage)}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                py: 0.5,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef5350 0%, #f44336 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #e53935 0%, #d32f2f 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} sx={{ color: 'primary.main' }} />
        </Box>
      ) : transactions.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: '16px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
          }}
        >
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            No inventory transactions found.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Table Layout for Larger Screens */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: '16px',
                boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
                transition: 'opacity 0.3s ease',
                opacity: 1,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'linear-gradient(90deg, #f5f7fa 0%, #e8ecef 100%)',
                    }}
                  >
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}>
                      Product
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '10%' }}>
                      Transaction
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}>
                      Type
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '10%' }}
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '10%' }}
                    >
                      Before
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '10%' }}
                    >
                      After
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}>
                      Notes
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '10%' }}>
                      By
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction, index) => (
                    <TableRow
                      key={transaction._id || Math.random().toString()}
                      sx={{
                        '&:hover': { backgroundColor: '#e8f0fe' },
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                        {transaction.date ? formatDate(transaction.date) : 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          py: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {transaction.product && transaction.product.name ? transaction.product.name : 'Unknown Product'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          py: 1,
                          color: transaction.transactionType === 'add' ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {transaction.transactionType === 'add' ? 'ADDED' : 'REMOVED'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                        {getReferenceDisplay(transaction.reference)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}
                      >
                        {transaction.quantity !== undefined ? transaction.quantity : 'N/A'}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}
                      >
                        {transaction.previousQuantity !== undefined ? transaction.previousQuantity : 'N/A'}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}
                      >
                        {transaction.newQuantity !== undefined ? transaction.newQuantity : 'N/A'}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          py: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {transaction.notes || 'No notes'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                        {transaction.user && transaction.user.name ? transaction.user.name : 'System'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Card Layout for Mobile Screens */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {transactions.map((transaction, index) => (
              <Card
                key={transaction._id || Math.random().toString()}
                sx={{
                  mb: 2,
                  borderRadius: '16px',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
                  borderLeft: '4px solid',
                  borderColor: transaction.transactionType === 'add' ? 'success.main' : 'error.main',
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  opacity: 1,
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 600 }}
                  >
                    {transaction.date ? formatDate(transaction.date) : 'N/A'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Product: {transaction.product && transaction.product.name ? transaction.product.name : 'Unknown Product'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: transaction.transactionType === 'add' ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    Transaction: {transaction.transactionType === 'add' ? 'ADDED' : 'REMOVED'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Type: {getReferenceDisplay(transaction.reference)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Quantity: {transaction.quantity !== undefined ? transaction.quantity : 'N/A'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Before: {transaction.previousQuantity !== undefined ? transaction.previousQuantity : 'N/A'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    After: {transaction.newQuantity !== undefined ? transaction.newQuantity : 'N/A'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Notes: {transaction.notes || 'No notes'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    By: {transaction.user && transaction.user.name ? transaction.user.name : 'System'}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              size={{ xs: 'small', sm: 'medium' }}
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
                    color: 'white',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                },
                '& .Mui-selected': {
                  background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
                  },
                },
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default InventoryTransactions;