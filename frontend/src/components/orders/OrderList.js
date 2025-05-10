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
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Receipt as BillIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { getOrders } from '../../utils/api';
import OrderBill from '../bills/OrderBill';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    storeId: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewDialog, setViewDialog] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [billDialog, setBillDialog] = useState(false);
  const [billOrder, setBillOrder] = useState(null);

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getOrders(page, 10, filters.status, filters.storeId);
      setOrders(data.orders);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalOrders: data.totalOrders,
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
  }, [filters]);

  const handlePageChange = (event, value) => {
    setPagination({ ...pagination, currentPage: value });
    fetchOrders(value);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleViewClick = (order) => {
    setViewOrder(order);
    setViewDialog(true);
  };

  const handleBillClick = (order) => {
    setBillOrder(order);
    setBillDialog(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

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
          mb: 4,
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
        Order History
      </Typography>

      <Snackbar
        open={error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          sx={{
            width: '100%',
            borderRadius: '12px',
            bgcolor: 'error.light',
            color: 'error.contrastText',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Filters */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          borderRadius: '16px',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
          borderLeft: '4px solid',
          borderColor: 'primary.main',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs= {12} sm={5}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Status"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& .MuiSelect-select': {
                    py: 1,
                  },
                }}
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
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 0.75, sm: 1 },
                borderRadius: '12px',
                '&:hover': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                },
              }}
            >
              Clear Filters
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography
              variant="body2"
              align="right"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
            >
              Total Orders: {pagination.totalOrders}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} sx={{ color: 'primary.main' }} />
        </Box>
      ) : orders.length === 0 ? (
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
            No orders found!
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
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'linear-gradient(90deg, #f5f7fa 0%, #e8ecef 100%)',
                    }}
                  >
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                      Order ID
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                      Store
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                      Date
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                      Status
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                    >
                      Total
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order._id}
                      sx={{
                        '&:hover': { backgroundColor: '#e8f0fe' },
                        backgroundColor: orders.indexOf(order) % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {order._id.substring(order._id.length - 8)}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {order.store.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatDate(order.orderDate)}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: getStatusColor(order.status),
                          fontWeight: 500,
                        }}
                      >
                        {order.status.toUpperCase()}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleViewClick(order)}
                          title="View Order"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        {order.status === 'delivered' && (
                          <IconButton
                            color="info"
                            onClick={() => handleBillClick(order)}
                            title="View Bill"
                            sx={{
                              p: { xs: 1, sm: 1.5 },
                              '&:hover': { bgcolor: 'info.light', transform: 'scale(1.1)' },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            <BillIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Card Layout for Mobile Screens */}
          <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
            {orders.map((order) => (
              <Card
                key={order._id}
                sx={{
                  mb: 2,
                  borderRadius: '16px',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 600 }}
                  >
                    Order ID: {order._id.substring(order._id.length - 8)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Store: {order.store.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Date: {formatDate(order.orderDate)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: getStatusColor(order.status),
                      fontWeight: 500,
                    }}
                  >
                    Status: {order.status.toUpperCase()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: 'primary.main',
                      fontWeight: 500,
                      mt: 1,
                    }}
                  >
                    Total: {formatCurrency(order.totalAmount)}
                  </Typography>
                  {order.status === 'delivered' && (
                    <Typography
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                    >
                      Paid: {formatCurrency(order.amountPaid)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', p: { xs: 1, sm: 1.5 } }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewClick(order)}
                    title="View Order"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  {order.status === 'delivered' && (
                    <IconButton
                      color="info"
                      onClick={() => handleBillClick(order)}
                      title="View Bill"
                      sx={{
                        p: 1,
                        '&:hover': { bgcolor: 'info.light', transform: 'scale(1.1)' },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <BillIcon fontSize="small" />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            ))}
          </Box>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              size={window.innerWidth < 600 ? 'small' : 'medium'}
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                },
              }}
            />
          </Box>
        </>
      )}

      {/* View Order Dialog */}
      <Dialog
        open={viewDialog}
        onClose={() => setViewDialog(false)}
        maxWidth="sm" // Changed to 'sm' for better mobile compatibility
        fullWidth
        fullScreen={false} // Explicitly disable full-screen
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: { xs: '12px', sm: '16px' }, // Slightly smaller radius on mobile
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            margin: { xs: 2, sm: 3 }, // Add margin for mobile
            maxHeight: { xs: '80vh', sm: '85vh' }, // Limit height to prevent overflow
            overflowY: 'auto', // Allow scrolling if content overflows
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 1.5, // Reduced padding for compactness
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ViewIcon sx={{ mr: 1 }} />
            Order Details
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setViewDialog(false)}
            sx={{
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, pt: 2 }}>
          {viewOrder && (
            <>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                <strong>Store:</strong> {viewOrder.store.name}
              </Typography>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                <strong>Order Date:</strong> {formatDate(viewOrder.orderDate)}
              </Typography>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: getStatusColor(viewOrder.status),
                }}
              >
                <strong>Status:</strong> {viewOrder.status.toUpperCase()}
              </Typography>

              {viewOrder.deliveryDate && (
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  <strong>Delivery Date:</strong> {formatDate(viewOrder.deliveryDate)}
                </Typography>
              )}

              <TableContainer sx={{ mt: 2, overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        background: 'linear-gradient(90deg, #f5f7fa 0%, #e8ecef 100%)',
                      }}
                    >
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, py: 1 }}>
                        Product
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, py: 1 }}
                      >
                        Unit Price
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, py: 1 }}
                      >
                        Qty
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, py: 1 }}
                      >
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewOrder.items.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                          '&:hover': { backgroundColor: '#e8f0fe' },
                        }}
                      >
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 0.5 }}>
                          {item.product.name}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 0.5 }}
                        >
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 0.5 }}
                        >
                          {item.quantity}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 0.5 }}
                        >
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow
                      sx={{
                        background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
                      }}
                    >
                      <TableCell colSpan={3} align="right">
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: 'primary.main' }}
                        >
                          Total Amount:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: 'primary.main' }}
                        >
                          {formatCurrency(viewOrder.totalAmount)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {viewOrder.status === 'delivered' && (
                      <>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography
                              variant="subtitle1"
                              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                            >
                              Amount Paid:
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="subtitle1"
                              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                            >
                              {formatCurrency(viewOrder.amountPaid)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                color: viewOrder.amountDue > 0 ? 'error.main' : 'inherit',
                                fontWeight: viewOrder.amountDue > 0 ? 'bold' : 'normal',
                              }}
                            >
                              Amount Due:
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontSize: { xs: '0.875rem', sm: '1rem' },
                                color: viewOrder.amountDue > 0 ? 'error.main' : 'inherit',
                                fontWeight: viewOrder.amountDue > 0 ? 'bold' : 'normal',
                              }}
                            >
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
                  <Typography
                    variant="subtitle1"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    Notes:
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: '8px',
                      background: '#f5f7fa',
                    }}
                  >
                    <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {viewOrder.notes}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 1.5 }, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setViewDialog(false)}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: 0.5,
              borderRadius: '10px',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Close
          </Button>
          {viewOrder && viewOrder.status === 'delivered' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<BillIcon />}
              onClick={() => {
                setViewDialog(false);
                handleBillClick(viewOrder);
              }}
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 2, sm: 3 },
                py: { xs: 0.75, sm: 1 },
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View Bill
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Bill Dialog */}
      <Dialog
        open={billDialog}
        onClose={() => setBillDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 600}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: { xs: 0, sm: '16px' },
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          Order Bill
          <IconButton
            aria-label="close"
            onClick={() => setBillDialog(false)}
            sx={{
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {billOrder && <OrderBill order={billOrder} onClose={() => setBillDialog(false)} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default OrderList;