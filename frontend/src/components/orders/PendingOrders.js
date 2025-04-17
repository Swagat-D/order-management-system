import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Alert, Snackbar, CircularProgress,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  LocalShipping as DeliverIcon, 
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  Receipt as BillIcon
} from '@mui/icons-material';
import { getPendingOrders, deliverOrder, cancelOrder } from '../../utils/api';
import OrderBill from '../bills/OrderBill';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for deliver dialog
  const [deliverDialog, setDeliverDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentType, setPaymentType] = useState('cash');
  const [processingDelivery, setProcessingDelivery] = useState(false);
  
  // State for view dialog
  const [viewDialog, setViewDialog] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // State for bill dialog
  const [billDialog, setbillDialog] = useState(false);
  const [billOrder, setBillOrder] = useState(null);
  const [showBillAfterDelivery, setShowBillAfterDelivery] = useState(false);

  // Load pending orders
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

  // Handle opening deliver dialog
  const handleDeliverClick = (order) => {
    setSelectedOrder(order);
    setAmountPaid(order.totalAmount); // Default to full payment
    setPaymentType('cash');
    setShowBillAfterDelivery(true); // Default to show bill after delivery
    setDeliverDialog(true);
  };

  // Handle opening view dialog
  const handleViewClick = (order) => {
    setViewOrder(order);
    setViewDialog(true);
  };

  // Handle opening bill dialog
  const handleBillClick = (order) => {
    setBillOrder(order);
    setbillDialog(true);
  };

  // Handle deliver order
  const handleDeliverOrder = async () => {
    setProcessingDelivery(true);
    try {
      const updatedOrder = await deliverOrder(selectedOrder._id, {
        amountPaid: parseFloat(amountPaid),
        paymentType
      });
      
      setSuccess('Order marked as delivered successfully!');
      setDeliverDialog(false);
      
      // Check if we should show the bill immediately
      if (showBillAfterDelivery) {
        setBillOrder(updatedOrder);
        // Fetch fresh order data after a short delay to ensure we have the latest
        setTimeout(() => {
          setbillDialog(true);
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

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    
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

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Pending Orders
      </Typography>
      
      <Snackbar 
        open={Boolean(success)} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No pending orders found!</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Store</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order._id.substring(order._id.length - 8)}</TableCell>
                  <TableCell>{order.store.name}</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                  <TableCell align="right">₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewClick(order)}
                      title="View Order"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      color="success" 
                      onClick={() => handleDeliverClick(order)}
                      title="Mark as Delivered"
                    >
                      <DeliverIcon />
                    </IconButton>
                    <IconButton 
                      color="info" 
                      onClick={() => handleBillClick(order)}
                      title="View Bill"
                    >
                      <BillIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleCancelOrder(order._id)}
                      title="Cancel Order"
                    >
                      <CancelIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Deliver Dialog */}
      <Dialog 
        open={deliverDialog} 
        onClose={() => setDeliverDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Order as Delivered</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Store: {selectedOrder.store.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Total Amount: ₹{selectedOrder.totalAmount.toFixed(2)}
              </Typography>
              <TextField
                margin="dense"
                label="Amount Paid"
                type="number"
                fullWidth
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                InputProps={{
                  startAdornment: <InputLabel>₹</InputLabel>,
                }}
                helperText="Enter amount paid by store (0 if adding to credit)"
              />
              <FormControl fullWidth margin="dense">
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  label="Payment Type"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>
                Amount to be added to credit: 
                ₹{(selectedOrder.totalAmount - amountPaid).toFixed(2)}
              </Typography>
              
              <FormControl fullWidth margin="dense">
                <InputLabel>Generate Bill</InputLabel>
                <Select
                  value={showBillAfterDelivery}
                  onChange={(e) => setShowBillAfterDelivery(e.target.value)}
                  label="Generate Bill"
                >
                  <MenuItem value={true}>Generate bill after delivery</MenuItem>
                  <MenuItem value={false}>Don't generate bill</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeliverDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeliverOrder} 
            variant="contained" 
            color="primary"
            disabled={processingDelivery}
          >
            {processingDelivery ? <CircularProgress size={24} /> : 'Confirm Delivery'}
          </Button>
        </DialogActions>
      </Dialog>
      
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
                Store: {viewOrder.store.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Order Date: {new Date(viewOrder.orderDate).toLocaleString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Status: {viewOrder.status.toUpperCase()}
              </Typography>
              
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
                        <TableCell align="right">₹{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.total.toFixed(2)}</TableCell>
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
                          ₹{viewOrder.totalAmount.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
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
      
      {/* Bill Dialog */}
      <Dialog 
        open={billDialog} 
        onClose={() => setbillDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Order Bill
          <IconButton
            aria-label="close"
            onClick={() => setbillDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {billOrder && <OrderBill order={billOrder} onClose={() => setbillDialog(false)} />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PendingOrders;