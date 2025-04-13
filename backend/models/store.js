const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  contactName: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String
  },
  balance: {
    type: Number,
    default: 0  // Negative means store owes money, positive means credit
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Store', StoreSchema);