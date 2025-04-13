import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Alert, Snackbar, CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { getProducts, createProduct, updateProduct } from '../../utils/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog state
  const [dialog, setDialog] = useState({ open: false, type: 'add' });
  const [currentProduct, setCurrentProduct] = useState({ name: '', price: '', inventory: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Open add product dialog
  const handleAddClick = () => {
    setCurrentProduct({ name: '', price: '', inventory: '' });
    setDialog({ open: true, type: 'add' });
  };

  // Open edit product dialog
  const handleEditClick = (product) => {
    setCurrentProduct({
      id: product._id,
      name: product.name,
      price: product.price,
      inventory: product.inventory
    });
    setDialog({ open: true, type: 'edit' });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialog({ ...dialog, open: false });
  };

  // Handle form changes
  const handleChange = (e) => {
    setCurrentProduct({
      ...currentProduct,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submit
  const handleSubmit = async () => {
    // Validation
    if (!currentProduct.name || !currentProduct.price) {
      setError('Product name and price are required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (dialog.type === 'add') {
        await createProduct({
          name: currentProduct.name,
          price: parseFloat(currentProduct.price),
          inventory: parseInt(currentProduct.inventory) || 0
        });
        setSuccess('Product added successfully');
      } else {
        await updateProduct(currentProduct.id, {
          name: currentProduct.name,
          price: parseFloat(currentProduct.price),
          inventory: parseInt(currentProduct.inventory) || 0
        });
        setSuccess('Product updated successfully');
      }
      
      // Close dialog and refresh products
      handleDialogClose();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product deactivation
  const handleDeactivate = async (productId) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) {
      return;
    }
    
    try {
      await updateProduct(productId, { isActive: false });
      setSuccess('Product deactivated successfully');
      fetchProducts();
    } catch (err) {
      console.error('Error deactivating product:', err);
      setError('Failed to deactivate product. Please try again.');
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Products
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Product
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
      ) : products.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No products found. Add your first product!</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Price (₹)</TableCell>
                <TableCell align="right">Inventory</TableCell>
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
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditClick(product)}
                      title="Edit Product"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeactivate(product._id)}
                      title="Deactivate Product"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Add/Edit Product Dialog */}
      <Dialog 
        open={dialog.open} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialog.type === 'add' ? 'Add New Product' : 'Edit Product'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Product Name"
            fullWidth
            value={currentProduct.name}
            onChange={handleChange}
            required
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            value={currentProduct.price}
            onChange={handleChange}
            InputProps={{
              startAdornment: <Typography variant="body1">₹</Typography>,
            }}
            required
          />
          <TextField
            margin="dense"
            name="inventory"
            label="Inventory (optional)"
            type="number"
            fullWidth
            value={currentProduct.inventory}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList;