const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  walletAddresses: {
    BTC: {
      type: String,
      trim: true,
      default: ''
    },
    ETH: {
      type: String,
      trim: true,
      default: ''
    },
    USDT: {
      type: String,
      trim: true,
      default: ''
    }
  },
  giftCardTypes: {
    type: [String],
    default: ['Amazon', 'iTunes', 'Google Play', 'Steam', 'Visa']
  },
  siteName: {
    type: String,
    default: 'Crypto Store'
  },
  siteDescription: {
    type: String,
    default: 'Premium products, pay with crypto'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
