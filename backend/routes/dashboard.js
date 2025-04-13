const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/order');
const Store = require('../models/store');
const Product = require('../models/product');
const Payment = require('../models/payment');

// @route   GET api/dashboard/summary
// @desc    Get dashboard summary data
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    // Define time period (default to current month)
    const today = new Date();
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate) 
      : new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = req.query.endDate 
      ? new Date(req.query.endDate) 
      : today;
    
    // Query parameters
    const period = { orderDate: { $gte: startDate, $lte: endDate } };
    const deliveredQuery = { ...period, status: 'delivered' };
    
    // Total sales (total value of delivered orders)
    const salesResult = await Order.aggregate([
      { $match: deliveredQuery },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;
    
    // Total cash received (sum of all payments)
    const cashResult = await Order.aggregate([
      { $match: deliveredQuery },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const totalCash = cashResult.length > 0 ? cashResult[0].total : 0;
    
    // Total credit (total sales - total cash)
    const totalCredit = totalSales - totalCash;
    
    // Total orders
    const totalOrders = await Order.countDocuments(deliveredQuery);
    
    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Top selling products
    const topProducts = await Order.aggregate([
      { $match: deliveredQuery },
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.product', 
        totalQuantity: { $sum: '$items.quantity' },
        totalValue: { $sum: '$items.total' }
      }},
      { $sort: { totalValue: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productInfo'
      }},
      { $unwind: '$productInfo' },
      { $project: {
        _id: 1,
        name: '$productInfo.name',
        totalQuantity: 1,
        totalValue: 1
      }}
    ]);
    
    // Stores with highest outstanding balance
    const topDebtStores = await Store.find({ balance: { $lt: 0 } })
      .sort({ balance: 1 })
      .limit(5)
      .select('name balance');
    
    // Total outstanding balance
    const balanceResult = await Store.aggregate([
      { $match: { balance: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const totalOutstanding = balanceResult.length > 0 ? Math.abs(balanceResult[0].total) : 0;
    
    res.json({
      totalSales,
      totalCash,
      totalCredit,
      totalOrders,
      pendingOrders,
      topProducts,
      topDebtStores,
      totalOutstanding,
      period: {
        start: startDate,
        end: endDate
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/dashboard/sales-chart
// @desc    Get sales data for chart
// @access  Private
router.get('/sales-chart', auth, async (req, res) => {
  try {
    // Default to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const salesData = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          orderDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$orderDate' }
          },
          sales: { $sum: '$totalAmount' },
          cash: { $sum: '$amountPaid' },
          credit: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(salesData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/dashboard/product-chart
// @desc    Get product sales data for chart
// @access  Private
router.get('/product-chart', auth, async (req, res) => {
  try {
    // Default to current month
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const productData = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          orderDate: { $gte: startDate, $lte: today }
        }
      },
      { $unwind: '$items' },
      { 
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalValue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $project: {
          name: '$productInfo.name',
          totalQuantity: 1,
          totalValue: 1
        }
      }
    ]);
    
    res.json(productData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;