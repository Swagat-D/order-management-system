import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Alert, Snackbar, CircularProgress,
   Card, CardContent, Grid
} from '@mui/material';
import { 
  Add as AddIcon,
  Remove as RemoveIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { getProducts } from '../../utils/api';
import { 
  getInventory, 
  addInventory, 
  removeInventory, 
  getProductTransactions 
} from '../../utils/inventoryApi';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog state
  const [inventoryDialog, setInventoryDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityChange, setQuantityChange] = useState('');
  const [changeType, setChangeType] = useState('add');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // History dialog state
  const [historyDialog, setHistoryDialog] = useState(false);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load products with inventory
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Try to get products from inventory endpoint first
      const data = await getInventory();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      // Fall back to regular products endpoint if inventory endpoint fails
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

  // Open inventory dialog
  const handleInventoryClick = (product, type) => {
    setSelectedProduct(product);
    setQuantityChange('');
    setChangeType(type);
    setNotes('');
    setInventoryDialog(true);
  };

  // Open history dialog
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

  // Handle inventory update
  const handleInventoryUpdate = async () => {
    const quantity = parseInt(quantityChange);
    
    if (isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call the appropriate API based on change type
      if (changeType === 'add') {
        await addInventory(selectedProduct._id, {
          quantity,
          notes: notes || 'Manual addition'
        });
      } else {
        await removeInventory(selectedProduct._id, {
          quantity,
          notes: notes || 'Manual removal'
        });
      }
      
      setSuccess(`Successfully ${changeType === 'add' ? 'added' : 'removed'} inventory`);
      setInventoryDialog(false);
      fetchProducts();
    } catch (err) {
      console.error('Error updating inventory:', err);
      if (err.msg) {
        setError(err.msg);
      } else {
        setError('Failed to update inventory. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Inventory Management
        </Typography>
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
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h3">
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Total Inventory
              </Typography>
              <Typography variant="h3">
                {loading ? <CircularProgress size={24} /> : 
                  products.reduce((sum, product) => sum + product.inventory, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error" gutterBottom>
                Low Stock Items
              </Typography>
              <Typography variant="h3">
                {loading ? <CircularProgress size={24} /> : 
                  products.filter(product => product.inventory < 10).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No products found!</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Price (₹)</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell align="right">₹{product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">{product.inventory}</TableCell>
                  <TableCell align="center">
                    {product.inventory <= 0 ? (
                      <Typography sx={{ color: 'error.main' }}>Out of Stock</Typography>
                    ) : product.inventory < 10 ? (
                      <Typography sx={{ color: 'warning.main' }}>Low Stock</Typography>
                    ) : (
                      <Typography sx={{ color: 'success.main' }}>In Stock</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="success" 
                      onClick={() => handleInventoryClick(product, 'add')}
                      title="Add Stock"
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleInventoryClick(product, 'remove')}
                      title="Remove Stock"
                      disabled={product.inventory <= 0}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <IconButton 
                      color="info" 
                      onClick={() => handleHistoryClick(product)}
                      title="View History"
                    >
                      <HistoryIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Inventory Update Dialog */}
      <Dialog 
        open={inventoryDialog} 
        onClose={() => setInventoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {changeType === 'add' ? 'Add to Inventory' : 'Remove from Inventory'}
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Product: {selectedProduct.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
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
                  inputProps: { min: 1 }
                }}
                required
              />
              <TextField
                margin="dense"
                label="Notes (optional)"
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={2}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInventoryDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleInventoryUpdate} 
            variant="contained" 
            color={changeType === 'add' ? 'success' : 'error'}
            disabled={isSubmitting}
          >
            {isSubmitting ? 
              <CircularProgress size={24} /> : 
              changeType === 'add' ? 'Add to Inventory' : 'Remove from Inventory'
            }
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Inventory History Dialog */}
      <Dialog 
        open={historyDialog} 
        onClose={() => setHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? `Inventory History: ${selectedProduct.name}` : 'Inventory History'}
        </DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : inventoryHistory.length === 0 ? (
            <Typography>No history found for this product.</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Change</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleString()}</TableCell>
                      <TableCell sx={{ 
                        color: record.transactionType === 'add' ? 'success.main' : 'error.main' 
                      }}>
                        {record.transactionType === 'add' ? 'Added' : 'Removed'}
                      </TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                      <TableCell>{record.user ? record.user.name : 'System'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryManagement;