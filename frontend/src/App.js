import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';

// Layouts
import Layout from './components/layout/Layout';

// Authentication
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';

// Main components
import Dashboard from './components/dashboard/Dashboard';
import OrderEntry from './components/orders/OrderEntry';
import PendingOrders from './components/orders/PendingOrders';
import OrderList from './components/orders/OrderList';
import ProductList from './components/products/ProductList';
import StoreList from './components/stores/StoreList';
import StoreDetail from './components/stores/StoreDetail';
import PaymentForm from './components/payments/PaymentForm';
import Register from './components/auth/Register';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="orders/new" element={<OrderEntry />} />
              <Route path="orders/pending" element={<PendingOrders />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="products" element={<ProductList />} />
              <Route path="stores" element={<StoreList />} />
              <Route path="stores/:id" element={<StoreDetail />} />
              <Route path="payments/new" element={<PaymentForm />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;