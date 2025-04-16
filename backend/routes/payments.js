const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/payment');

// @route   GET api/payments
// @desc    Get all payments with pagination
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const storeId = req.query.storeId || '';
    
    // Build filter query
    const query = {};
    if (storeId) query.store = storeId;
    
    // Get payments with pagination
    const payments = await Payment.find(query)
      .populate('store', 'name')
      .populate('order', 'orderDate')
      .sort({ paymentDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    // Get total count for pagination
    const total = await Payment.countDocuments(query);
    
    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalPayments: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/payments/store/:storeId
// @desc    Get payments for a specific store
// @access  Private
router.get('/store/:storeId', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ store: req.params.storeId })
      .populate('order', 'orderDate totalAmount')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('store', 'name')
      .populate('order', 'orderDate totalAmount');
    
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Payment not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/payments/store/:storeId
// @desc    Record a payment for a store (not tied to a specific order)
// @access  Private
router.post('/store/:storeId', auth, async (req, res) => {
  try {
    const { amount, paymentType, notes } = req.body;
    
    // Input validation
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: 'Please enter a valid payment amount' });
    }
    
    // Find the store
    const store = await Store.findById(req.params.storeId);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    // Create the payment
    const payment = new Payment({
      store: req.params.storeId,
      amount: parseFloat(amount),
      paymentType: paymentType || 'cash',
      notes: notes || 'General payment'
    });
    
    // Update store balance
    store.balance += parseFloat(amount);
    
    // Save both the payment and updated store
    await payment.save();
    await store.save();
    
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;