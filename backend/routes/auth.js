const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/user');
//const { generateOTP, sendEmail } = require('../utils/email');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const otpStore = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// @route   POST api/auth/forgot-password
// @desc    Send OTP to user's email for password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ msg: 'Email is required' });
    }
    // Find user by email (need to modify user model to include email field)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (15 minutes)
    otpStore.set(email, {
      otp,
      expiry: Date.now() + 10 * 60 * 1000, // 15 minutes
      userId: user._id
    });

    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Cold Drinks Wholesale',
      html: `
        <h1>Password Reset</h1>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ msg: 'OTP sent to your email address' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
      return res.status(400).json({ msg: 'Email and OTP are required' });
    }

  // Check if OTP exists and is valid
  const otpData = otpStore.get(email);
  if (!otpData) {
    return res.status(400).json({ msg: 'Invalid or expired OTP request' });
  }

  // Verify OTP
  if (otpData.otp !== otp) {
    return res.status(400).json({ msg: 'Invalid OTP' });
  }

  // Check if OTP is expired
  if (Date.now() > otpData.expiry) {
    otpStore.delete(email);
    return res.status(400).json({ msg: 'OTP has expired' });
  }

  // OTP is valid
  res.json({ msg: 'OTP verified successfully' });
});

// @route   POST api/auth/reset-password
// @desc    Reset user password
// @access  Public
router.post('/reset-password', async (req, res) => {
  const { email, otp, password } = req.body;

  // Verify OTP again
  const otpData = otpStore.get(email);
  if (!otpData || otpData.otp !== otp || Date.now() > otpData.expiry) {
    return res.status(400).json({ msg: 'Invalid or expired OTP' });
  }

  try {
    // Get user from OTP data
    const user = await User.findById(otpData.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password
    user.password = password; // This will be hashed by the pre-save hook
    await user.save();

    // Clear OTP
    otpStore.delete(email);

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
  return res.status(400).json({ msg: 'Email and password are required' });
}
console.log('Login request:', { email, password });

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await user.validatePassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/register
// @desc    Register a user (only for initial setup)
// @access  Public
router.post('/register', async (req, res) => {
  console.log('Registration request received:', req.body);

  try {
    const { username, password, email, name } = req.body;
    
    // Log the body for debugging
    console.log('Register request body:', { username, email, name, password: password ? '[FILTERED]' : 'missing' });
    
    // Check required fields
    if (!username || !email || !password || !name) {
      console.log('Missing required field(s)');
      return res.status(400).json({ msg: 'Please enter all fields - username, email, password, and name are required' });
    }
    
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      console.log('Username already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Check if email already exists
    user = await User.findOne({ email });
    if (user) {
      console.log('Email already exists');
      return res.status(400).json({ msg: 'Email already exists' });
    }

    // Create new user
    user = new User({
      username,
      password,
      email,
      name
    });

    await user.save();
    console.log('User saved successfully');

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name } });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET api/auth/user
// @desc    Get current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;