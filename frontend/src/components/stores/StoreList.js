import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { getStores, createStore, recordStorePayment } from '../../utils/api';

const StoreList = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [storeDialog, setStoreDialog] = useState({ open: false, type: 'add' });
  const [currentStore, setCurrentStore] = useState({
    name: '',
    address: '',
    contactName: '',
    contactPhone: '',
  });
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [payment, setPayment] = useState({ amount: '', notes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddClick = () => {
    setCurrentStore({ name: '', address: '', contactName: '', contactPhone: '' });
    setStoreDialog({ open: true, type: 'add' });
  };

  const handleEditClick = (store) => {
    setCurrentStore({
      id: store._id,
      name: store.name,
      address: store.address,
      contactName: store.contactName || '',
      contactPhone: store.contactPhone || '',
    });
    setStoreDialog({ open: true, type: 'edit' });
  };

  const handleViewStore = (storeId) => {
    navigate(`/stores/${storeId}`);
  };

  const handlePaymentClick = (store) => {
    setSelectedStore(store);
    setPayment({ amount: '', notes: '' });
    setPaymentDialog(true);
  };

  const handleStoreDialogClose = () => {
    setStoreDialog({ ...storeDialog, open: false });
  };

  const handlePaymentDialogClose = () => {
    setPaymentDialog(false);
  };

  const handleStoreChange = (e) => {
    setCurrentStore({
      ...currentStore,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e) => {
    setPayment({
      ...payment,
      [e.target.name]: e.target.value,
    });
  };

  const handleStoreSubmit = async () => {
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
        setSuccess('Store updated successfully');
      }
      handleStoreDialogClose();
      fetchStores();
    } catch (err) {
      console.error('Error saving store:', err);
      setError('Failed to save store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!payment.amount || parseFloat(payment.amount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }
    setIsSubmitting(true);
    try {
      await recordStorePayment(selectedStore._id, {
        amount: parseFloat(payment.amount),
        notes: payment.notes || 'General payment',
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

  const formatCurrency = (amount) => {
    return `₹${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 1200 }, mx: 'auto', px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
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
          Stores
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
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
          Add Store
        </Button>
      </Box>

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
      ) : stores.length === 0 ? (
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
            No stores found. Add your first store!
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
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}>
                      Store Name
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '30%' }}>
                      Address
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}>
                      Contact
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}
                    >
                      Balance
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stores.map((store) => (
                    <TableRow
                      key={store._id}
                      sx={{
                        '&:hover': { backgroundColor: '#e8f0fe' },
                        backgroundColor: stores.indexOf(store) % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                        {store.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {store.address}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                        {store.contactName || 'N/A'}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          py: 1,
                          color: store.balance < 0 ? 'error.main' : 'success.main',
                          fontWeight: store.balance < 0 ? 'bold' : 'normal',
                        }}
                      >
                        {store.balance < 0 ? `(${formatCurrency(store.balance)})` : formatCurrency(store.balance)}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewStore(store._id)}
                          title="View Store Details"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(store)}
                          title="Edit Store"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="success"
                          onClick={() => handlePaymentClick(store)}
                          title="Record Payment"
                          disabled={store.balance >= 0}
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'success.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <PaymentIcon fontSize="small" />
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
            {stores.map((store) => (
              <Card
                key={store._id}
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
                    {store.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Address: {store.address}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Contact: {store.contactName || 'N/A'}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: store.balance < 0 ? 'error.main' : 'success.main',
                      fontWeight: store.balance < 0 ? 'bold' : 'normal',
                      mt: 1,
                    }}
                  >
                    Balance: {store.balance < 0 ? `(${formatCurrency(store.balance)})` : formatCurrency(store.balance)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', p: { xs: 1, sm: 1.5 } }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleViewStore(store._id)}
                    title="View Store Details"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(store)}
                    title="Edit Store"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="success"
                    onClick={() => handlePaymentClick(store)}
                    title="Record Payment"
                    disabled={store.balance >= 0}
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'success.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <PaymentIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Add/Edit Store Dialog */}
      <Dialog
        open={storeDialog.open}
        onClose={handleStoreDialogClose}
        maxWidth="sm"
        fullWidth
        fullScreen={false}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: { xs: '12px', sm: '16px' },
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            margin: { xs: 2, sm: 3 },
            maxHeight: { xs: '80vh', sm: '85vh' },
            overflowY: 'auto',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {storeDialog.type === 'add' ? <AddIcon sx={{ mr: 1 }} /> : <EditIcon sx={{ mr: 1 }} />}
            {storeDialog.type === 'add' ? 'Add New Store' : 'Edit Store'}
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleStoreDialogClose}
            sx={{
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Store Name"
            fullWidth
            value={currentStore.name}
            onChange={handleStoreChange}
            required
            sx={{ mb: 2, '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            fullWidth
            value={currentStore.address}
            onChange={handleStoreChange}
            required
            sx={{ mb: 2, '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
          />
          <TextField
            margin="dense"
            name="contactName"
            label="Contact Name"
            fullWidth
            value={currentStore.contactName}
            onChange={handleStoreChange}
            sx={{ mb: 2, '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
          />
          <TextField
            margin="dense"
            name="contactPhone"
            label="Contact Phone"
            fullWidth
            value={currentStore.contactPhone}
            onChange={handleStoreChange}
            sx={{ '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 1.5 }, justifyContent: 'flex-end' }}>
          <Button
            onClick={handleStoreDialogClose}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: 0.5,
              borderRadius: '10px',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStoreSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
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
        fullScreen={false}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: { xs: '12px', sm: '16px' },
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            margin: { xs: 2, sm: 3 },
            maxHeight: { xs: '80vh', sm: '85vh' },
            overflowY: 'auto',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon sx={{ mr: 1 }} />
            Record Payment
          </Box>
          <IconButton
            aria-label="close"
            onClick={handlePaymentDialogClose}
            sx={{
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, pt: 2 }}>
          {selectedStore && (
            <>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Store: {selectedStore.name}
              </Typography>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: 'error.main' }}
              >
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
                sx={{ mb: 2, '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
              />
              <TextField
                margin="dense"
                name="notes"
                label="Notes (optional)"
                fullWidth
                value={payment.notes}
                onChange={handlePaymentChange}
                sx={{ '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 1.5 }, justifyContent: 'flex-end' }}>
          <Button
            onClick={handlePaymentDialogClose}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: 0.5,
              borderRadius: '10px',
              '&:hover': { bgcolor: '#f5f5f5' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePaymentSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting || !payment.amount || parseFloat(payment.amount) <= 0}
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
            {isSubmitting ? <CircularProgress size={24} /> : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreList;