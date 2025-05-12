import React, { useState, useEffect, useCallback } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  LocalDrink as LocalDrinkIcon,
  Visibility,
  VisibilityOff,
  Email,
  Key,
  Lock,
  LockReset,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Custom password field component for code reusability
const PasswordField = ({
  id,
  label,
  value,
  onChange,
  showPassword,
  togglePassword,
  error,
  helperText,
  autoComplete = 'new-password',
  ...props
}) => (
  <TextField
    margin="normal"
    required
    fullWidth
    id={id}
    name={id}
    label={label}
    type={showPassword ? 'text' : 'password'}
    value={value}
    onChange={onChange}
    autoComplete={autoComplete}
    error={Boolean(error)}
    helperText={helperText}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Lock color="action" />
        </InputAdornment>
      ),
      endAdornment: (
        <InputAdornment position="end">
          <Tooltip title={showPassword ? "Hide password" : "Show password"} arrow>
            <IconButton
              aria-label="toggle password visibility"
              onClick={togglePassword}
              edge="end"
              size="medium"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Tooltip>
        </InputAdornment>
      ),
    }}
    sx={{
      '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
      '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
      '& .MuiFormHelperText-root': { fontSize: { xs: '0.7rem', sm: '0.75rem' } },
    }}
    {...props}
  />
);

const ForgotPassword = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  
  // Step management
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Enter Email', 'Verify OTP', 'Reset Password'];
  
  // Form fields
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [otpError, setOtpError] = useState('');

  // Email validation
  const validateEmail = useCallback(() => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  }, [email]);

  // Password validation
  const validatePassword = useCallback(() => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  }, [password]);

  // Confirm password validation
  const validateConfirmPassword = useCallback(() => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  }, [password, confirmPassword]);

  // OTP validation
  const validateOTP = useCallback(() => {
    if (!otp) {
      setOtpError('OTP is required');
      return false;
    } else if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setOtpError('OTP must be 6 digits');
      return false;
    } else {
      setOtpError('');
      return true;
    }
  }, [otp]);

  // Handle toggling password visibility
  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Reset all errors when changing steps
  useEffect(() => {
    setError('');
    setSuccess('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setOtpError('');
  }, [activeStep]);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSuccess(response.data.msg || 'OTP sent to your email. Please check your inbox.');
      setActiveStep(1);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to send OTP. Please try again.';
      setError(errorMsg);
      if (errorMsg.toLowerCase().includes('user not found')) {
        setEmailError('This email is not registered');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    // Validate OTP
    if (!validateOTP()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      setSuccess(response.data.msg || 'OTP verified successfully');
      setActiveStep(2);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Invalid OTP. Please try again.';
      setError(errorMsg);
      if (errorMsg.toLowerCase().includes('invalid otp')) {
        setOtpError('Invalid OTP code');
      } else if (errorMsg.toLowerCase().includes('expired')) {
        setOtpError('OTP has expired');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate password fields
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    if (!isPasswordValid || !isConfirmPasswordValid) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, { 
        email, 
        otp, 
        password 
      });
      setSuccess(response.data.msg || 'Password reset successful');
      
      // Redirect after successful password reset with a delay for user to see success message
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successful! Please log in with your new password.' } 
        });
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Failed to reset password. Please try again.';
      setError(errorMsg);
      if (errorMsg.toLowerCase().includes('expired')) {
        // OTP expired during password reset
        setError('Your session has expired. Please restart the password reset process.');
        setTimeout(() => {
          setActiveStep(0);
        }, 3000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!validateEmail()) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSuccess('New OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleRequestOTP} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(emailError)}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiFormHelperText-root': { fontSize: { xs: '0.7rem', sm: '0.75rem' } },
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
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          </Box>
        );
      case 1:
        return (
          <Box component="form" onSubmit={handleVerifyOTP} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="OTP Code"
              name="otp"
              autoComplete="off"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={Boolean(otpError)}
              helperText={otpError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Key color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiFormHelperText-root': { fontSize: { xs: '0.7rem', sm: '0.75rem' } },
              }}
              inputProps={{ maxLength: 6 }}
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
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                onClick={handleResendOTP}
                disabled={isSubmitting}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  textTransform: 'none',
                  color: 'primary.main',
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                }}
              >
                Didn't receive OTP? Resend
              </Button>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 1 }}>
            <PasswordField
              id="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              togglePassword={togglePassword}
              error={passwordError}
              helperText={passwordError}
              autoComplete="new-password"
            />
            <PasswordField
              id="confirmPassword"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showPassword={showConfirmPassword}
              togglePassword={toggleConfirmPassword}
              error={confirmPasswordError}
              helperText={confirmPasswordError}
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockReset color="action" />
                  </InputAdornment>
                ),
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
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </Button>
          </Box>
        );
      default:
        return 'Unknown step';
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
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: 'text.secondary',
            }}
          >
            Reset Password
          </Typography>

          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            sx={{ 
              mb: 3,
              '& .MuiStepLabel-label': {
                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                mt: { xs: 0.5, sm: 1 }
              }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

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

          {success && (
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
              {success}
            </Alert>
          )}

          {getStepContent(activeStep)}
          
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
                  Remember your password? Sign in
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;