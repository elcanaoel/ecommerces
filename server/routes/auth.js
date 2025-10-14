const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: 'user'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Admin login
router.post('/admin/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// Initialize admin user (run once)
router.post('/init-admin', async (req, res) => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@cryptostore.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    });

    await admin.save();

    res.json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Admin initialization error:', error);
    res.status(500).json({ message: 'Server error during admin initialization' });
  }
});

// Seed database (for initial setup)
router.post('/seed-database', async (req, res) => {
  try {
    const Product = require('../models/Product');
    
    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(400).json({ message: 'Admin user not found. Run /init-admin first.' });
    }

    // Clear existing data
    await Product.deleteMany({});

    // Create products
    const products = [
      { name: 'iPhone 15 Pro Max', price: 1199, category: 'Smartphones', brand: 'Apple', stock: 50, featured: true },
      { name: 'Samsung Galaxy S24 Ultra', price: 1299, category: 'Smartphones', brand: 'Samsung', stock: 45, featured: true },
      { name: 'Google Pixel 8 Pro', price: 999, category: 'Smartphones', brand: 'Google', stock: 50, featured: true },
      { name: 'OnePlus 12', price: 799, category: 'Smartphones', brand: 'OnePlus', stock: 45, featured: false },
      { name: 'MacBook Pro 16-inch M3', price: 3499, category: 'Laptops', brand: 'Apple', stock: 25, featured: true },
      { name: 'Dell XPS 15', price: 1899, category: 'Laptops', brand: 'Dell', stock: 30, featured: true },
      { name: 'HP Spectre x360', price: 1799, category: 'Laptops', brand: 'HP', stock: 25, featured: false },
      { name: 'ASUS ROG Zephyrus', price: 2499, category: 'Laptops', brand: 'ASUS', stock: 20, featured: true },
    ];

    const createdProducts = [];
    for (const p of products) {
      const product = new Product({
        ...p,
        description: `High-quality ${p.name} with latest features.`,
        images: [`https://via.placeholder.com/400?text=${encodeURIComponent(p.name)}`],
        specifications: { processor: 'Latest', ram: '8GB+', storage: '256GB+' },
        createdBy: admin._id,
        isActive: true
      });
      await product.save();
      createdProducts.push(product);
    }

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: { products: createdProducts.length }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Error seeding database', error: error.message });
  }
});

module.exports = router;
