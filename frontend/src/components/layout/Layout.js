import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, Typography, IconButton, CssBaseline } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import Sidebar from './Sidebar';
import { AuthContext } from '../../context/AuthContext';
import theme from '../../theme';

const drawerWidth = 260;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useContext(AuthContext);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            width: '100%',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', maxWidth: 'calc(100% - 150px)' }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: { xs: 1, sm: 2 }, color: 'primary.main' }}
              >
                <MenuIcon sx={{ fontSize: { xs: '24px', sm: '28px' } }} />
              </IconButton>
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }, // Responsive font size
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Cold Drinks Wholesale Management
              </Typography>
            </Box>
            {user && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: 'text.secondary',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' }, // Responsive font size
                  maxWidth: '120px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                Welcome, {user.name}
              </Typography>
            )}
          </Toolbar>
        </AppBar>

        {/* Sidebar Drawer */}
        <Box component="nav">
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: theme.transitions.create('transform', {
                  easing: theme.transitions.easing.easeInOut,
                  duration: theme.transitions.duration.standard,
                }),
              },
            }}
          >
            <Sidebar onItemClick={handleDrawerToggle} />
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            width: '100%',
            marginTop: '64px',
            bgcolor: 'background.default',
            minHeight: 'calc(100vh - 64px)',
            transition: theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;