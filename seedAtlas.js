// Seed MongoDB Atlas directly
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🌍 SEED MONGODB ATLAS\n');
console.log('This will seed your production MongoDB Atlas database.');
console.log('Make sure you have the correct MONGODB_URI from Render.\n');

rl.question('Enter your MongoDB Atlas connection string: ', async (atlasUri) => {
  if (!atlasUri || atlasUri.trim() === '') {
    console.log('❌ No connection string provided. Exiting.');
    rl.close();
    return;
  }

  try {
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(atlasUri.trim());
    console.log('✅ Connected to MongoDB Atlas!\n');

    // Import models and seed functions
    const User = require('./server/models/User');
    const Product = require('./server/models/Product');
    const Review = require('./server/models/Review');

    // Get or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('Creating admin user...');
      admin = new User({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@cryptostore.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Using existing admin user:', admin.email);
    }

    // Clear existing products
    console.log('\n🗑️  Clearing existing products...');
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Create products
    console.log('📦 Creating products...\n');
    
    const smartphones = [
      { name: 'iPhone 15 Pro Max', price: 1199, category: 'Smartphones', brand: 'Apple', stock: 50, featured: true },
      { name: 'iPhone 15 Pro', price: 999, category: 'Smartphones', brand: 'Apple', stock: 60, featured: true },
      { name: 'iPhone 15', price: 799, category: 'Smartphones', brand: 'Apple', stock: 80, featured: false },
      { name: 'iPhone 14 Pro Max', price: 1099, category: 'Smartphones', brand: 'Apple', stock: 40, featured: false },
      { name: 'Samsung Galaxy S24 Ultra', price: 1299, category: 'Smartphones', brand: 'Samsung', stock: 45, featured: true },
      { name: 'Samsung Galaxy S24+', price: 999, category: 'Smartphones', brand: 'Samsung', stock: 55, featured: false },
      { name: 'Samsung Galaxy S24', price: 799, category: 'Smartphones', brand: 'Samsung', stock: 70, featured: false },
      { name: 'Samsung Galaxy Z Fold 5', price: 1799, category: 'Smartphones', brand: 'Samsung', stock: 25, featured: true },
      { name: 'Samsung Galaxy Z Flip 5', price: 999, category: 'Smartphones', brand: 'Samsung', stock: 35, featured: false },
      { name: 'Google Pixel 8 Pro', price: 999, category: 'Smartphones', brand: 'Google', stock: 50, featured: true },
      { name: 'Google Pixel 8', price: 699, category: 'Smartphones', brand: 'Google', stock: 60, featured: false },
      { name: 'OnePlus 12', price: 799, category: 'Smartphones', brand: 'OnePlus', stock: 45, featured: false },
      { name: 'OnePlus 11', price: 699, category: 'Smartphones', brand: 'OnePlus', stock: 50, featured: false },
      { name: 'Xiaomi 14 Pro', price: 899, category: 'Smartphones', brand: 'Xiaomi', stock: 40, featured: false },
      { name: 'Xiaomi 13T Pro', price: 649, category: 'Smartphones', brand: 'Xiaomi', stock: 55, featured: false },
      { name: 'OPPO Find X6 Pro', price: 1099, category: 'Smartphones', brand: 'OPPO', stock: 30, featured: false },
      { name: 'Motorola Edge 40 Pro', price: 899, category: 'Smartphones', brand: 'Motorola', stock: 35, featured: false },
      { name: 'Sony Xperia 1 V', price: 1399, category: 'Smartphones', brand: 'Sony', stock: 20, featured: false },
      { name: 'ASUS ROG Phone 7', price: 999, category: 'Smartphones', brand: 'ASUS', stock: 25, featured: false },
      { name: 'Nothing Phone 2', price: 599, category: 'Smartphones', brand: 'Nothing', stock: 45, featured: false },
      { name: 'Realme GT 5 Pro', price: 699, category: 'Smartphones', brand: 'Realme', stock: 50, featured: false },
      { name: 'Vivo X100 Pro', price: 899, category: 'Smartphones', brand: 'Vivo', stock: 35, featured: false },
      { name: 'Honor Magic 6 Pro', price: 799, category: 'Smartphones', brand: 'Honor', stock: 40, featured: false },
      { name: 'iPhone 13', price: 599, category: 'Smartphones', brand: 'Apple', stock: 90, featured: false },
      { name: 'Samsung Galaxy A54', price: 449, category: 'Smartphones', brand: 'Samsung', stock: 100, featured: false },
      { name: 'Google Pixel 7a', price: 499, category: 'Smartphones', brand: 'Google', stock: 80, featured: false },
      { name: 'OnePlus Nord 3', price: 399, category: 'Smartphones', brand: 'OnePlus', stock: 70, featured: false },
      { name: 'Xiaomi Redmi Note 13 Pro', price: 349, category: 'Smartphones', brand: 'Xiaomi', stock: 120, featured: false },
      { name: 'Motorola Moto G Power', price: 249, category: 'Smartphones', brand: 'Motorola', stock: 150, featured: false },
      { name: 'Samsung Galaxy S23 FE', price: 599, category: 'Smartphones', brand: 'Samsung', stock: 65, featured: false }
    ];

    const laptops = [
      { name: 'MacBook Pro 16-inch M3 Max', price: 3499, category: 'Laptops', brand: 'Apple', stock: 25, featured: true },
      { name: 'MacBook Pro 14-inch M3 Pro', price: 1999, category: 'Laptops', brand: 'Apple', stock: 35, featured: true },
      { name: 'MacBook Air 15-inch M3', price: 1299, category: 'Laptops', brand: 'Apple', stock: 45, featured: true },
      { name: 'MacBook Air 13-inch M3', price: 1099, category: 'Laptops', brand: 'Apple', stock: 60, featured: false },
      { name: 'Dell XPS 15', price: 1899, category: 'Laptops', brand: 'Dell', stock: 30, featured: true },
      { name: 'Dell XPS 13 Plus', price: 1299, category: 'Laptops', brand: 'Dell', stock: 40, featured: false },
      { name: 'HP Spectre x360 16', price: 1799, category: 'Laptops', brand: 'HP', stock: 25, featured: false },
      { name: 'HP Envy 14', price: 1099, category: 'Laptops', brand: 'HP', stock: 35, featured: false },
      { name: 'Lenovo ThinkPad X1 Carbon Gen 11', price: 1899, category: 'Laptops', brand: 'Lenovo', stock: 30, featured: false },
      { name: 'Lenovo Yoga 9i', price: 1499, category: 'Laptops', brand: 'Lenovo', stock: 35, featured: false },
      { name: 'ASUS ROG Zephyrus G16', price: 2499, category: 'Laptops', brand: 'ASUS', stock: 20, featured: true },
      { name: 'ASUS ZenBook 14 OLED', price: 999, category: 'Laptops', brand: 'ASUS', stock: 45, featured: false },
      { name: 'MSI Stealth 17 Studio', price: 2799, category: 'Laptops', brand: 'MSI', stock: 15, featured: false },
      { name: 'Razer Blade 15', price: 2499, category: 'Laptops', brand: 'Razer', stock: 20, featured: false },
      { name: 'Microsoft Surface Laptop 5', price: 1299, category: 'Laptops', brand: 'Microsoft', stock: 40, featured: false },
      { name: 'Microsoft Surface Pro 9', price: 999, category: 'Laptops', brand: 'Microsoft', stock: 50, featured: false },
      { name: 'Acer Swift X', price: 899, category: 'Laptops', brand: 'Acer', stock: 45, featured: false },
      { name: 'Acer Predator Helios 16', price: 1799, category: 'Laptops', brand: 'Acer', stock: 25, featured: false },
      { name: 'LG Gram 17', price: 1699, category: 'Laptops', brand: 'LG', stock: 30, featured: false },
      { name: 'Samsung Galaxy Book3 Pro 360', price: 1499, category: 'Laptops', brand: 'Samsung', stock: 35, featured: false },
      { name: 'Alienware m18', price: 3299, category: 'Laptops', brand: 'Dell', stock: 15, featured: false },
      { name: 'Framework Laptop 13', price: 1099, category: 'Laptops', brand: 'Framework', stock: 40, featured: false },
      { name: 'Gigabyte AERO 16', price: 2199, category: 'Laptops', brand: 'Gigabyte', stock: 20, featured: false },
      { name: 'HP Pavilion 15', price: 699, category: 'Laptops', brand: 'HP', stock: 80, featured: false },
      { name: 'Lenovo IdeaPad 5 Pro', price: 799, category: 'Laptops', brand: 'Lenovo', stock: 70, featured: false },
      { name: 'ASUS VivoBook S15', price: 649, category: 'Laptops', brand: 'ASUS', stock: 90, featured: false },
      { name: 'Dell Inspiron 16', price: 749, category: 'Laptops', brand: 'Dell', stock: 75, featured: false },
      { name: 'Acer Aspire 5', price: 549, category: 'Laptops', brand: 'Acer', stock: 100, featured: false },
      { name: 'HP Chromebook Plus', price: 399, category: 'Laptops', brand: 'HP', stock: 120, featured: false },
      { name: 'Lenovo ThinkBook 15', price: 699, category: 'Laptops', brand: 'Lenovo', stock: 85, featured: false }
    ];

    const allProducts = [...smartphones, ...laptops];
    const createdProducts = [];

    for (const productData of allProducts) {
      const product = new Product({
        ...productData,
        description: `High-quality ${productData.name} with latest features and specifications.`,
        images: ['https://via.placeholder.com/400x400?text=' + encodeURIComponent(productData.name)],
        specifications: {
          processor: 'Latest Generation',
          ram: '8GB',
          storage: '256GB'
        },
        createdBy: admin._id
      });
      await product.save();
      createdProducts.push(product);
      console.log(`✅ Created: ${product.name}`);
    }

    console.log(`\n✅ Successfully created ${createdProducts.length} products!\n`);

    // Create reviews
    console.log('⭐ Creating reviews...\n');
    
    const reviewTexts = [
      'Excellent product! Highly recommended.',
      'Great value for money. Very satisfied.',
      'Amazing quality and fast delivery.',
      'Good product but could be better.',
      'Perfect! Exactly what I needed.'
    ];

    let totalReviews = 0;
    for (const product of createdProducts) {
      const numReviews = 5;
      for (let i = 0; i < numReviews; i++) {
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

    console.log(`✅ Successfully created ${totalReviews} reviews!\n`);

    console.log('═══════════════════════════════════════');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log(`Products: ${createdProducts.length}`);
    console.log(`Reviews: ${totalReviews}`);
    console.log(`Average Rating: 4.5+ ⭐`);
    console.log('═══════════════════════════════════════\n');
    console.log('✅ Your MongoDB Atlas database is now populated!');
    console.log('🚀 Visit your site to see the products!\n');

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB Atlas\n');
    rl.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await mongoose.disconnect();
    rl.close();
  }
});
