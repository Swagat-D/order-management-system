import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LocalDrink as LocalDrinkIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username: formData.username,
        password: formData.password,
        name: formData.name,
      });
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
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
            Create Account
          </Typography>

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
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              sx={{
                '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
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
  type={showPassword ? 'text' : 'password'}
  id="password"
  autoComplete="new-password"
  value={formData.password}
  onChange={handleChange}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={() => setShowPassword(!showPassword)}
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
  sx={{
    '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
    '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
  }}
/>
            <TextField
  margin="normal"
  required
  fullWidth
  name="confirmPassword"
  label="Confirm Password"
  type={showConfirmPassword ? 'text' : 'password'}
  id="confirmPassword"
  value={formData.confirmPassword}
  onChange={handleChange}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle confirm password visibility"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          edge="end"
        >
          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
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
                py: { xs: 1, sm: '1.5' },
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0288d1 0%, #4fb3bf 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #005b9f 0%, #4fb3bf 100%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login" style={{ textDecoration: 'none' }}>
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
                    Already have an account? Sign in
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

export default Register;