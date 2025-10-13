const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { authenticate, isAdmin } = require('../middleware/auth');

// Create new order
router.post('/', authenticate, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required')
], async (req, res) => {
  try {
    console.log('📦 Order request received:', {
      paymentMethod: req.body.paymentMethod,
      itemsCount: req.body.items?.length,
      hasShippingAddress: !!req.body.shippingAddress
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, cryptocurrency, walletAddress, shippingAddress, transactionHash, paymentMethod } = req.body;

    // Normalize and validate payment method
    const method = (paymentMethod || '').toLowerCase();
    if (!['wallet', 'crypto'].includes(method)) {
      return res.status(400).json({ message: 'Invalid payment method. Use "wallet" or "crypto".' });
    }
    if (method === 'crypto') {
      if (!cryptocurrency) {
        return res.status(400).json({ message: 'cryptocurrency is required for crypto payments' });
      }
      if (!walletAddress) {
        return res.status(400).json({ message: 'walletAddress is required for crypto payments' });
      }
    }

    // Validate and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      // Validate product ObjectId to avoid CastError
      if (!item?.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: `Invalid product id: ${item?.product}` });
      }
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;

      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Handle wallet payment
    if (method === 'wallet') {
      const user = await User.findById(req.user._id);
      
      if (user.walletBalance < totalAmount) {
        // Restore stock if payment fails
        for (const item of items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
        return res.status(400).json({ 
          message: `Insufficient wallet balance. Required: $${totalAmount.toFixed(2)}, Available: $${user.walletBalance.toFixed(2)}` 
        });
      }

      // Create transaction record (pending initially)
      const transaction = new Transaction({
        user: req.user._id,
        type: 'payment',
        amount: totalAmount,
        status: 'pending',
        description: `Payment for order`
      });
      await transaction.save();

      // Create order with wallet payment
      const order = new Order({
        user: req.user._id,
        items: orderItems,
        totalAmount,
        cryptocurrency: 'WALLET',
        walletAddress: 'Internal Wallet',
        shippingAddress,
        transactionHash: transaction._id.toString(),
        paymentVerified: true
      });

      try {
        await order.save();
        
        // Update transaction with order reference
        transaction.order = order._id;
        transaction.status = 'completed';
        await transaction.save();

        // Only deduct from wallet AFTER order is successfully created
        user.walletBalance -= totalAmount;
        await user.save();

        await order.populate('user', 'name email');
        await order.populate('items.product');

        return res.status(201).json({
          message: 'Order created successfully with wallet payment',
          order,
          walletBalance: user.walletBalance
        });
      } catch (orderError) {
        // If order creation fails, mark transaction as failed and restore stock
        transaction.status = 'failed';
        await transaction.save();
        
        // Restore stock
        for (const item of items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
        
        throw orderError; // Re-throw to be caught by outer catch
      }
    }

    // Create order with crypto payment
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      cryptocurrency: cryptocurrency || 'BTC',
      walletAddress: walletAddress || '',
      shippingAddress,
      transactionHash: transactionHash || ''
    });

    await order.save();
    await order.populate('user', 'name email');
    await order.populate('items.product');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error creating order',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get user's orders
router.get('/', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Get single order
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
});

// Get all orders (admin only)
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
});

// Update order status (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, paymentVerified, notes, trackingNumber, statusNote } = req.body;

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      // Auto-generate tracking number when status changes to shipped
      if (status === 'shipped' && !order.trackingNumber && !trackingNumber) {
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        order.trackingNumber = `TRK${timestamp}${randomNum}`;
      }
      
      // Add to status history
      order.statusHistory.push({
        status,
        note: statusNote || `Order status updated to ${status}${status === 'shipped' && order.trackingNumber ? ` - Tracking: ${order.trackingNumber}` : ''}`,
        updatedBy: req.user._id,
        timestamp: new Date()
      });
      
      order.status = status;
    }

    if (paymentVerified !== undefined) {
      order.paymentVerified = paymentVerified;
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
      
      // Add tracking number to status history if provided
      if (trackingNumber && !status) {
        order.statusHistory.push({
          status: order.status,
          note: `Tracking number added: ${trackingNumber}`,
          updatedBy: req.user._id,
          timestamp: new Date()
        });
      }
    }

    await order.save();
    await order.populate('user', 'name email');
    await order.populate('items.product');
    await order.populate('statusHistory.updatedBy', 'name email');

    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error updating order' });
  }
});

// Cancel order (user can cancel if pending)
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error cancelling order' });
  }
});

module.exports = router;
