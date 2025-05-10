import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { LocalDrink as LocalDrinkIcon } from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [message] = useState(location.state?.message || '');
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(username, password);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 1, sm: 2 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            width: '100%',
            borderRadius: '16px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.1)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9f9f9 100%)',
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: 1,
            '&:hover': { transform: 'scale(1.02)' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <LocalDrinkIcon
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem' },
                color: 'primary.main',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.1)' },
              }}
            />
          </Box>
          <Typography
            component="h1"
            variant="h5"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
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
                left: '50%',
                transform: 'translateX(-50%)',
                width: '50px',
                height: '4px',
                bgcolor: 'secondary.main',
                borderRadius: '2px',
              },
            }}
          >
            Cold Drinks Wholesale
          </Typography>
          <Typography
            component="h2"
            variant="h6"
            align="center"
            sx={{
              mb: 3,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: 'text.secondary',
            }}
          >
            Login
          </Typography>

          {message && (
            <Alert
              severity="success"
              sx={{
                mb: 2,
                borderRadius: '12px',
                bgcolor: 'success.light',
                color: 'success.contrastText',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {message}
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: '12px',
                bgcolor: 'error.light',
                color: 'error.contrastText',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{
                '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                py: { xs: 1, sm: 1.5 },
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      '&:hover': { color: 'secondary.main', textDecoration: 'underline' },
                      py: 1,
                      px: 2,
                    }}
                  >
                    Don't have an account? Register
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;