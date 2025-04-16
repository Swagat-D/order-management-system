import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, Typography, Paper, TextField, Button, Autocomplete,
  MenuItem, FormControl, InputLabel, Select, Alert, Snackbar, 
  CircularProgress, Grid, InputAdornment, Divider
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
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load stores
  useEffect(() => {
    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const data = await getStores();
        setStores(data);
        
        // If preselected store ID exists, find and set the store
        if (preselectedStoreId) {
          const preselectedStore = data.find(store => store._id === preselectedStoreId);
          if (preselectedStore) {
            setSelectedStore(preselectedStore);
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

  // Handle form changes
  const handleChange = (e) => {
    setPayment({
      ...payment,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
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
        notes: payment.notes || 'General payment'
      });
      
      setSuccess(true);
      
      // Reset form
      setSelectedStore(null);
      setPayment({
        amount: '',
        paymentType: 'cash',
        notes: ''
      });
      
      // Add a slight delay before navigating to ensure payment is registered
      setTimeout(() => {
        // Navigate to dashboard to show updated data
        navigate('/', { state: { refreshData: true } });
      }, 1500);
    } catch (err) {
      console.error('Error recording payment:', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button 
        variant="outlined" 
        startIcon={<BackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>
      
      <Typography variant="h4" gutterBottom>
        Record Payment
      </Typography>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Payment recorded successfully! Redirecting to dashboard...
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
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
                  />
                )}
                loading={storesLoading}
                disabled={Boolean(preselectedStoreId)}
              />
            </Grid>
            
            {selectedStore && (
              <>
                <Grid item xs={12}>
                  <Divider />
                  <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle1">
                      <strong>Store:</strong> {selectedStore.name}
                    </Typography>
                    <Typography variant="subtitle1">
                      <strong>Address:</strong> {selectedStore.address}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ 
                      color: selectedStore.balance < 0 ? 'error.main' : 'success.main',
                      fontWeight: 'bold'
                    }}>
                      <strong>Balance:</strong> {selectedStore.balance < 0 
                        ? `(${formatCurrency(selectedStore.balance)})` 
                        : formatCurrency(selectedStore.balance)}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
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
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Type</InputLabel>
                    <Select
                      name="paymentType"
                      value={payment.paymentType}
                      onChange={handleChange}
                      label="Payment Type"
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
                    sx={{ mt: 2 }}
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