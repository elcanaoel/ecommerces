const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticate, isAdmin } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');
const Order = require('../models/Order');

// Create a new support ticket
router.post('/', [
  authenticate,
  body('category').isIn(['enquiry', 'complaint', 'request', 'order_issue', 'other']).withMessage('Invalid category'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, subject, description, orderId, priority } = req.body;

    // Validate order if provided
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to access this order' });
      }
    }

    const ticket = new SupportTicket({
      user: req.user._id,
      category,
      subject,
      description,
      order: orderId || null,
      priority: priority || 'medium',
      messages: [{
        sender: req.user._id,
        senderRole: 'user',
        message: description
      }]
    });

    await ticket.save();
    await ticket.populate('user', 'name email');
    if (orderId) {
      await ticket.populate('order', 'orderNumber totalAmount');
    }

    res.status(201).json({
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error creating support ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user's tickets
router.get('/my-tickets', authenticate, async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = { user: req.user._id };
    
    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalAmount')
      .populate('assignedTo', 'name email')
      .populate('messages.sender', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single ticket details
router.get('/:ticketId', authenticate, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId)
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalAmount status')
      .populate('assignedTo', 'name email')
      .populate('messages.sender', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check authorization
    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add message to ticket
router.post('/:ticketId/messages', [
  authenticate,
  body('message').trim().notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check authorization
    if (ticket.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    ticket.messages.push({
      sender: req.user._id,
      senderRole: req.user.role,
      message: req.body.message
    });

    // Update status if user replies to closed ticket
    if (ticket.status === 'closed' && req.user.role !== 'admin') {
      ticket.status = 'open';
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'name email');

    res.json({
      message: 'Message added successfully',
      ticket
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Close ticket (user can close their own ticket)
router.post('/:ticketId/close', authenticate, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check authorization
    if (ticket.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    ticket.status = 'closed';
    ticket.closedAt = Date.now();
    await ticket.save();

    res.json({
      message: 'Ticket closed successfully',
      ticket
    });
  } catch (error) {
    console.error('Close ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ ADMIN ROUTES ============

// Get all tickets (admin only)
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email')
      .populate('order', 'orderNumber totalAmount')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket status (admin only)
router.put('/:ticketId/status', [
  authenticate,
  isAdmin,
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.status = req.body.status;
    
    if (req.body.status === 'resolved') {
      ticket.resolvedAt = Date.now();
    } else if (req.body.status === 'closed') {
      ticket.closedAt = Date.now();
    }

    await ticket.save();

    res.json({
      message: 'Ticket status updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket priority (admin only)
router.put('/:ticketId/priority', [
  authenticate,
  isAdmin,
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.priority = req.body.priority;
    await ticket.save();

    res.json({
      message: 'Ticket priority updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket priority error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign ticket to admin (admin only)
router.put('/:ticketId/assign', [
  authenticate,
  isAdmin
], async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.assignedTo = req.user._id;
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    await ticket.save();
    await ticket.populate('assignedTo', 'name email');

    res.json({
      message: 'Ticket assigned successfully',
      ticket
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add admin notes (admin only)
router.put('/:ticketId/notes', [
  authenticate,
  isAdmin,
  body('notes').trim().notEmpty().withMessage('Notes are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const ticket = await SupportTicket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    ticket.adminNotes = req.body.notes;
    await ticket.save();

    res.json({
      message: 'Admin notes updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update admin notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ticket statistics (admin only)
router.get('/admin/statistics', authenticate, isAdmin, async (req, res) => {
  try {
    const totalTickets = await SupportTicket.countDocuments();
    const openTickets = await SupportTicket.countDocuments({ status: 'open' });
    const inProgressTickets = await SupportTicket.countDocuments({ status: 'in_progress' });
    const resolvedTickets = await SupportTicket.countDocuments({ status: 'resolved' });
    const closedTickets = await SupportTicket.countDocuments({ status: 'closed' });

    const ticketsByCategory = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const ticketsByPriority = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statistics: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        byCategory: ticketsByCategory,
        byPriority: ticketsByPriority
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
