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
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  LocalShipping as DeliverIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Receipt as BillIcon,
} from '@mui/icons-material';
import { getPendingOrders, deliverOrder, cancelOrder } from '../../utils/api';
import OrderBill from '../bills/OrderBill';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deliverDialog, setDeliverDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentType, setPaymentType] = useState('cash');
  const [processingDelivery, setProcessingDelivery] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [billDialog, setBillDialog] = useState(false);
  const [billOrder, setBillOrder] = useState(null);
  const [showBillAfterDelivery, setShowBillAfterDelivery] = useState(true);

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const data = await getPendingOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      setError('Failed to load pending orders. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const handleDeliverClick = (order) => {
    setSelectedOrder(order);
    setAmountPaid(order.totalAmount);
    setPaymentType('cash');
    setShowBillAfterDelivery(true);
    setDeliverDialog(true);
  };

  const handleViewClick = (order) => {
    setViewOrder(order);
    setViewDialog(true);
  };

  const handleBillClick = (order) => {
    setBillOrder(order);
    setBillDialog(true);
  };

  const handleDeliverOrder = async () => {
    if (amountPaid < 0) {
      setError('Amount paid cannot be negative.');
      return;
    }
    setProcessingDelivery(true);
    try {
      const updatedOrder = await deliverOrder(selectedOrder._id, {
        amountPaid: parseFloat(amountPaid),
        paymentType,
      });
      setSuccess('Order marked as delivered successfully!');
      setDeliverDialog(false);
      if (showBillAfterDelivery) {
        setBillOrder(updatedOrder);
        setTimeout(() => {
          setBillDialog(true);
        }, 500);
      }
      fetchPendingOrders();
    } catch (err) {
      console.error('Error delivering order:', err);
      setError('Failed to deliver order. Please try again.');
    } finally {
      setProcessingDelivery(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setLoading(true);
    try {
      await cancelOrder(orderId);
      setSuccess('Order cancelled successfully!');
      fetchPendingOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setError('Failed to cancel order. Please try again.');
    } finally {
      setLoading(false);
    }
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
        Pending Orders
      </Typography>

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          sx={{
            width: '100%',
            borderRadius: '12px',
            bgcolor: 'success.light',
            color: 'success.contrastText',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(error)}
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
            No pending orders found!
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Table Layout for Larger screens */}
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
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                    >
                      Total Amount
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
                          aria-label="View order details"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="success"
                          onClick={() => handleDeliverClick(order)}
                          title="Mark as Delivered"
                          aria-label="Mark order as delivered"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'success.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <DeliverIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="info"
                          onClick={() => handleBillClick(order)}
                          title="View Bill"
                          aria-label="View order bill"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'info.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <BillIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleCancelOrder(order._id)}
                          title="Cancel Order"
                          aria-label="Cancel order"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'error.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
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
                      color: 'primary.main',
                      fontWeight: 500,
                      mt: 1,
                    }}
                  >
                    Total: {formatCurrency(order.totalAmount)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', p: { xs: 1, sm: 1.5 } }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewClick(order)}
                    title="View Order"
                    aria-label="View order details"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="success"
                    onClick={() => handleDeliverClick(order)}
                    title="Mark as Delivered"
                    aria-label="Mark order as delivered"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'success.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <DeliverIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="info"
                    onClick={() => handleBillClick(order)}
                    title="View Bill"
                    aria-label="View order bill"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'info.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <BillIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleCancelOrder(order._id)}
                    title="Cancel Order"
                    aria-label="Cancel order"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'error.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Deliver Dialog */}
      <Dialog
        open={deliverDialog}
        onClose={() => setDeliverDialog(false)}
        maxWidth="sm"
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
            '& svg': { mr: 1 },
          }}
        >
          <DeliverIcon /> Mark Order as Delivered
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          {selectedOrder && (
            <>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                <strong>Store:</strong> {selectedOrder.store.name}
              </Typography>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                <strong>Total Amount:</strong> {formatCurrency(selectedOrder.totalAmount)}
              </Typography>
              <TextField
                margin="dense"
                label="Amount Paid"
                type="number"
                fullWidth
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Typography sx={{ color: 'text.secondary', mr: 1 }}>₹</Typography>
                  ),
                }}
                helperText="Enter amount paid by store (0 if adding to credit)"
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: '#f5f7fa' },
                  },
                }}
              />
              <FormControl fullWidth margin="dense">
                <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Payment Type
                </InputLabel>
                <Select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  label="Payment Type"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& .MuiSelect-select': { py: 1 },
                  }}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  color: selectedOrder.totalAmount - amountPaid > 0 ? 'error.main' : 'success.main',
                }}
              >
                Amount to be added to credit: {formatCurrency(selectedOrder.totalAmount - amountPaid)}
              </Typography>
              <FormControl fullWidth margin="dense">
                <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Generate Bill
                </InputLabel>
                <Select
                  value={showBillAfterDelivery}
                  onChange={(e) => setShowBillAfterDelivery(e.target.value)}
                  label="Generate Bill"
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    '& .MuiSelect-select': { py: 1 },
                  }}
                >
                  <MenuItem value={true}>Generate bill after delivery</MenuItem>
                  <MenuItem value={false}>Don't generate bill</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
          <Button
            onClick={() => setDeliverDialog(false)}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              borderRadius: '10px',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeliverOrder}
            variant="contained"
            disabled={processingDelivery}
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
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e',
              },
            }}
          >
            {processingDelivery ? <CircularProgress size={24} color="inherit" /> : 'Confirm Delivery'}
          </Button>
        </DialogActions>
      </Dialog>

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
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: 'warning.main' }}
              >
                <strong>Status:</strong> {viewOrder.status.toUpperCase()}
              </Typography>

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
              background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Close
          </Button>
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

export default PendingOrders;