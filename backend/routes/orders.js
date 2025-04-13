const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/order');
const Store = require('../models/store');
const Product = require('../models/product');
const Payment = require('../models/payment');

// @route   GET api/orders
// @desc    Get all orders with pagination and filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || '';
    const storeId = req.query.storeId || '';
    
    // Build filter query
    const query = {};
    if (status) query.status = status;
    if (storeId) query.store = storeId;
    
    // Get orders with pagination
    const orders = await Order.find(query)
      .populate('store', 'name')
      .sort({ orderDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
      
    // Get total count for pagination
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalOrders: total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/pending
// @desc    Get all pending orders
// @access  Private
router.get('/pending', auth, async (req, res) => {
  try {
    const orders = await Order.find({ status: 'pending' })
      .populate('store', 'name')
      .sort({ orderDate: 1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('store', 'name address contactName contactPhone')
      .populate('items.product', 'name');
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/store/:storeId
// @desc    Get orders for a specific store
// @access  Private
router.get('/store/:storeId', auth, async (req, res) => {
  try {
    const orders = await Order.find({ store: req.params.storeId })
      .sort({ orderDate: -1 })
      .limit(20);
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { storeId, items, notes } = req.body;
    
    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    // Process order items
    const orderItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ msg: `Product ${item.productId} not found` });
      }
      
      const itemTotal = product.price * item.quantity;
      
      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal
      });
      
      totalAmount += itemTotal;
    }
    
    // Create new order
    const newOrder = new Order({
      store: storeId,
      items: orderItems,
      totalAmount: totalAmount,
      amountDue: totalAmount, // Initially, all amount is due
      notes: notes || ''
    });
    
    const order = await newOrder.save();
    
    // Populate store and product information for response
    const populatedOrder = await Order.findById(order._id)
      .populate('store', 'name')
      .populate('items.product', 'name');
    
    res.json(populatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id/deliver
// @desc    Mark order as delivered and record payment
// @access  Private
router.put('/:id/deliver', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    if (order.status === 'delivered') {
      return res.status(400).json({ msg: 'Order already marked as delivered' });
    }
    
    const { amountPaid, paymentType } = req.body;
    
    // Update order
    order.status = 'delivered';
    order.deliveryDate = new Date();
    order.amountPaid = amountPaid || 0;
    order.amountDue = order.totalAmount - order.amountPaid;
    
    await order.save();
    
    // Update store balance
    const store = await Store.findById(order.store);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }
    
    // Decrease balance by amount due (negative balance = debt)
    store.balance -= order.amountDue;
    await store.save();
    
    // Create payment record if payment was made
    if (order.amountPaid > 0) {
      const payment = new Payment({
        store: order.store,
        order: order._id,
        amount: order.amountPaid,
        paymentType: paymentType || 'cash',
        notes: 'Payment at delivery'
      });
      
      await payment.save();
    }
    
    // Return updated order with populated fields
    const updatedOrder = await Order.findById(order._id)
      .populate('store', 'name')
      .populate('items.product', 'name');
    
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    if (order.status === 'delivered') {
      return res.status(400).json({ msg: 'Cannot cancel a delivered order' });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.json({ msg: 'Order cancelled', order });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;