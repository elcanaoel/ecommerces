const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const User = require('../models/User');

// Seed database endpoint (admin only for security)
router.post('/seed-database', async (req, res) => {
  try {
    console.log('Starting database seeding...');

    // Get or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne({ email: 'admin@cryptostore.com' });
    }
    
    if (!admin) {
      return res.status(400).json({ 
        message: 'Admin user not found. Please initialize admin first.' 
      });
    }

    // Clear existing data
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing products and reviews');

    // Product data
    const smartphones = [
      { name: 'iPhone 15 Pro Max', price: 1199, category: 'Smartphones', brand: 'Apple', stock: 50, featured: true },
      { name: 'iPhone 15 Pro', price: 999, category: 'Smartphones', brand: 'Apple', stock: 60, featured: true },
      { name: 'iPhone 15', price: 799, category: 'Smartphones', brand: 'Apple', stock: 80, featured: false },
      { name: 'Samsung Galaxy S24 Ultra', price: 1299, category: 'Smartphones', brand: 'Samsung', stock: 45, featured: true },
      { name: 'Samsung Galaxy S24+', price: 999, category: 'Smartphones', brand: 'Samsung', stock: 55, featured: false },
      { name: 'Google Pixel 8 Pro', price: 999, category: 'Smartphones', brand: 'Google', stock: 50, featured: true },
      { name: 'OnePlus 12', price: 799, category: 'Smartphones', brand: 'OnePlus', stock: 45, featured: false },
      { name: 'Xiaomi 14 Pro', price: 899, category: 'Smartphones', brand: 'Xiaomi', stock: 40, featured: false },
    ];

    const laptops = [
      { name: 'MacBook Pro 16-inch M3 Max', price: 3499, category: 'Laptops', brand: 'Apple', stock: 25, featured: true },
      { name: 'MacBook Pro 14-inch M3 Pro', price: 1999, category: 'Laptops', brand: 'Apple', stock: 35, featured: true },
      { name: 'MacBook Air 15-inch M3', price: 1299, category: 'Laptops', brand: 'Apple', stock: 45, featured: true },
      { name: 'Dell XPS 15', price: 1899, category: 'Laptops', brand: 'Dell', stock: 30, featured: true },
      { name: 'HP Spectre x360 16', price: 1799, category: 'Laptops', brand: 'HP', stock: 25, featured: false },
      { name: 'Lenovo ThinkPad X1 Carbon', price: 1899, category: 'Laptops', brand: 'Lenovo', stock: 30, featured: false },
      { name: 'ASUS ROG Zephyrus G16', price: 2499, category: 'Laptops', brand: 'ASUS', stock: 20, featured: true },
      { name: 'Razer Blade 15', price: 2499, category: 'Laptops', brand: 'Razer', stock: 20, featured: false },
    ];

    const allProducts = [...smartphones, ...laptops];
    const createdProducts = [];

    // Create products
    for (const productData of allProducts) {
      const product = new Product({
        ...productData,
        description: `High-quality ${productData.name} with latest features and specifications. Perfect for professionals and enthusiasts.`,
        images: [`https://via.placeholder.com/400x400?text=${encodeURIComponent(productData.name)}`],
        specifications: {
          processor: 'Latest Generation',
          ram: '8GB+',
          storage: '256GB+'
        },
        createdBy: admin._id,
        isActive: true
      });
      await product.save();
      createdProducts.push(product);
    }

    console.log(`Created ${createdProducts.length} products`);

    // Create reviews
    const reviewTexts = [
      'Excellent product! Highly recommended.',
      'Great value for money. Very satisfied.',
      'Amazing quality and fast delivery.',
      'Good product, meets expectations.',
      'Perfect! Exactly what I needed.'
    ];

    let totalReviews = 0;
    for (const product of createdProducts) {
      for (let i = 0; i < 5; i++) {
        const review = new Review({
          product: product._id,
          user: admin._id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          comment: reviewTexts[i],
          userName: 'Verified Customer'
        });
        await review.save();
        totalReviews++;
      }
      
      // Update product rating
      const reviews = await Review.find({ product: product._id });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      product.rating = avgRating;
      product.numReviews = reviews.length;
      await product.save();
    }

    console.log(`Created ${totalReviews} reviews`);

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        products: createdProducts.length,
        reviews: totalReviews,
        categories: ['Smartphones', 'Laptops']
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error seeding database',
      error: error.message 
    });
  }
});

module.exports = router;
