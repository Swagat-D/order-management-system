import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Tabs, Tab, Alert, CircularProgress,
  Divider, Grid
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StoreDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch store details and related data
  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        // Fetch store details
        const storeRes = await axios.get(`${API_URL}/stores/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setStore(storeRes.data);
        
        // Fetch store orders
        const ordersRes = await axios.get(`${API_URL}/orders/store/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setOrders(ordersRes.data);
        
        // Fetch store payments
        const paymentsRes = await axios.get(`${API_URL}/payments/store/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError('Failed to load store details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStoreData();
  }, [id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<BackIcon />}
          onClick={() => navigate('/stores')}
        >
          Back to Stores
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Button 
        variant="outlined" 
        startIcon={<BackIcon />}
        onClick={() => navigate('/stores')}
        sx={{ mb: 3 }}
      >
        Back to Stores
      </Button>
      
      {store && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {store.name}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  <strong>Address:</strong> {store.address}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Contact:</strong> {store.contactName || 'N/A'}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Phone:</strong> {store.contactPhone || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ 
                  color: store.balance < 0 ? 'error.main' : 'success.main',
                  fontWeight: 'bold'
                }}>
                  Balance: {store.balance < 0 
                    ? `(${formatCurrency(store.balance)})` 
                    : formatCurrency(store.balance)}
                </Typography>
                {store.balance < 0 && (
                  <Button 
                  variant="contained" 
                  color="success"
                  onClick={() => navigate('/payments/new', { state: { storeId: store._id } })}
                  sx={{ mt: 1 }}
                >
                  Record Payment
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Orders" />
            <Tab label="Payment History" />
          </Tabs>
          <Divider />
          
          {/* Orders Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              {orders.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                  No orders found for this store.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell align="right">Amount Paid</TableCell>
                        <TableCell align="right">Amount Due</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell>{order._id.substring(order._id.length - 8)}</TableCell>
                          <TableCell>{formatDate(order.orderDate)}</TableCell>
                          <TableCell>{order.status.toUpperCase()}</TableCell>
                          <TableCell align="right">{formatCurrency(order.totalAmount)}</TableCell>
                          <TableCell align="right">{formatCurrency(order.amountPaid)}</TableCell>
                          <TableCell align="right" sx={{ 
                            color: order.amountDue > 0 ? 'error.main' : 'inherit' 
                          }}>
                            {formatCurrency(order.amountDue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
          
          {/* Payments Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 2 }}>
              {payments.length === 0 ? (
                <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
                  No payment records found for this store.
                </Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell>{payment.paymentType.replace('_', ' ').toUpperCase()}</TableCell>
                          <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{payment.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Paper>
      </>
    )}
  </Box>
);
};

export default StoreDetail;