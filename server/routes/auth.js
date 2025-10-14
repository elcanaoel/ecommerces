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
    const Review = require('../models/Review');
    
    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(400).json({ message: 'Admin user not found. Run /init-admin first.' });
    }

    // Clear existing data
    await Product.deleteMany({});
    await Review.deleteMany({});

    // Create products with real images from Unsplash - 60 products total
    const smartphones = [
      { name: 'iPhone 15 Pro Max', price: 1199, brand: 'Apple', stock: 50, featured: true, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop' },
      { name: 'iPhone 15 Pro', price: 999, brand: 'Apple', stock: 60, featured: true, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop' },
      { name: 'iPhone 15', price: 799, brand: 'Apple', stock: 80, featured: false, image: 'https://images.unsplash.com/photo-1592286927505-2fd0f3a2e6b8?w=400&h=400&fit=crop' },
      { name: 'iPhone 14 Pro Max', price: 1099, brand: 'Apple', stock: 40, featured: false, image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=400&h=400&fit=crop' },
      { name: 'Samsung Galaxy S24 Ultra', price: 1299, brand: 'Samsung', stock: 45, featured: true, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop' },
      { name: 'Samsung Galaxy S24+', price: 999, brand: 'Samsung', stock: 55, featured: false, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop' },
      { name: 'Samsung Galaxy S24', price: 799, brand: 'Samsung', stock: 70, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'Samsung Galaxy Z Fold 5', price: 1799, brand: 'Samsung', stock: 25, featured: true, image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=400&fit=crop' },
      { name: 'Samsung Galaxy Z Flip 5', price: 999, brand: 'Samsung', stock: 35, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'Google Pixel 8 Pro', price: 999, brand: 'Google', stock: 50, featured: true, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'Google Pixel 8', price: 699, brand: 'Google', stock: 60, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'OnePlus 12', price: 799, brand: 'OnePlus', stock: 45, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'OnePlus 11', price: 699, brand: 'OnePlus', stock: 50, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'Xiaomi 14 Pro', price: 899, brand: 'Xiaomi', stock: 40, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'Xiaomi 13T Pro', price: 649, brand: 'Xiaomi', stock: 55, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'OPPO Find X6 Pro', price: 1099, brand: 'OPPO', stock: 30, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'Motorola Edge 40 Pro', price: 899, brand: 'Motorola', stock: 35, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'Sony Xperia 1 V', price: 1399, brand: 'Sony', stock: 20, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'ASUS ROG Phone 7', price: 999, brand: 'ASUS', stock: 25, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'Nothing Phone 2', price: 599, brand: 'Nothing', stock: 45, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'Realme GT 5 Pro', price: 699, brand: 'Realme', stock: 50, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'Vivo X100 Pro', price: 899, brand: 'Vivo', stock: 35, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'Honor Magic 6 Pro', price: 799, brand: 'Honor', stock: 40, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'iPhone 13', price: 599, brand: 'Apple', stock: 90, featured: false, image: 'https://images.unsplash.com/photo-1592286927505-2fd0f3a2e6b8?w=400&h=400&fit=crop' },
      { name: 'Samsung Galaxy A54', price: 449, brand: 'Samsung', stock: 100, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'Google Pixel 7a', price: 499, brand: 'Google', stock: 80, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'OnePlus Nord 3', price: 399, brand: 'OnePlus', stock: 70, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'Xiaomi Redmi Note 13 Pro', price: 349, brand: 'Xiaomi', stock: 120, featured: false, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop' },
      { name: 'Motorola Moto G Power', price: 249, brand: 'Motorola', stock: 150, featured: false, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop' },
      { name: 'Samsung Galaxy S23 FE', price: 599, brand: 'Samsung', stock: 65, featured: false, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop' },
    ];

    const laptops = [
      { name: 'MacBook Pro 16-inch M3 Max', price: 3499, brand: 'Apple', stock: 25, featured: true, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
      { name: 'MacBook Pro 14-inch M3 Pro', price: 1999, brand: 'Apple', stock: 35, featured: true, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop' },
      { name: 'MacBook Air 15-inch M3', price: 1299, brand: 'Apple', stock: 45, featured: true, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop' },
      { name: 'MacBook Air 13-inch M3', price: 1099, brand: 'Apple', stock: 60, featured: false, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=400&fit=crop' },
      { name: 'Dell XPS 15', price: 1899, brand: 'Dell', stock: 30, featured: true, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop' },
      { name: 'Dell XPS 13 Plus', price: 1299, brand: 'Dell', stock: 40, featured: false, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop' },
      { name: 'HP Spectre x360 16', price: 1799, brand: 'HP', stock: 25, featured: false, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
      { name: 'HP Envy 14', price: 1099, brand: 'HP', stock: 35, featured: false, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
      { name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 1899, brand: 'Lenovo', stock: 30, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { name: 'Lenovo Yoga 9i', price: 1499, brand: 'Lenovo', stock: 35, featured: false, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop' },
      { name: 'ASUS ROG Zephyrus G16', price: 2499, brand: 'ASUS', stock: 20, featured: true, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop' },
      { name: 'ASUS ZenBook 14 OLED', price: 999, brand: 'ASUS', stock: 45, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { name: 'MSI Stealth 17 Studio', price: 2799, brand: 'MSI', stock: 15, featured: false, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop' },
      { name: 'Razer Blade 15', price: 2499, brand: 'Razer', stock: 20, featured: false, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop' },
      { name: 'Microsoft Surface Laptop 5', price: 1299, brand: 'Microsoft', stock: 40, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { name: 'Microsoft Surface Pro 9', price: 999, brand: 'Microsoft', stock: 50, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { name: 'Acer Swift X', price: 899, brand: 'Acer', stock: 45, featured: false, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
      { name: 'Acer Predator Helios 16', price: 1799, brand: 'Acer', stock: 25, featured: false, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop' },
      { name: 'LG Gram 17', price: 1699, brand: 'LG', stock: 30, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { name: 'Samsung Galaxy Book3 Pro 360', price: 1499, brand: 'Samsung', stock: 35, featured: false, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop' },
      { name: 'Alienware m18', price: 3299, brand: 'Dell', stock: 15, featured: false, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop' },
      { name: 'Framework Laptop 13', price: 1099, brand: 'Framework', stock: 40, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { name: 'Gigabyte AERO 16', price: 2199, brand: 'Gigabyte', stock: 20, featured: false, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop' },
      { name: 'HP Pavilion 15', price: 699, brand: 'HP', stock: 80, featured: false, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
      { name: 'Lenovo IdeaPad 5 Pro', price: 799, brand: 'Lenovo', stock: 70, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { name: 'ASUS VivoBook S15', price: 649, brand: 'ASUS', stock: 90, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
      { name: 'Dell Inspiron 16', price: 749, brand: 'Dell', stock: 75, featured: false, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop' },
      { name: 'Acer Aspire 5', price: 549, brand: 'Acer', stock: 100, featured: false, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
      { name: 'HP Chromebook Plus', price: 399, brand: 'HP', stock: 120, featured: false, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop' },
      { name: 'Lenovo ThinkBook 15', price: 699, brand: 'Lenovo', stock: 85, featured: false, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&h=400&fit=crop' },
    ];

    const products = [
      ...smartphones.map(p => ({ ...p, category: 'Smartphones' })),
      ...laptops.map(p => ({ ...p, category: 'Laptops' }))
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

    // Create reviews for each product (6-10 reviews per product)
    const reviewComments = [
      'Excellent product! Highly recommend it to everyone.',
      'Great value for money. Very satisfied with my purchase.',
      'Amazing quality and fast delivery. Will buy again!',
      'Perfect! Exactly what I needed. Five stars!',
      'Outstanding performance. Exceeded my expectations.',
      'Best purchase I\'ve made this year. Love it!',
      'Fantastic product with great features. Highly recommended!',
      'Very impressed with the quality. Worth every penny.',
      'Superb! Works perfectly and looks amazing.',
      'Incredible! Better than I expected. Must buy!',
      'Top-notch quality. Very happy with this purchase.',
      'Awesome product! Would definitely recommend to friends.',
      'Brilliant! Everything I wanted and more.',
      'Exceptional quality and performance. Love it!',
      'Perfect condition and works great. Very satisfied.'
    ];

    const reviewerNames = [
      'John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis',
      'David Wilson', 'Jessica Martinez', 'James Anderson', 'Jennifer Taylor',
      'Robert Thomas', 'Lisa Moore', 'William Jackson', 'Mary White',
      'Richard Harris', 'Patricia Martin', 'Charles Thompson', 'Linda Garcia',
      'Daniel Rodriguez', 'Barbara Lewis', 'Matthew Lee', 'Elizabeth Walker'
    ];

    let totalReviews = 0;
    for (const product of createdProducts) {
      // Random number of reviews between 6 and 10
      const numReviews = Math.floor(Math.random() * 5) + 6;
      
      for (let i = 0; i < numReviews; i++) {
        const review = new Review({
          product: product._id,
          user: admin._id,
          rating: Math.random() < 0.8 ? 5 : 4, // 80% 5-star, 20% 4-star
          comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
          userName: reviewerNames[Math.floor(Math.random() * reviewerNames.length)]
        });
        await review.save();
        totalReviews++;
      }
      
      // Update product with average rating and review count
      const productReviews = await Review.find({ product: product._id });
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      product.averageRating = avgRating;
      await product.save();
    }

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: { 
        products: createdProducts.length,
        reviews: totalReviews,
        avgReviewsPerProduct: (totalReviews / createdProducts.length).toFixed(1)
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Error seeding database', error: error.message });
  }
});

module.exports = router;
