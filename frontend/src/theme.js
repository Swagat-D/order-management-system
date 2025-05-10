import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0288d1', // Vibrant blue
      light: '#4fb3bf',
      dark: '#005b9f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f06292', // Soft pink
      light: '#ff94c2',
      dark: '#ba2d65',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa', // Slightly softer gray for a cleaner look
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a', // Darker for better contrast
      secondary: '#666666', // Softer gray for secondary text
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', // Modern font
    h6: {
      fontWeight: 700,
      color: '#1a1a1a',
      letterSpacing: '0.5px',
    },
    body1: {
      fontSize: '0.95rem',
      fontWeight: 500,
    },
    body2: {
      fontSize: '0.85rem',
      fontWeight: 400,
      color: '#666666',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff', // White AppBar for a cleaner look
          color: '#1a1a1a',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', // Softer shadow
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: 'none',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)', // Subtle shadow for depth
          transition: 'transform 0.3s ease-in-out',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '6px 12px',
          padding: '10px 16px',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#e8f0fe', // Softer blue on hover
            transform: 'translateX(4px)', // Subtle shift on hover
          },
          '&.Mui-selected': {
            backgroundColor: '#d1e4ff', // Light blue for selected
            '&:hover': {
              backgroundColor: '#d1e4ff',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '40px', // Better spacing for icons
          color: '#666666',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '10px',
          padding: '10px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          },
        },
      },
    },
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    duration: {
      standard: 300,
    },
  },
});

export default theme;