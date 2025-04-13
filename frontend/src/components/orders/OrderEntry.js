import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Autocomplete, Grid, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Snackbar, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { getProducts, getStores, createStore, createOrder } from '../../utils/api';

const OrderEntry = () => {
  // State for order
  const [store, setStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // State for store search
  const [storeSearchInput, setStoreSearchInput] = useState('');
  
  // State for new store dialog
  const [newStoreDialog, setNewStoreDialog] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    contactName: '',
    contactPhone: ''
  });

  // Load products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try refreshing.');
      }
    };

    fetchProducts();
  }, []);

  // Load stores when search changes
  useEffect(() => {
    const fetchStores = async () => {
      if (!storeSearchInput || storeSearchInput.length < 2) return;
      
      try {
        const data = await getStores(storeSearchInput);
        setStores(data);
      } catch (err) {
        console.error('Error fetching stores:', err);
      }
    };

    const timer = setTimeout(() => {
      if (storeSearchInput) fetchStores();
    }, 500);

    return () => clearTimeout(timer);
  }, [storeSearchInput]);

  // Calculate order total
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  // Handle adding product to order
  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    // Check if product is already in order
    const existingItemIndex = orderItems.findIndex(
      item => item.productId === selectedProduct._id
    );
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      setOrderItems([
        ...orderItems,
        {
          productId: selectedProduct._id,
          productName: selectedProduct.name,
          price: selectedProduct.price,
          quantity: quantity,
          total: selectedProduct.price * quantity
        }
      ]);
    }
    
    // Reset selection
    setSelectedProduct(null);
    setQuantity(1);
  };

  // Handle removing product from order
  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  // Handle opening new store dialog
  const handleNewStoreClick = () => {
    setNewStore({
      name: storeSearchInput,
      address: '',
      contactName: '',
      contactPhone: ''
    });
    setNewStoreDialog(true);
  };

  // Handle creating new store
  const handleCreateStore = async () => {
    try {
      const createdStore = await createStore(newStore);
      setStores([...stores, createdStore]);
      setStore(createdStore);
      setNewStoreDialog(false);
    } catch (err) {
      console.error('Error creating store:', err);
      setError('Failed to create store. Please try again.');
    }
  };

  // Handle submitting order
  const handleSubmitOrder = async () => {
    if (!store || orderItems.length === 0) {
      setError('Please select a store and add products to the order');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const orderData = {
        storeId: store._id,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        notes
      };
      
      await createOrder(orderData);
      
      // Reset form
      setStore(null);
      setOrderItems([]);
      setNotes('');
      setSuccess(true);
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        New Order
      </Typography>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Order created successfully!
        </Alert>
      </Snackbar>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Store Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              value={store}
              onChange={(event, newValue) => setStore(newValue)}
              inputValue={storeSearchInput}
              onInputChange={(event, newValue) => setStoreSearchInput(newValue)}
              options={stores}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Search Store" 
                  variant="outlined" 
                  fullWidth
                  helperText="Type at least 2 characters to search"
                />
              )}
              freeSolo
              fullWidth
            />
          </Grid>
          
          {!store && storeSearchInput.length >= 2 && (
            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={handleNewStoreClick}
                startIcon={<AddIcon />}
              >
                Create New Store
              </Button>
            </Grid>
          )}
          
          {store && (
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                value={store.address || ''}
                fullWidth
                disabled
              />
            </Grid>
          )}
          
          {store && (
            <Grid item xs={12} sm={6}>
              <TextField
                label="Contact"
                value={store.contactName || 'N/A'}
                fullWidth
                disabled
              />
            </Grid>
          )}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Products
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Autocomplete
              value={selectedProduct}
              onChange={(event, newValue) => setSelectedProduct(newValue)}
              options={products}
              getOptionLabel={(option) => `${option.name} - ₹${option.price}`}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select Product" 
                  variant="outlined" 
                  fullWidth
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              InputProps={{
                inputProps: { min: 1 }
              }}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleAddProduct}
              startIcon={<AddIcon />}
              disabled={!selectedProduct}
              fullWidth
            >
              Add
            </Button>
          </Grid>
        </Grid>
        
        {orderItems.length > 0 && (
          <TableContainer sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">₹{item.total.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
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
                      ₹{calculateTotal().toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Notes
        </Typography>
        
        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSubmitOrder}
          disabled={loading || !store || orderItems.length === 0}
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </Button>
      </Box>
      
      {/* New Store Dialog */}
      <Dialog open={newStoreDialog} onClose={() => setNewStoreDialog(false)}>
        <DialogTitle>Add New Store</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Store Name"
            fullWidth
            value={newStore.name}
            onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={newStore.address}
            onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
            required
          />
          <TextField
            margin="dense"
            label="Contact Name"
            fullWidth
            value={newStore.contactName}
            onChange={(e) => setNewStore({ ...newStore, contactName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Contact Phone"
            fullWidth
            value={newStore.contactPhone}
            onChange={(e) => setNewStore({ ...newStore, contactPhone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewStoreDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateStore} 
            variant="contained" 
            color="primary"
            disabled={!newStore.name || !newStore.address}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderEntry;