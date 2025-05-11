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
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { getProducts } from '../../utils/api';
import { getInventory, addInventory, removeInventory, getProductTransactions } from '../../utils/inventoryApi';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityChange, setQuantityChange] = useState('');
  const [changeType, setChangeType] = useState('add');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (secondErr) {
        console.error('Error fetching products:', secondErr);
        setError('Failed to load inventory. Please try refreshing.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInventoryClick = (product, type) => {
    setSelectedProduct(product);
    setQuantityChange('');
    setChangeType(type);
    setNotes('');
    setInventoryDialog(true);
  };

  const handleHistoryClick = async (product) => {
    setSelectedProduct(product);
    setHistoryLoading(true);
    try {
      const history = await getProductTransactions(product._id);
      setInventoryHistory(history);
    } catch (err) {
      console.error('Error fetching inventory history:', err);
      setError('Failed to load inventory history.');
    } finally {
      setHistoryLoading(false);
      setHistoryDialog(true);
    }
  };
  
  const handleInventoryUpdate = async () => {

    if (!selectedProduct || !selectedProduct._id) {
    setError('Product not selected properly');
    return;
  }
    const quantity = parseInt(quantityChange);
    if (isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    setIsSubmitting(true);
    try {
      if (changeType === 'add') {
        await addInventory(selectedProduct._id, {
          quantity,
          notes: notes || 'Manual addition',
        });
      } else {
        await removeInventory(selectedProduct._id, {
          quantity,
          notes: notes || 'Manual removal',
        });
      }
      setSuccess(`Successfully ${changeType === 'add' ? 'added' : 'removed'} inventory`);
      setInventoryDialog(false);
      fetchProducts();
    } catch (err) {
      console.error('Error updating inventory:', err);
      setError(err.msg || 'Failed to update inventory. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        Inventory Management
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

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StoreIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Total Products
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
              borderLeft: '4px solid',
              borderColor: 'primary.main',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <InventoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Total Inventory
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {loading ? <CircularProgress size={24} /> : products.reduce((sum, product) => sum + product.inventory, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: '16px',
              boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
              borderLeft: '4px solid',
              borderColor: 'error.main',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" color="error" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  Low Stock Items
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {loading ? <CircularProgress size={24} /> : products.filter((product) => product.inventory < 10).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} sx={{ color: 'primary.main' }} />
        </Box>
      ) : products.length === 0 ? (
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
            No products found!
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
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '30%' }}>
                      Product Name
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}
                    >
                      Price (₹)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}
                    >
                      Current Stock
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product._id}
                      sx={{
                        '&:hover': { backgroundColor: '#e8f0fe' },
                        backgroundColor: products.indexOf(product) % 2 === 0 ? '#ffffff' : '#fafafa',
                      }}
                    >
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}
                      >
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}
                      >
                        {product.inventory}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        {product.inventory <= 0 ? (
                          <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'error.main' }}>
                            Out of Stock
                          </Typography>
                        ) : product.inventory < 10 ? (
                          <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'warning.main' }}>
                            Low Stock
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'success.main' }}>
                            In Stock
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1 }}>
                        <IconButton
                          color="success"
                          onClick={() => handleInventoryClick(product, 'add')}
                          title="Add Stock"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'success.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleInventoryClick(product, 'remove')}
                          title="Remove Stock"
                          disabled={product.inventory <= 0}
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'error.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="info"
                          onClick={() => handleHistoryClick(product)}
                          title="View History"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'info.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <HistoryIcon fontSize="small" />
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
            {products.map((product) => (
              <Card
                key={product._id}
                sx={{
                  mb: 2,
                  borderRadius: '16px',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  transition: 'transform 0.3s ease, opacity 0.3s ease',
                  opacity: 1,
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 600 }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Price: {formatCurrency(product.price)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Stock: {product.inventory}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color:
                        product.inventory <= 0 ? 'error.main' : product.inventory < 10 ? 'warning.main' : 'success.main',
                      fontWeight: product.inventory <= 0 || product.inventory < 10 ? 'bold' : 'normal',
                    }}
                  >
                    Status: {product.inventory <= 0 ? 'Out of Stock' : product.inventory < 10 ? 'Low Stock' : 'In Stock'}
                  </Typography>
                </CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: { xs: 1, sm: 1.5 } }}>
                  <IconButton
                    color="success"
                    onClick={() => handleInventoryClick(product, 'add')}
                    title="Add Stock"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'success.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleInventoryClick(product, 'remove')}
                    title="Remove Stock"
                    disabled={product.inventory <= 0}
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'error.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="info"
                    onClick={() => handleHistoryClick(product)}
                    title="View History"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'info.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <HistoryIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Inventory Update Dialog */}
      <Dialog
        open={inventoryDialog}
        onClose={() => setInventoryDialog(false)}
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
            transition: 'opacity 0.3s ease',
            opacity: 1,
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
            {changeType === 'add' ? <AddIcon sx={{ mr: 1 }} /> : <RemoveIcon sx={{ mr: 1 }} />}
            {changeType === 'add' ? 'Add to Inventory' : 'Remove from Inventory'}
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setInventoryDialog(false)}
            sx={{
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 2.5 }, pt: 2 }}>
          {selectedProduct && (
            <>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Product: {selectedProduct.name}
              </Typography>
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Current Stock: {selectedProduct.inventory} units
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Quantity"
                type="number"
                fullWidth
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                InputProps={{
                  inputProps: { min: 1 },
                }}
                required
                sx={{ mb: 2, '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
              />
              <TextField
                margin="dense"
                label="Notes (optional)"
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={2}
                sx={{ '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } } }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 1.5 }, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setInventoryDialog(false)}
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
            onClick={handleInventoryUpdate}
            variant="contained"
            color={changeType === 'add' ? 'success' : 'error'}
            disabled={isSubmitting}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: { xs: 0.75, sm: 1 },
              borderRadius: '12px',
              background: changeType === 'add'
                ? 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)'
                : 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
              '&:hover': {
                background: changeType === 'add'
                  ? 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)'
                  : 'linear-gradient(135deg, #d32f2f 0%, #e53935 100%)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} />
            ) : changeType === 'add' ? (
              'Add to Inventory'
            ) : (
              'Remove from Inventory'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory History Dialog */}
      <Dialog
        open={historyDialog}
        onClose={() => setHistoryDialog(false)}
        maxWidth="md"
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
            transition: 'opacity 0.3s ease',
            opacity: 1,
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
            <HistoryIcon sx={{ mr: 1 }} />
            {selectedProduct ? `Inventory History: ${selectedProduct.name}` : 'Inventory History'}
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setHistoryDialog(false)}
            sx={{
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <CancelIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={40} sx={{ color: 'primary.main' }} />
            </Box>
          ) : inventoryHistory.length === 0 ? (
            <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              No history found for this product.
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
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}>
                          Change
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '15%' }}>
                          Quantity
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '30%' }}>
                          Notes
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, width: '20%' }}>
                          By
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {inventoryHistory.map((record, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:hover': { backgroundColor: '#e8f0fe' },
                            backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                          }}
                        >
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                            {new Date(record.date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              py: 1,
                              color: record.transactionType === 'add' ? 'success.main' : 'error.main',
                            }}
                          >
                            {record.transactionType === 'add' ? 'Added' : 'Removed'}
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                            {record.quantity}
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {record.notes}
                          </TableCell>
                          <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1 }}>
                            {record.user ? record.user.name : 'System'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Card Layout for Mobile Screens */}
              <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {inventoryHistory.map((record, index) => (
                  <Card
                    key={index}
                    sx={{
                      mb: 2,
                      borderRadius: '16px',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                      background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
                      borderLeft: '4px solid',
                      borderColor: record.transactionType === 'add' ? 'success.main' : 'error.main',
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.02)' },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 600 }}
                      >
                        {new Date(record.date).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: record.transactionType === 'add' ? 'success.main' : 'error.main',
                          fontWeight: 500,
                        }}
                      >
                        {record.transactionType === 'add' ? 'Added' : 'Removed'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                      >
                        Quantity: {record.quantity}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                      >
                        Notes: {record.notes}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                      >
                        By: {record.user ? record.user.name : 'System'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 1.5 }, justifyContent: 'flex-end' }}>
          <Button
            onClick={() => setHistoryDialog(false)}
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
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement;