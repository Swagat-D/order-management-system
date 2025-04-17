const mongoose = require('mongoose');

const InventoryTransactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['add', 'remove'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  reference: {
    type: String,
    enum: ['manual', 'order', 'adjustment'],
    default: 'manual'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  notes: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('InventoryTransaction', InventoryTransactionSchema);