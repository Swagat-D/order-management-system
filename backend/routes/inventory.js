const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Product = require('../models/product');
const InventoryTransaction = require('../models/inventoryTransaction');

// @route   GET api/inventory
// @desc    Get inventory levels for all products
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// IMPORTANT: General routes must come BEFORE parameter routes to avoid conflicts
// @route   GET api/inventory/transactions
// @desc    Get all inventory transactions
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const transactions = await InventoryTransaction.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('product', 'name')
      .populate('user', 'name');
    
    const total = await InventoryTransaction.countDocuments();
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalTransactions: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/inventory/:id/add
// @desc    Add inventory to a product
// @access  Private
router.post('/:id/add', auth, async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    
    // Validate input
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ msg: 'Please enter a valid quantity' });
    }
    
    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Record previous quantity
    const previousQuantity = product.inventory;
    
    // Update product inventory
    product.inventory += parseInt(quantity);
    await product.save();
    
    // Create inventory transaction record
    const transaction = new InventoryTransaction({
      product: product._id,
      transactionType: 'add',
      quantity: parseInt(quantity),
      previousQuantity,
      newQuantity: product.inventory,
      reference: 'manual',
      notes: notes || 'Manual addition',
      user: req.user.id
    });
    
    await transaction.save();
    
    res.json({
      product,
      transaction
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/inventory/:id/remove
// @desc    Remove inventory from a product
// @access  Private
router.post('/:id/remove', auth, async (req, res) => {
  try {
    const { quantity, notes } = req.body;
    
    // Validate input
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ msg: 'Please enter a valid quantity' });
    }
    
    // Find product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    
    // Check if enough inventory
    if (product.inventory < parseInt(quantity)) {
      return res.status(400).json({ msg: 'Not enough inventory available' });
    }
    
    // Record previous quantity
    const previousQuantity = product.inventory;
    
    // Update product inventory
    product.inventory -= parseInt(quantity);
    await product.save();
    
    // Create inventory transaction record
    const transaction = new InventoryTransaction({
      product: product._id,
      transactionType: 'remove',
      quantity: parseInt(quantity),
      previousQuantity,
      newQuantity: product.inventory,
      reference: 'manual',
      notes: notes || 'Manual removal',
      user: req.user.id
    });
    
    await transaction.save();
    
    res.json({
      product,
      transaction
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/inventory/:id/transactions
// @desc    Get inventory transactions for a product
// @access  Private
router.get('/:id/transactions', auth, async (req, res) => {
  try {
    const transactions = await InventoryTransaction.find({ product: req.params.id })
      .sort({ date: -1 })
      .populate('user', 'name');
    
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;