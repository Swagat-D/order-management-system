import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
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

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const storeRes = await axios.get(`${API_URL}/api/stores/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setStore(storeRes.data);
        const ordersRes = await axios.get(`${API_URL}/api/orders/store/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        setOrders(ordersRes.data);
        const paymentsRes = await axios.get(`${API_URL}/api/payments/store/${id}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={40} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: { xs: '100%', sm: 1200 }, mx: 'auto', px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: '12px',
            bgcolor: 'error.light',
            color: 'error.contrastText',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/stores')}
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 0.75, sm: 1 },
            borderRadius: '12px',
            '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
          }}
        >
          Back to Stores
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 1200 }, mx: 'auto', px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      <Button
        variant="outlined"
        startIcon={<BackIcon />}
        onClick={() => navigate('/stores')}
        sx={{
          mb: 3,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          px: { xs: 2, sm: 3 },
          py: { xs: 0.75, sm: 1 },
          borderRadius: '12px',
          '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
        }}
      >
        Back to Stores
      </Button>

      {store && (
        <>
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
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.5rem', sm: '2rem' },
                letterSpacing: '0.5px',
                color: 'text.primary',
              }}
            >
              {store.name}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 1 }}
                >
                  <strong>Address:</strong> {store.address}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 1 }}
                >
                  <strong>Contact:</strong> {store.contactName || 'N/A'}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  <strong>Phone:</strong> {store.contactPhone || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    color: store.balance < 0 ? 'error.main' : 'success.main',
                    fontWeight: 'bold',
                  }}
                >
                  Balance: {store.balance < 0 ? `(${formatCurrency(store.balance)})` : formatCurrency(store.balance)}
                </Typography>
                {store.balance < 0 && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => navigate('/payments/new', { state: { storeId: store._id } })}
                    sx={{
                      mt: 1,
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
                    Record Payment
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>

          <Paper
            sx={{
              borderRadius: '16px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
              }}
            >
              <Tab label="Orders" />
              <Tab label="Payment History" />
            </Tabs>
            <Divider />

            {/* Orders Tab */}
            {activeTab === 0 && (
              <Box sx={{ p: { xs: 1, sm: 2 } }}>
                {orders.length === 0 ? (
                  <Typography
                    variant="body1"
                    sx={{ p: 2, textAlign: 'center', fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    No orders found for this store.
                  </Typography>
                ) : (
                  <>
                    {/* Table Layout for Larger Screens */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                background: 'linear-gradient(90deg, #f5f7fa 0%, #e8ecef 100%)',
                              }}
                            >
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}>
                                Order ID
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}>
                                Date
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}>
                                Status
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}
                              >
                                Total Amount
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}
                              >
                                Paid
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}
                              >
                                Due
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
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                                  {order._id.substring(order._id.length - 8)}
                                </TableCell>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                                  {formatDate(order.orderDate)}
                                </TableCell>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                                  {order.status.toUpperCase()}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}
                                >
                                  {formatCurrency(order.totalAmount)}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}
                                >
                                  {formatCurrency(order.amountPaid)}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    py: 1,
                                    color: order.amountDue > 0 ? 'error.main' : 'inherit',
                                  }}
                                >
                                  {formatCurrency(order.amountDue)}
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
                              Date: {formatDate(order.orderDate)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
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
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                            >
                              Paid: {formatCurrency(order.amountPaid)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                color: order.amountDue > 0 ? 'error.main' : 'text.secondary',
                                fontWeight: order.amountDue > 0 ? 'bold' : 'normal',
                              }}
                            >
                              Due: {formatCurrency(order.amountDue)}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* Payments Tab */}
            {activeTab === 1 && (
              <Box sx={{ p: { xs: 1, sm: 2 } }}>
                {payments.length === 0 ? (
                  <Typography
                    variant="body1"
                    sx={{ p: 2, textAlign: 'center', fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    No payment records found for this store.
                  </Typography>
                ) : (
                  <>
                    {/* Table Layout for Larger Screens */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow
                              sx={{
                                background: 'linear-gradient(90deg, #f5f7fa 0%, #e8ecef 100%)',
                              }}
                            >
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}>
                                Date
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}>
                                Type
                              </TableCell>
                              <TableCell
                                align="right"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}
                              >
                                Amount
                              </TableCell>
                              <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '40%' }}>
                                Notes
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {payments.map((payment) => (
                              <TableRow
                                key={payment._id}
                                sx={{
                                  '&:hover': { backgroundColor: '#e8f0fe' },
                                  backgroundColor: payments.indexOf(payment) % 2 === 0 ? '#ffffff' : '#fafafa',
                                }}
                              >
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                                  {formatDate(payment.paymentDate)}
                                </TableCell>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                                  {payment.paymentType.replace('_', ' ').toUpperCase()}
                                </TableCell>
                                <TableCell
                                  align="right"
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}
                                >
                                  {formatCurrency(payment.amount)}
                                </TableCell>
                                <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {payment.notes || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    {/* Card Layout for Mobile Screens */}
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                      {payments.map((payment) => (
                        <Card
                          key={payment._id}
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
                              Date: {formatDate(payment.paymentDate)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                            >
                              Type: {payment.paymentType.replace('_', ' ').toUpperCase()}
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
                              Amount: {formatCurrency(payment.amount)}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                            >
                              Notes: {payment.notes || '-'}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </>
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