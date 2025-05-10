import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Toolbar,
  Box,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AddShoppingCart as OrderIcon,
  Pending as PendingIcon,
  List as ListIcon,
  Store as StoreIcon,
  Inventory as ProductIcon,
  Inventory,
  Payment as PaymentIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ({ onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'New Order', icon: <OrderIcon />, path: '/orders/new' },
    { text: 'Pending Orders', icon: <PendingIcon />, path: '/orders/pending' },
    { text: 'All Orders', icon: <ListIcon />, path: '/orders' },
    { text: 'Products', icon: <ProductIcon />, path: '/products' },
    { text: 'Stores', icon: <StoreIcon />, path: '/stores' },
    { text: 'Record Payment', icon: <PaymentIcon />, path: '/payments/new' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (onItemClick) onItemClick();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Sidebar Header */}
      <Toolbar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 2 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
          Menu
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: '#e0e0e0' }} />

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mb: 0.5,
              '& .MuiListItemIcon-root': {
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 600 : 500,
                color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                fontSize: '0.95rem',
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: '#e0e0e0' }} />

      {/* Logout Button */}
      <Box sx={{ p: 3 }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth
          sx={{
            py: 1.5,
            fontSize: '0.95rem',
            fontWeight: 600,
            bgcolor: '#d32f2f',
            '&:hover': {
              bgcolor: '#b71c1c',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;