const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentType: {
    type: String,
    enum: ['cash', 'credit', 'upi', 'bank_transfer'],
    default: 'cash'
  },
  notes: {
    type: String
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);