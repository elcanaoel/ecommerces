const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PaymentRequest = require('../models/PaymentRequest');
const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { authenticate, isAdmin } = require('../middleware/auth');

// Create payment request (admin only)
router.post('/', authenticate, isAdmin, [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('reason').notEmpty().withMessage('Reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, amount, reason, description } = req.body;

    // Verify order exists
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create payment request
    const paymentRequest = new PaymentRequest({
      order: orderId,
      user: order.user._id,
      amount,
      reason,
      description: description || '',
      createdBy: req.user._id,
      status: 'pending'
    });

    await paymentRequest.save();
    await paymentRequest.populate('order user createdBy', 'orderNumber name email');

    res.status(201).json({
      message: 'Payment request sent successfully',
      paymentRequest
    });
  } catch (error) {
    console.error('Create payment request error:', error);
    res.status(500).json({ message: 'Server error creating payment request' });
  }
});

// Get user's payment requests
router.get('/user', authenticate, async (req, res) => {
  try {
    const paymentRequests = await PaymentRequest.find({ user: req.user._id })
      .populate('order', 'orderNumber totalAmount')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(paymentRequests);
  } catch (error) {
    console.error('Get payment requests error:', error);
    res.status(500).json({ message: 'Server error fetching payment requests' });
  }
});

// Get all payment requests (admin only)
router.get('/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};

    const paymentRequests = await PaymentRequest.find(query)
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalAmount')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(paymentRequests);
  } catch (error) {
    console.error('Get all payment requests error:', error);
    res.status(500).json({ message: 'Server error fetching payment requests' });
  }
});

// Accept payment request
router.post('/:id/accept', authenticate, async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findById(req.params.id)
      .populate('order user');

    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    // Verify user owns this payment request
    if (paymentRequest.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if already processed
    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Payment request already processed' });
    }

    // Check user balance
    const user = await User.findById(req.user._id);
    if (user.walletBalance < paymentRequest.amount) {
      return res.status(400).json({ 
        message: `Insufficient balance. Required: $${paymentRequest.amount.toFixed(2)}, Available: $${user.walletBalance.toFixed(2)}` 
      });
    }

    // Deduct from user wallet
    user.walletBalance -= paymentRequest.amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      type: 'payment',
      amount: paymentRequest.amount,
      status: 'completed',
      description: `Payment fee for order ${paymentRequest.order.orderNumber}: ${paymentRequest.reason}`,
      order: paymentRequest.order._id
    });
    await transaction.save();

    // Update payment request
    paymentRequest.status = 'accepted';
    paymentRequest.respondedAt = new Date();
    await paymentRequest.save();

    res.json({
      message: 'Payment accepted successfully',
      paymentRequest,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Accept payment request error:', error);
    res.status(500).json({ message: 'Server error accepting payment' });
  }
});

// Reject payment request
router.post('/:id/reject', authenticate, async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findById(req.params.id);

    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    // Verify user owns this payment request
    if (paymentRequest.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if already processed
    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Payment request already processed' });
    }

    // Update payment request
    paymentRequest.status = 'rejected';
    paymentRequest.respondedAt = new Date();
    await paymentRequest.save();

    await paymentRequest.populate('order user createdBy', 'orderNumber name email');

    res.json({
      message: 'Payment request rejected',
      paymentRequest
    });
  } catch (error) {
    console.error('Reject payment request error:', error);
    res.status(500).json({ message: 'Server error rejecting payment' });
  }
});

// Delete payment request (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const paymentRequest = await PaymentRequest.findByIdAndDelete(req.params.id);

    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    res.json({ message: 'Payment request deleted successfully' });
  } catch (error) {
    console.error('Delete payment request error:', error);
    res.status(500).json({ message: 'Server error deleting payment request' });
  }
});

module.exports = router;
