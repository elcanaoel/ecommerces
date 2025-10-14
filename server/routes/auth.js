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

    // Create products with proper images - 60 products total
    const smartphones = [
      { name: 'iPhone 15 Pro Max', price: 1199, brand: 'Apple', stock: 50, featured: true, color: '1e40af' },
      { name: 'iPhone 15 Pro', price: 999, brand: 'Apple', stock: 60, featured: true, color: '3b82f6' },
      { name: 'iPhone 15', price: 799, brand: 'Apple', stock: 80, featured: false, color: '60a5fa' },
      { name: 'iPhone 14 Pro Max', price: 1099, brand: 'Apple', stock: 40, featured: false, color: '93c5fd' },
      { name: 'Samsung Galaxy S24 Ultra', price: 1299, brand: 'Samsung', stock: 45, featured: true, color: '0ea5e9' },
      { name: 'Samsung Galaxy S24+', price: 999, brand: 'Samsung', stock: 55, featured: false, color: '06b6d4' },
      { name: 'Samsung Galaxy S24', price: 799, brand: 'Samsung', stock: 70, featured: false, color: '22d3ee' },
      { name: 'Samsung Galaxy Z Fold 5', price: 1799, brand: 'Samsung', stock: 25, featured: true, color: '0891b2' },
      { name: 'Samsung Galaxy Z Flip 5', price: 999, brand: 'Samsung', stock: 35, featured: false, color: '67e8f9' },
      { name: 'Google Pixel 8 Pro', price: 999, brand: 'Google', stock: 50, featured: true, color: '10b981' },
      { name: 'Google Pixel 8', price: 699, brand: 'Google', stock: 60, featured: false, color: '34d399' },
      { name: 'OnePlus 12', price: 799, brand: 'OnePlus', stock: 45, featured: false, color: 'f59e0b' },
      { name: 'OnePlus 11', price: 699, brand: 'OnePlus', stock: 50, featured: false, color: 'fbbf24' },
      { name: 'Xiaomi 14 Pro', price: 899, brand: 'Xiaomi', stock: 40, featured: false, color: 'f97316' },
      { name: 'Xiaomi 13T Pro', price: 649, brand: 'Xiaomi', stock: 55, featured: false, color: 'fb923c' },
      { name: 'OPPO Find X6 Pro', price: 1099, brand: 'OPPO', stock: 30, featured: false, color: '84cc16' },
      { name: 'Motorola Edge 40 Pro', price: 899, brand: 'Motorola', stock: 35, featured: false, color: 'a3e635' },
      { name: 'Sony Xperia 1 V', price: 1399, brand: 'Sony', stock: 20, featured: false, color: '8b5cf6' },
      { name: 'ASUS ROG Phone 7', price: 999, brand: 'ASUS', stock: 25, featured: false, color: 'a78bfa' },
      { name: 'Nothing Phone 2', price: 599, brand: 'Nothing', stock: 45, featured: false, color: '6b7280' },
      { name: 'Realme GT 5 Pro', price: 699, brand: 'Realme', stock: 50, featured: false, color: 'fde047' },
      { name: 'Vivo X100 Pro', price: 899, brand: 'Vivo', stock: 35, featured: false, color: '14b8a6' },
      { name: 'Honor Magic 6 Pro', price: 799, brand: 'Honor', stock: 40, featured: false, color: 'ec4899' },
      { name: 'iPhone 13', price: 599, brand: 'Apple', stock: 90, featured: false, color: 'bfdbfe' },
      { name: 'Samsung Galaxy A54', price: 449, brand: 'Samsung', stock: 100, featured: false, color: 'a5f3fc' },
      { name: 'Google Pixel 7a', price: 499, brand: 'Google', stock: 80, featured: false, color: '6ee7b7' },
      { name: 'OnePlus Nord 3', price: 399, brand: 'OnePlus', stock: 70, featured: false, color: 'fcd34d' },
      { name: 'Xiaomi Redmi Note 13 Pro', price: 349, brand: 'Xiaomi', stock: 120, featured: false, color: 'fdba74' },
      { name: 'Motorola Moto G Power', price: 249, brand: 'Motorola', stock: 150, featured: false, color: 'd9f99d' },
      { name: 'Samsung Galaxy S23 FE', price: 599, brand: 'Samsung', stock: 65, featured: false, color: '7dd3fc' },
    ];

    const laptops = [
      { name: 'MacBook Pro 16-inch M3 Max', price: 3499, brand: 'Apple', stock: 25, featured: true, color: '6366f1' },
      { name: 'MacBook Pro 14-inch M3 Pro', price: 1999, brand: 'Apple', stock: 35, featured: true, color: '818cf8' },
      { name: 'MacBook Air 15-inch M3', price: 1299, brand: 'Apple', stock: 45, featured: true, color: 'a5b4fc' },
      { name: 'MacBook Air 13-inch M3', price: 1099, brand: 'Apple', stock: 60, featured: false, color: 'c7d2fe' },
      { name: 'Dell XPS 15', price: 1899, brand: 'Dell', stock: 30, featured: true, color: '8b5cf6' },
      { name: 'Dell XPS 13 Plus', price: 1299, brand: 'Dell', stock: 40, featured: false, color: 'a78bfa' },
      { name: 'HP Spectre x360 16', price: 1799, brand: 'HP', stock: 25, featured: false, color: 'ec4899' },
      { name: 'HP Envy 14', price: 1099, brand: 'HP', stock: 35, featured: false, color: 'f472b6' },
      { name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 1899, brand: 'Lenovo', stock: 30, featured: false, color: 'ef4444' },
      { name: 'Lenovo Yoga 9i', price: 1499, brand: 'Lenovo', stock: 35, featured: false, color: 'f87171' },
      { name: 'ASUS ROG Zephyrus G16', price: 2499, brand: 'ASUS', stock: 20, featured: true, color: 'dc2626' },
      { name: 'ASUS ZenBook 14 OLED', price: 999, brand: 'ASUS', stock: 45, featured: false, color: 'fca5a5' },
      { name: 'MSI Stealth 17 Studio', price: 2799, brand: 'MSI', stock: 15, featured: false, color: 'ea580c' },
      { name: 'Razer Blade 15', price: 2499, brand: 'Razer', stock: 20, featured: false, color: '22c55e' },
      { name: 'Microsoft Surface Laptop 5', price: 1299, brand: 'Microsoft', stock: 40, featured: false, color: '4ade80' },
      { name: 'Microsoft Surface Pro 9', price: 999, brand: 'Microsoft', stock: 50, featured: false, color: '86efac' },
      { name: 'Acer Swift X', price: 899, brand: 'Acer', stock: 45, featured: false, color: 'facc15' },
      { name: 'Acer Predator Helios 16', price: 1799, brand: 'Acer', stock: 25, featured: false, color: 'fde047' },
      { name: 'LG Gram 17', price: 1699, brand: 'LG', stock: 30, featured: false, color: '06b6d4' },
      { name: 'Samsung Galaxy Book3 Pro 360', price: 1499, brand: 'Samsung', stock: 35, featured: false, color: '22d3ee' },
      { name: 'Alienware m18', price: 3299, brand: 'Dell', stock: 15, featured: false, color: '7c3aed' },
      { name: 'Framework Laptop 13', price: 1099, brand: 'Framework', stock: 40, featured: false, color: '9333ea' },
      { name: 'Gigabyte AERO 16', price: 2199, brand: 'Gigabyte', stock: 20, featured: false, color: 'd946ef' },
      { name: 'HP Pavilion 15', price: 699, brand: 'HP', stock: 80, featured: false, color: 'f9a8d4' },
      { name: 'Lenovo IdeaPad 5 Pro', price: 799, brand: 'Lenovo', stock: 70, featured: false, color: 'fb7185' },
      { name: 'ASUS VivoBook S15', price: 649, brand: 'ASUS', stock: 90, featured: false, color: 'fda4af' },
      { name: 'Dell Inspiron 16', price: 749, brand: 'Dell', stock: 75, featured: false, color: 'c084fc' },
      { name: 'Acer Aspire 5', price: 549, brand: 'Acer', stock: 100, featured: false, color: 'fef08a' },
      { name: 'HP Chromebook Plus', price: 399, brand: 'HP', stock: 120, featured: false, color: 'bae6fd' },
      { name: 'Lenovo ThinkBook 15', price: 699, brand: 'Lenovo', stock: 85, featured: false, color: 'fecaca' },
    ];

    const products = [
      ...smartphones.map(p => ({ ...p, category: 'Smartphones', image: `https://placehold.co/400x400/${p.color}/white?text=${encodeURIComponent(p.name)}` })),
      ...laptops.map(p => ({ ...p, category: 'Laptops', image: `https://placehold.co/400x400/${p.color}/white?text=${encodeURIComponent(p.name)}` }))
    ];

    const createdProducts = [];
    for (const p of products) {
      const product = new Product({
        name: p.name,
        price: p.price,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        featured: p.featured,
        description: `High-quality ${p.name} with latest features and specifications. Perfect for professionals and tech enthusiasts.`,
        images: [p.image],
        specifications: { processor: 'Latest Generation', ram: '8GB+', storage: '256GB+' },
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
