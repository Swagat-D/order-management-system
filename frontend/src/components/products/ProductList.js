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
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { getProducts, createProduct, updateProduct } from '../../utils/api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialog, setDialog] = useState({ open: false, type: 'add' });
  const [currentProduct, setCurrentProduct] = useState({ name: '', price: '', inventory: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ name: '', price: '', inventory: '' });

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

  const handleAddClick = () => {
    setCurrentProduct({ name: '', price: '', inventory: '' });
    setErrors({ name: '', price: '', inventory: '' });
    setDialog({ open: true, type: 'add' });
  };

  const handleEditClick = (product) => {
    setCurrentProduct({
      id: product._id,
      name: product.name,
      price: product.price,
      inventory: product.inventory,
    });
    setErrors({ name: '', price: '', inventory: '' });
    setDialog({ open: true, type: 'edit' });
  };

  const handleDialogClose = () => {
    setDialog({ open: false, type: 'add' });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', price: '', inventory: '' };

    if (!currentProduct.name.trim()) {
      newErrors.name = 'Product name is required.';
      isValid = false;
    }

    if (!currentProduct.price || parseFloat(currentProduct.price) <= 0) {
      newErrors.price = 'Price must be a positive number.';
      isValid = false;
    }

    if (currentProduct.inventory && parseInt(currentProduct.inventory) < 0) {
      newErrors.inventory = 'Inventory cannot be negative.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    setCurrentProduct({
      ...currentProduct,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (dialog.type === 'add') {
        await createProduct({
          name: currentProduct.name,
          price: parseFloat(currentProduct.price),
          inventory: parseInt(currentProduct.inventory) || 0,
        });
        setSuccess('Product added successfully!');
      } else {
        await updateProduct(currentProduct.id, {
          name: currentProduct.name,
          price: parseFloat(currentProduct.price),
          inventory: parseInt(currentProduct.inventory) || 0,
        });
        setSuccess('Product updated successfully!');
      }
      handleDialogClose();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (productId) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await updateProduct(productId, { isActive: false });
      setSuccess('Product deactivated successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Error deactivating product:', err);
      setError('Failed to deactivate product. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 1200 }, mx: 'auto', px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
          Products
        </Typography>
        <Button
          variant="contained"
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
          Add Product
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
            No products found. Add your first product!
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
                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}>
                      Name
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                    >
                      Price
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                    >
                      Inventory
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
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
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {product.name}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {formatCurrency(product.price)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {product.inventory}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(product)}
                          title="Edit Product"
                          aria-label="Edit product"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeactivate(product._id)}
                          title="Deactivate Product"
                          aria-label="Deactivate product"
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            '&:hover': { bgcolor: 'error.light', transform: 'scale(1.1)' },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <DeleteIcon fontSize="small" />
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
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: 'primary.main',
                      fontWeight: 500,
                    }}
                  >
                    Price: {formatCurrency(product.price)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                  >
                    Inventory: {product.inventory}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', p: { xs: 1, sm: 1.5 } }}>
                  <IconButton
                    color="primary"
                    onClick={() => handleEditClick(product)}
                    title="Edit Product"
                    aria-label="Edit product"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDeactivate(product._id)}
                    title="Deactivate Product"
                    aria-label="Deactivate product"
                    sx={{
                      p: 1,
                      '&:hover': { bgcolor: 'error.light', transform: 'scale(1.1)' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={dialog.open}
        onClose={handleDialogClose}
        maxWidth="xs" // Reduced size for better mobile compatibility
        fullWidth
        fullScreen={false} // Disabled full-screen to avoid taking the entire page
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            margin: { xs: 2, sm: 3 }, // Added margin for better spacing on mobile
            maxHeight: '80vh', // Limit height to avoid overflow
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 1.5, // Reduced padding for compactness
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {dialog.type === 'add' ? <AddIcon sx={{ mr: 1 }} /> : <EditIcon sx={{ mr: 1 }} />}
            {dialog.type === 'add' ? 'Add New Product' : 'Edit Product'}
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
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
            label="Product Name"
            fullWidth
            value={currentProduct.name}
            onChange={handleChange}
            required
            error={!!errors.name}
            helperText={errors.name}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#f5f7fa' },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
              mb: 1.5, // Reduced spacing between fields
            }}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            value={currentProduct.price}
            onChange={handleChange}
            required
            error={!!errors.price}
            helperText={errors.price}
            InputProps={{
              startAdornment: (
                <Typography sx={{ color: 'text.secondary', mr: 1 }}>₹</Typography>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#f5f7fa' },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
              mb: 1.5,
            }}
          />
          <TextField
            margin="dense"
            name="inventory"
            label="Inventory (optional)"
            type="number"
            fullWidth
            value={currentProduct.inventory}
            onChange={handleChange}
            error={!!errors.inventory}
            helperText={errors.inventory}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#f5f7fa' },
              },
              '& .MuiInputLabel-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 1.5 }, justifyContent: 'space-between' }}>
          <Button
            onClick={handleDialogClose}
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
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting}
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: 0.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e',
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductList;