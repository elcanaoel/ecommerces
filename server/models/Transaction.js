const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'payment', 'refund'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  // Gift card specific fields
  depositMethod: {
    type: String,
    enum: ['cash', 'giftcard'],
    default: 'cash'
  },
  giftCardType: {
    type: String,
    required: function() {
      return this.depositMethod === 'giftcard';
    }
  },
  giftCardImage: {
    type: String, // Path to uploaded image
    required: function() {
      return this.depositMethod === 'giftcard';
    }
  },
  giftCardCode: {
    type: String // Optional: user can provide the code
  },
  adminNotes: {
    type: String // Admin can add notes during verification
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);
