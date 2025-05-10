import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Autocomplete,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  InputAdornment,
  Divider,
} from '@mui/material';
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material';
import { getStores, recordStorePayment } from '../../utils/api';

const PaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectedStoreId = location.state?.storeId;
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeSearchInput, setStoreSearchInput] = useState('');
  const [payment, setPayment] = useState({
    amount: '',
    paymentType: 'cash',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const data = await getStores();
        setStores(data);
        if (preselectedStoreId) {
          const preselectedStore = data.find((store) => store._id === preselectedStoreId);
          if (preselectedStore) {
            setSelectedStore(preselectedStore);
            setStoreSearchInput(preselectedStore.name);
          }
        }
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load stores. Please try refreshing.');
      } finally {
        setStoresLoading(false);
      }
    };
    fetchStores();
  }, [preselectedStoreId]);

  const handleChange = (e) => {
    setPayment({
      ...payment,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) {
      setError('Please select a store');
      return;
    }
    if (!payment.amount || parseFloat(payment.amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await recordStorePayment(selectedStore._id, {
        amount: parseFloat(payment.amount),
        paymentType: payment.paymentType,
        notes: payment.notes || 'General payment',
      });
      setSuccess(true);
      setSelectedStore(null);
      setStoreSearchInput('');
      setPayment({
        amount: '',
        paymentType: 'cash',
        notes: '',
      });
      setTimeout(() => {
        navigate('/', { state: { refreshData: true } });
      }, 1500);
    } catch (err) {
      console.error('Error recording payment:', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 800 }, mx: 'auto', px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      <Button
        variant="outlined"
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 3,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          px: { xs: 2, sm: 3 },
          py: { xs: 0.75, sm: 1 },
          borderRadius: '12px',
          '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
        }}
      >
        Back
      </Button>

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
        Record Payment
      </Typography>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
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
          Payment recorded successfully! Redirecting to dashboard...
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

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: '16px',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
          borderLeft: '4px solid',
          borderColor: 'primary.main',
          transition: 'opacity 0.3s ease',
          opacity: 1,
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                value={selectedStore}
                onChange={(event, newValue) => setSelectedStore(newValue)}
                inputValue={storeSearchInput}
                onInputChange={(event, newValue) => setStoreSearchInput(newValue)}
                options={stores}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Store"
                    variant="outlined"
                    fullWidth
                    required
                    helperText="Type to search for stores"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {storesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    sx={{ '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                  />
                )}
                loading={storesLoading}
                disabled={Boolean(preselectedStoreId)}
              />
            </Grid>

            {selectedStore && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2, background: 'linear-gradient(90deg, #0288d1 0%, #4fb3bf 100%)' }} />
                  <Box
                    sx={{
                      my: 2,
                      p: 2,
                      borderRadius: '12px',
                      background: '#f5f7fa',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.01)' },
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 1 }}
                    >
                      <strong>Store:</strong> {selectedStore.name}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 1 }}
                    >
                      <strong>Address:</strong> {selectedStore.address}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        color: selectedStore.balance < 0 ? 'error.main' : 'success.main',
                        fontWeight: 'bold',
                      }}
                    >
                      <strong>Balance:</strong>{' '}
                      {selectedStore.balance < 0
                        ? `(${formatCurrency(selectedStore.balance)})`
                        : formatCurrency(selectedStore.balance)}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2, background: 'linear-gradient(90deg, #0288d1 0%, #4fb3bf 100%)' }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    name="amount"
                    label="Payment Amount"
                    type="number"
                    value={payment.amount}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                    }}
                    fullWidth
                    required
                    sx={{ '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Payment Type</InputLabel>
                    <Select
                      name="paymentType"
                      value={payment.paymentType}
                      onChange={handleChange}
                      label="Payment Type"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, '& .MuiSelect-select': { py: 1.5 } }}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="upi">UPI</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                      <MenuItem value="credit">Credit</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="notes"
                    label="Notes (optional)"
                    value={payment.notes}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    sx={{ '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={loading || !selectedStore || !payment.amount}
                    sx={{
                      mt: 2,
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
                    {loading ? 'Recording...' : 'Record Payment'}
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PaymentForm;