const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { authenticate, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let products = await Product.find(query)
      .populate('createdBy', 'name email');

    // Shuffle products randomly for each request
    products = products.sort(() => Math.random() - 0.5);

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const Review = require('../models/Review');
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch reviews for this product
    const reviews = await Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .select('userName rating comment createdAt');

    // Add reviews to product object
    const productWithReviews = product.toObject();
    productWithReviews.reviews = reviews.map(review => ({
      reviewerName: review.userName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt
    }));

    res.json(productWithReviews);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// Create product (admin only)
router.post('/', authenticate, isAdmin, upload.array('images', 5), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, stock, specifications } = req.body;

    // Get uploaded image paths
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Parse specifications if provided
    let specs = {};
    if (specifications) {
      try {
        specs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      } catch (e) {
        specs = {};
      }
    }

    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      images,
      specifications: specs,
      createdBy: req.user._id
    });

    await product.save();
    await product.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
});

// Update product (admin only)
router.put('/:id', authenticate, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, category, stock, specifications, isActive } = req.body;

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (isActive !== undefined) product.isActive = isActive;

    // Add new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      product.images = [...product.images, ...newImages];
    }

    // Update specifications
    if (specifications) {
      try {
        const specs = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
        product.specifications = specs;
      } catch (e) {
        // Keep existing specifications if parsing fails
      }
    }

    await product.save();
    await product.populate('createdBy', 'name email');

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
});

// Get all categories (public)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

module.exports = router;
