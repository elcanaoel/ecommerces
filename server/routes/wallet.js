const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');

// Get available gift card types
router.get('/giftcard-types', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    const giftCardTypes = settings?.giftCardTypes || ['Amazon', 'iTunes', 'Google Play', 'Steam', 'Visa'];
    res.json({ giftCardTypes });
  } catch (error) {
    console.error('Get gift card types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user wallet balance and transactions
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      walletBalance: user.walletBalance,
      transactions
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request deposit (creates pending transaction)
router.post('/deposit', [
  authenticate,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;

    // Create pending deposit transaction
    const transaction = new Transaction({
      user: req.user._id,
      type: 'deposit',
      amount,
      status: 'pending',
      depositMethod: 'cash',
      description: `Deposit request of $${amount.toFixed(2)}`
    });

    await transaction.save();

    res.status(201).json({
      message: 'Deposit request created. Please complete the payment.',
      transaction
    });
  } catch (error) {
    console.error('Deposit request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request gift card deposit with image upload
router.post('/deposit/giftcard', authenticate, upload.single('giftCardImage'), async (req, res) => {
  try {
    const { amount, giftCardType, giftCardCode } = req.body;

    // Validate required fields
    if (!amount || !giftCardType) {
      return res.status(400).json({ message: 'Amount and gift card type are required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Gift card image is required' });
    }

    // Get valid gift card types from settings
    const settings = await Settings.findOne();
    const validGiftCards = settings?.giftCardTypes || ['Amazon', 'iTunes', 'Google Play', 'Steam', 'Visa'];
    
    if (!validGiftCards.includes(giftCardType)) {
      return res.status(400).json({ message: 'Invalid gift card type' });
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1) {
      return res.status(400).json({ message: 'Amount must be at least $1' });
    }

    // Create pending gift card deposit transaction
    const transaction = new Transaction({
      user: req.user._id,
      type: 'deposit',
      amount: parsedAmount,
      status: 'pending',
      depositMethod: 'giftcard',
      giftCardType,
      giftCardImage: `/uploads/${req.file.filename}`,
      giftCardCode: giftCardCode || '',
      description: `${giftCardType} gift card deposit of $${parsedAmount.toFixed(2)}`
    });

    await transaction.save();

    res.status(201).json({
      message: 'Gift card deposit request submitted. Waiting for admin verification.',
      transaction
    });
  } catch (error) {
    console.error('Gift card deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm deposit (admin only)
router.post('/deposit/:transactionId/confirm', authenticate, isAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    if (transaction.type !== 'deposit') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update transaction status
    transaction.status = 'completed';
    await transaction.save();

    // Add to user wallet (use transaction.user, not req.user since admin is approving)
    const user = await User.findById(transaction.user);
    user.walletBalance += transaction.amount;
    await user.save();

    res.json({
      message: 'Deposit confirmed successfully',
      walletBalance: user.walletBalance,
      transaction
    });
  } catch (error) {
    console.error('Confirm deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('order', 'orderNumber totalAmount');

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending deposits (admin only)
router.get('/admin/pending-deposits', authenticate, isAdmin, async (req, res) => {
  try {
    const pendingDeposits = await Transaction.find({ 
      type: 'deposit', 
      status: 'pending' 
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ deposits: pendingDeposits });
  } catch (error) {
    console.error('Get pending deposits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all transactions (admin only)
router.get('/admin/all-transactions', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalAmount')
      .sort({ createdAt: -1 });

    res.json({ transactions });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject deposit (admin only)
router.post('/deposit/:transactionId/reject', authenticate, isAdmin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    if (transaction.type !== 'deposit') {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Update transaction status
    transaction.status = 'failed';
    await transaction.save();

    res.json({
      message: 'Deposit rejected',
      transaction
    });
  } catch (error) {
    console.error('Reject deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Recalculate user wallet balance (admin only)
router.post('/admin/recalculate-balance/:userId', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all completed transactions for this user
    const transactions = await Transaction.find({ 
      user: req.params.userId,
      status: 'completed'
    });

    // Calculate balance from transactions
    let calculatedBalance = 0;
    transactions.forEach(transaction => {
      if (transaction.type === 'deposit' || transaction.type === 'refund') {
        calculatedBalance += transaction.amount;
      } else if (transaction.type === 'payment') {
        calculatedBalance -= transaction.amount;
      }
    });

    const oldBalance = user.walletBalance;
    user.walletBalance = calculatedBalance;
    await user.save();

    res.json({
      message: 'Wallet balance recalculated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      oldBalance,
      newBalance: calculatedBalance,
      difference: calculatedBalance - oldBalance,
      transactionsProcessed: transactions.length
    });
  } catch (error) {
    console.error('Recalculate balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with wallet balances (admin only)
router.get('/admin/users-balances', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('name email walletBalance createdAt')
      .sort({ walletBalance: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get users balances error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
