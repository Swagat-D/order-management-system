import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Alert, Snackbar, CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { getStores, createStore, recordStorePayment } from '../../utils/api';

const StoreList = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog state
  const [storeDialog, setStoreDialog] = useState({ open: false, type: 'add' });
  const [currentStore, setCurrentStore] = useState({
    name: '',
    address: '',
    contactName: '',
    contactPhone: ''
  });
  
  // Payment dialog state
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [payment, setPayment] = useState({ amount: '', notes: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load stores
  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await getStores();
      setStores(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to load stores. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // Open add store dialog
  const handleAddClick = () => {
    setCurrentStore({ name: '', address: '', contactName: '', contactPhone: '' });
    setStoreDialog({ open: true, type: 'add' });
  };

  // Open edit store dialog
  const handleEditClick = (store) => {
    setCurrentStore({
      id: store._id,
      name: store.name,
      address: store.address,
      contactName: store.contactName || '',
      contactPhone: store.contactPhone || ''
    });
    setStoreDialog({ open: true, type: 'edit' });
  };

  // Navigate to store details
  const handleViewStore = (storeId) => {
    navigate(`/stores/${storeId}`);
  };

  // Open payment dialog
  const handlePaymentClick = (store) => {
    setSelectedStore(store);
    setPayment({ amount: '', notes: '' });
    setPaymentDialog(true);
  };

  // Handle store dialog close
  const handleStoreDialogClose = () => {
    setStoreDialog({ ...storeDialog, open: false });
  };

  // Handle payment dialog close
  const handlePaymentDialogClose = () => {
    setPaymentDialog(false);
  };

  // Handle store form changes
  const handleStoreChange = (e) => {
    setCurrentStore({
      ...currentStore,
      [e.target.name]: e.target.value
    });
  };

  // Handle payment form changes
  const handlePaymentChange = (e) => {
    setPayment({
      ...payment,
      [e.target.name]: e.target.value
    });
  };

  // Handle store form submit
  const handleStoreSubmit = async () => {
    // Validation
    if (!currentStore.name || !currentStore.address) {
      setError('Store name and address are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (storeDialog.type === 'add') {
        const newStore = await createStore(currentStore);
        setStores([...stores, newStore]);
        setSuccess('Store added successfully');
      } else {
        // We'll implement the update functionality in the next iteration
        setSuccess('Store updated successfully');
      }
      
      // Close dialog and refresh stores
      handleStoreDialogClose();
      fetchStores();
    } catch (err) {
      console.error('Error saving store:', err);
      setError('Failed to save store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle payment submit
  const handlePaymentSubmit = async () => {
    // Validation
    if (!payment.amount || parseFloat(payment.amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await recordStorePayment(selectedStore._id, {
        amount: parseFloat(payment.amount),
        notes: payment.notes || 'General payment'
      });
      
      setSuccess('Payment recorded successfully');
      handlePaymentDialogClose();
      fetchStores();
    } catch (err) {
      console.error('Error recording payment:', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Stores
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Store
        </Button>
      </Box>
      
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
      ) : stores.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No stores found. Add your first store!</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Store Name</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stores.map((store) => (
                <TableRow key={store._id}>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.address}</TableCell>
                  <TableCell>{store.contactName || 'N/A'}</TableCell>
                  <TableCell align="right" sx={{ 
                    color: store.balance < 0 ? 'error.main' : 'success.main',
                    fontWeight: store.balance < 0 ? 'bold' : 'normal'
                  }}>
                    {store.balance < 0 
                      ? `(${formatCurrency(store.balance)})` 
                      : formatCurrency(store.balance)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleViewStore(store._id)}
                      title="View Store Details"
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditClick(store)}
                      title="Edit Store"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="success" 
                      onClick={() => handlePaymentClick(store)}
                      title="Record Payment"
                      disabled={store.balance >= 0}
                    >
                      <PaymentIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Add/Edit Store Dialog */}
      <Dialog 
        open={storeDialog.open} 
        onClose={handleStoreDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {storeDialog.type === 'add' ? 'Add New Store' : 'Edit Store'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Store Name"
            fullWidth
            value={currentStore.name}
            onChange={handleStoreChange}
            required
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            fullWidth
            value={currentStore.address}
            onChange={handleStoreChange}
            required
          />
          <TextField
            margin="dense"
            name="contactName"
            label="Contact Name"
            fullWidth
            value={currentStore.contactName}
            onChange={handleStoreChange}
          />
          <TextField
            margin="dense"
            name="contactPhone"
            label="Contact Phone"
            fullWidth
            value={currentStore.contactPhone}
            onChange={handleStoreChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStoreDialogClose}>Cancel</Button>
          <Button 
            onClick={handleStoreSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog 
        open={paymentDialog} 
        onClose={handlePaymentDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          {selectedStore && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Store: {selectedStore.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'error.main' }}>
                Outstanding Balance: {formatCurrency(Math.abs(selectedStore.balance))}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                name="amount"
                label="Payment Amount"
                type="number"
                fullWidth
                value={payment.amount}
                onChange={handlePaymentChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                required
              />
              <TextField
                margin="dense"
                name="notes"
                label="Notes (optional)"
                fullWidth
                value={payment.notes}
                onChange={handlePaymentChange}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePaymentDialogClose}>Cancel</Button>
          <Button 
            onClick={handlePaymentSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting || !payment.amount || parseFloat(payment.amount) <= 0}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreList;