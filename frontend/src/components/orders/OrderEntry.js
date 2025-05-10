import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, Store as StoreIcon, ShoppingCart as ProductIcon, Note as NoteIcon } from '@mui/icons-material';
import { getProducts, getStores, createStore, createOrder } from '../../utils/api';

const OrderEntry = () => {
  const [store, setStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({
    store: '',
    product: '',
    quantity: '',
    orderItems: '',
    newStoreName: '',
    newStoreAddress: '',
  });
  const [storeSearchInput, setStoreSearchInput] = useState('');
  const [newStoreDialog, setNewStoreDialog] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    address: '',
    contactName: '',
    contactPhone: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setErrors((prev) => ({ ...prev, product: 'Failed to load products. Please try refreshing.' }));
      }
    };
    fetchProducts();
  }, []);

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

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const validateAddProduct = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!selectedProduct) {
      newErrors.product = 'Please select a product.';
      isValid = false;
    } else {
      newErrors.product = '';
    }

    if (quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0.';
      isValid = false;
    } else {
      newErrors.quantity = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddProduct = () => {
    if (!validateAddProduct()) return;

    const existingItemIndex = orderItems.findIndex(
      (item) => item.productId === selectedProduct._id
    );
    if (existingItemIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      updatedItems[existingItemIndex].total =
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: selectedProduct._id,
          productName: selectedProduct.name,
          price: selectedProduct.price,
          quantity: quantity,
          total: selectedProduct.price * quantity,
        },
      ]);
    }
    setSelectedProduct(null);
    setQuantity(1);
    setErrors((prev) => ({ ...prev, orderItems: '' }));
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const handleNewStoreClick = () => {
    setNewStore({
      name: storeSearchInput,
      address: '',
      contactName: '',
      contactPhone: '',
    });
    setNewStoreDialog(true);
  };

  const validateNewStore = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!newStore.name.trim()) {
      newErrors.newStoreName = 'Store name is required.';
      isValid = false;
    } else {
      newErrors.newStoreName = '';
    }

    if (!newStore.address.trim()) {
      newErrors.newStoreAddress = 'Store address is required.';
      isValid = false;
    } else {
      newErrors.newStoreAddress = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateStore = async () => {
    if (!validateNewStore()) return;

    try {
      const createdStore = await createStore(newStore);
      setStores([...stores, createdStore]);
      setStore(createdStore);
      setNewStoreDialog(false);
      setErrors((prev) => ({ ...prev, store: '' }));
    } catch (err) {
      console.error('Error creating store:', err);
      setErrors((prev) => ({ ...prev, newStoreName: 'Failed to create store. Please try again.' }));
    }
  };

  const validateOrder = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!store) {
      newErrors.store = 'Please select a store.';
      isValid = false;
    } else {
      newErrors.store = '';
    }

    if (orderItems.length === 0) {
      newErrors.orderItems = 'Please add at least one product to the order.';
      isValid = false;
    } else {
      newErrors.orderItems = '';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitOrder = async () => {
    if (!validateOrder()) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, orderItems: '', store: '' }));
    try {
      const orderData = {
        storeId: store._id,
        items: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        notes,
      };
      await createOrder(orderData);
      setStore(null);
      setOrderItems([]);
      setNotes('');
      setSuccess(true);
    } catch (err) {
      console.error('Error creating order:', err);
      setErrors((prev) => ({ ...prev, orderItems: 'Failed to create order. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <Box sx={{ maxWidth: { xs: '100%', sm: 1200 }, mx: 'auto', px: { xs: 1, sm: 0 }, py: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.5rem', sm: '2rem' },
          letterSpacing: '0.5px',
          color: 'text.primary',
          position: 'relative',
          mb: 4,
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
        New Order
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
          Order created successfully!
        </Alert>
      </Snackbar>

      {Object.values(errors).some((error) => error && !['product', 'quantity', 'newStoreName', 'newStoreAddress'].includes(error)) && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: '12px',
            bgcolor: 'error.light',
            color: 'error.contrastText',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {errors.store || errors.orderItems || 'Please correct the errors below.'}
        </Alert>
      )}

      {/* Store Information */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
          borderLeft: '4px solid',
          borderColor: 'primary.main',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            '& svg': {
              mr: 1,
              color: 'primary.main',
            },
          }}
        >
          <StoreIcon /> Store Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              value={store}
              onChange={(event, newValue) => {
                setStore(newValue);
                setErrors((prev) => ({ ...prev, store: '' }));
              }}
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
                  error={!!errors.store}
                  helperText={errors.store || 'Type at least 2 characters to search'}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <StoreIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#f5f7fa',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      color: 'text.secondary',
                    },
                  }}
                />
              )}
              freeSolo
              fullWidth
            />
          </Grid>
          {!store && storeSearchInput.length >= 2 && (
            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={handleNewStoreClick}
                startIcon={<AddIcon />}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  py: { xs: 0.75, sm: 1 },
                  px: { xs: 1.5, sm: 2.5 },
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
                  color: '#ffffff',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
                    transform: 'scale(1.05)',
                    transition: 'all 0.3s ease',
                  },
                }}
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
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    bgcolor: '#f5f7fa',
                    borderRadius: '8px',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    fontWeight: 500,
                  },
                }}
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
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    bgcolor: '#f5f7fa',
                    borderRadius: '8px',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'text.secondary',
                    fontWeight: 500,
                  },
                }}
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Add Products */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
          borderLeft: '4px solid',
          borderColor: 'secondary.main',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            '& svg': {
              mr: 1,
              color: 'secondary.main',
            },
          }}
        >
          <ProductIcon /> Add Products
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <Autocomplete
              value={selectedProduct}
              onChange={(event, newValue) => {
                setSelectedProduct(newValue);
                setErrors((prev) => ({ ...prev, product: '' }));
              }}
              options={products}
              getOptionLabel={(option) => `${option.name} - ₹${option.price}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Product"
                  variant="outlined"
                  fullWidth
                  error={!!errors.product}
                  helperText={errors.product}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <ProductIcon sx={{ color: 'secondary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#f5f7fa',
                      },
                    },
                  }}
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value._id}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(parseInt(e.target.value) || 0);
                setErrors((prev) => ({ ...prev, quantity: '' }));
              }}
              InputProps={{
                inputProps: { min: 1 },
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography sx={{ color: 'text.secondary' }}>#</Typography>
                  </InputAdornment>
                ),
              }}
              fullWidth
              error={!!errors.quantity}
              helperText={errors.quantity}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#f5f7fa',
                  },
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Button
              variant="contained"
              onClick={handleAddProduct}
              startIcon={<AddIcon />}
              disabled={!selectedProduct || quantity <= 0}
              fullWidth
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 0.75, sm: 1 },
                px: { xs: 1.5, sm: 2.5 },
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #f06292 0%, #ff94c2 100%)',
                color: '#ffffff',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ba2d65 0%, #ff94c2 100%)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.3s ease',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
        {orderItems.length > 0 && (
          <>
            {/* Table Layout for Larger Screens */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <TableContainer sx={{ mt: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        background: 'linear-gradient(90deg, #f5f7fa 0%, #e8ecef 100%)',
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: 'text.primary',
                        }}
                      >
                        Product
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: 'text.primary',
                        }}
                      >
                        Price
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: 'text.primary',
                        }}
                      >
                        Quantity
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: 'text.primary',
                        }}
                      >
                        Total
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          color: 'text.primary',
                        }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderItems.map((item, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                          transition: 'background-color 0.3s ease',
                          '&:hover': {
                            backgroundColor: '#e8f0fe',
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: 'text.primary',
                          }}
                        >
                          {item.productName}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: 'text.primary',
                          }}
                        >
                          {formatCurrency(item.price)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: 'text.primary',
                          }}
                        >
                          {item.quantity}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            color: 'text.primary',
                            fontWeight: 500,
                          }}
                        >
                          {formatCurrency(item.total)}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveItem(index)}
                            sx={{
                              '&:hover': {
                                bgcolor: '#ffebee',
                                transform: 'scale(1.1)',
                                transition: 'all 0.3s ease',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow
                      sx={{
                        background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
                      }}
                    >
                      <TableCell colSpan={3} align="right">
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: 'primary.main' }}
                        >
                          Total Amount:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, color: 'primary.main' }}
                        >
                          {formatCurrency(calculateTotal())}
                        </Typography>
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Card Layout for Mobile Screens */}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              {orderItems.map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    mb: 2,
                    borderRadius: '16px',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
                    borderLeft: '4px solid',
                    borderColor: 'secondary.main',
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 600 }}
                    >
                      Product: {item.productName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                    >
                      Price: {formatCurrency(item.price)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'text.secondary' }}
                    >
                      Quantity: {item.quantity}
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
                      Total: {formatCurrency(item.total)}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', p: { xs: 1, sm: 1.5 } }}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                      title="Remove Item"
                      sx={{
                        p: 1,
                        '&:hover': { bgcolor: '#ffebee', transform: 'scale(1.1)' },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </CardActions>
                </Card>
              ))}
              <Card
                sx={{
                  borderRadius: '16px',
                  boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%)',
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      fontWeight: 600,
                      color: 'primary.main',
                      textAlign: 'center',
                    }}
                  >
                    Total Amount: {formatCurrency(calculateTotal())}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </>
        )}
        {errors.orderItems && (
          <Typography color="error" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {errors.orderItems}
          </Typography>
        )}
      </Paper>

      {/* Order Notes */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          borderRadius: '16px',
          boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
          borderLeft: '4px solid',
          borderColor: 'primary.main',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
            color: 'text.primary',
            display: 'flex',
            alignItems: 'center',
            '& svg': {
              mr: 1,
              color: 'primary.main',
            },
          }}
        >
          <NoteIcon /> Order Notes
        </Typography>
        <TextField
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          multiline
          rows={3}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <NoteIcon sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#f5f7fa',
              },
            },
          }}
        />
      </Paper>

      {/* Submit Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSubmitOrder}
          disabled={loading}
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            py: { xs: 1, sm: 1.5 },
            px: { xs: 2.5, sm: 4 },
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
              transform: 'scale(1.05)',
              transition: 'all 0.3s ease',
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#9e9e9e',
            },
          }}
        >
          {loading ? 'Creating Order...' : 'Create Order'}
        </Button>
      </Box>

      {/* New Store Dialog */}
      <Dialog
        open={newStoreDialog}
        onClose={() => setNewStoreDialog(false)}
        fullWidth
        maxWidth="xs"
        fullScreen={false}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: { xs: 0, sm: '16px' },
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            margin: { xs: 2, sm: 3 },
            maxHeight: '80vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            color: 'text.primary',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            '& svg': {
              mr: 1,
            },
          }}
        >
          <StoreIcon /> Add New Store
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <TextField
            autoFocus
            margin="dense"
            label="Store Name"
            fullWidth
            value={newStore.name}
            onChange={(e) => {
              setNewStore({ ...newStore, name: e.target.value });
              setErrors((prev) => ({ ...prev, newStoreName: '' }));
            }}
            required
            error={!!errors.newStoreName}
            helperText={errors.newStoreName}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <StoreIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            value={newStore.address}
            onChange={(e) => {
              setNewStore({ ...newStore, address: e.target.value });
              setErrors((prev) => ({ ...prev, newStoreAddress: '' }));
            }}
            required
            error={!!errors.newStoreAddress}
            helperText={errors.newStoreAddress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: 'text.secondary' }}>📍</Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="Contact Name"
            fullWidth
            value={newStore.contactName}
            onChange={(e) => setNewStore({ ...newStore, contactName: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: 'text.secondary' }}>👤</Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              },
            }}
          />
          <TextField
            margin="dense"
            label="Contact Phone"
            fullWidth
            value={newStore.contactPhone}
            onChange={(e) => setNewStore({ ...newStore, contactPhone: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: 'text.secondary' }}>📞</Typography>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiInputBase-root': {
                fontSize: { xs: '0.875rem', sm: '1rem' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#f5f7fa',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1, sm: 2 } }}>
          <Button
            onClick={() => setNewStoreDialog(false)}
            sx={{
              borderRadius: '10px',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 2, sm: 3 },
              py: 0.5,
              color: 'text.primary',
              '&:hover': {
                bgcolor: '#f5f5f5',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateStore}
            variant="contained"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.75, sm: 1 },
              px: { xs: 2, sm: 3 },
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
              color: '#ffffff',
              '&:hover': {
                background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
                transform: 'scale(1.05)',
                transition: 'all 0.3s ease',
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#9e9e9e',
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderEntry;