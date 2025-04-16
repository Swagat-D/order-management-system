import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  List, ListItem, ListItemIcon, ListItemText, Divider, 
  Typography, Toolbar, Box, Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AddShoppingCart as OrderIcon,
  Pending as PendingIcon,
  List as ListIcon,
  Store as StoreIcon,
  Inventory as ProductIcon,
  Payment as PaymentIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = ( {onItemClick} ) => {
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
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if(onItemClick) onItemClick();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Menu
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&:hover':{
                cursor: 'pointer',
              }
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button 
          variant="outlined" 
          color="error" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          fullWidth
        >
          Logout
        </Button>
      </Box>
    </div>
  );
};

export default Sidebar;