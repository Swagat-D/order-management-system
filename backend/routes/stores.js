const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Store = require('../models/store');

// @route   GET api/stores
// @desc    Get all stores
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }
    
    const stores = await Store.find(query).sort({ name: 1 });
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/stores/outstanding
// @desc    Get stores with outstanding balances
// @access  Private
router.get('/outstanding', auth, async (req, res) => {
  try {
    const stores = await Store.find({ balance: { $lt: 0 } })
      .sort({ balance: 1 }); // Most debt first
    res.json(stores);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/stores/:id
// @desc    Get store by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    res.json(store);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/stores
// @desc    Create a store
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, address, contactName, contactPhone } = req.body;
  
  try {
    const newStore = new Store({
      name,
      address,
      contactName,
      contactPhone
    });
    
    const store = await newStore.save();
    res.json(store);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/stores/:id
// @desc    Update a store
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, address, contactName, contactPhone } = req.body;
  
  try {
    let store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    // Update fields
    if (name) store.name = name;
    if (address) store.address = address;
    if (contactName !== undefined) store.contactName = contactName;
    if (contactPhone !== undefined) store.contactPhone = contactPhone;
    
    await store.save();
    res.json(store);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   POST api/stores/:id/payment
// @desc    Record a payment from a store
// @access  Private
router.post('/:id/payment', auth, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    const { amount, paymentType, notes } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: 'Please provide a valid payment amount' });
    }
    
    // Update store balance (add to balance since negative balance is debt)
    store.balance += parseFloat(amount);
    await store.save();
    
    // Create payment record
    const Payment = require('../models/payment');
    const payment = new Payment({
      store: store._id,
      amount,
      paymentType: paymentType || 'cash',
      notes: notes || 'Balance payment'
    });
    
    await payment.save();
    
    res.json({ 
      payment, 
      store: { 
        id: store._id, 
        name: store.name, 
        balance: store.balance 
      } 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;