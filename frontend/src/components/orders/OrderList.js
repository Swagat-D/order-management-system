import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Alert, Snackbar, CircularProgress,
  Pagination, FormControl, InputLabel, MenuItem, Select, Grid
} from '@mui/material';
import { 
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getOrders } from '../../utils/api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    storeId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for view dialog
  const [viewDialog, setViewDialog] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // Load orders
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getOrders(
        page, 
        10, 
        filters.status, 
        filters.storeId
      );
      
      setOrders(data.orders);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalOrders: data.totalOrders
      });
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.currentPage);
  }, [filters]); // Reload when filters change

  // Handle page change
  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, currentPage: value });
    fetchOrders(value);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    // Reset to page 1 when filtering
    setPagination({ ...pagination, currentPage: 1 });
  };

  // Handle opening view dialog
  const handleViewClick = (order) => {
    setViewOrder(order);
    setViewDialog(true);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'cancelled':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Order History
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="outlined" 
              onClick={() => setFilters({ status: '', storeId: '' })}
              fullWidth
            >
              Clear Filters
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" align="right">
              Total Orders: {pagination.totalOrders}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No orders found!</Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell align="right">Amount Paid</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id.substring(order._id.length - 8)}</TableCell>
                    <TableCell>{order.store.name}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell sx={{ color: getStatusColor(order.status) }}>
                      {order.status.toUpperCase()}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(order.amountPaid)}</TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleViewClick(order)}
                        title="View Order"
                      >
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
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
      
      {/* View Order Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          {viewOrder && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Store:</strong> {viewOrder.store.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Order Date:</strong> {formatDate(viewOrder.orderDate)}
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ color: getStatusColor(viewOrder.status) }}>
                <strong>Status:</strong> {viewOrder.status.toUpperCase()}
              </Typography>
              
              {viewOrder.deliveryDate && (
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Delivery Date:</strong> {formatDate(viewOrder.deliveryDate)}
                </Typography>
              )}
              
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle1" fontWeight="bold">
                          Total Amount:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {formatCurrency(viewOrder.totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {viewOrder.status === 'delivered' && (
                      <>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle1">
                              Amount Paid:
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1">
                              {formatCurrency(viewOrder.amountPaid)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography variant="subtitle1" sx={{ 
                              color: viewOrder.amountDue > 0 ? 'error.main' : 'inherit',
                              fontWeight: viewOrder.amountDue > 0 ? 'bold' : 'normal'
                            }}>
                              Amount Due:
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="subtitle1" sx={{ 
                              color: viewOrder.amountDue > 0 ? 'error.main' : 'inherit',
                              fontWeight: viewOrder.amountDue > 0 ? 'bold' : 'normal'
                            }}>
                              {formatCurrency(viewOrder.amountDue)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {viewOrder.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Notes:</Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography>{viewOrder.notes}</Typography>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderList;