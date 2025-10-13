require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

// Sample review templates
const reviewTemplates = {
  excellent: [
    "Absolutely love this product! Exceeded all my expectations. The quality is outstanding and it works flawlessly. Highly recommend to anyone looking for a reliable {category}.",
    "Best purchase I've made this year! The performance is incredible and the build quality is top-notch. Worth every penny. 5 stars all the way!",
    "I'm extremely impressed with this {category}. It's fast, reliable, and looks amazing. The features are exactly what I needed. Couldn't be happier!",
    "Outstanding product! The quality is exceptional and it performs better than advertised. Great value for money. Will definitely buy from this store again.",
    "This is hands down the best {category} I've ever owned. Everything about it is perfect - from the design to the performance. Highly recommended!"
  ],
  great: [
    "Really happy with this purchase! The {category} works great and looks fantastic. Shipping was fast and packaging was secure. Great experience overall.",
    "Excellent product with amazing features. The performance is smooth and the quality is impressive. Very satisfied with my purchase!",
    "Love it! This {category} has everything I was looking for. Great build quality, excellent performance, and the price is reasonable. Definitely recommend!",
    "Very pleased with this product. It's well-made, functions perfectly, and looks sleek. The customer service was also excellent. Five stars!",
    "Fantastic {category}! Exactly as described and works beautifully. The quality exceeded my expectations. Would buy again without hesitation."
  ],
  good: [
    "Great product overall! The {category} performs well and has all the features I need. Good value for the price. Happy with my purchase.",
    "Solid purchase! This {category} works as expected and the quality is good. Arrived quickly and well-packaged. Recommended!",
    "Very good product! The performance is reliable and it looks nice. Does everything it's supposed to do. Satisfied customer here!",
    "Happy with this {category}! Good quality, works well, and the price is fair. Would recommend to friends and family.",
    "Nice product! The {category} is well-built and functions smoothly. Good features for the price. Overall a good buy."
  ],
  positive: [
    "This {category} is amazing! The speed and performance are incredible. Love the design and how easy it is to use. Great purchase!",
    "Couldn't be more satisfied! This product is exactly what I needed. High quality, great features, and excellent value. Highly recommend!",
    "Wow! This {category} is fantastic. The quality is superb and it works perfectly. One of my best purchases. Five stars!",
    "Absolutely thrilled with this product! The {category} performs exceptionally well and looks stunning. Worth every cent!",
    "Perfect! This {category} has exceeded all my expectations. Great build quality, excellent performance, and amazing features. Love it!"
  ],
  satisfied: [
    "Very satisfied with this {category}! It's reliable, well-made, and does exactly what I need. Great product at a great price.",
    "Excellent choice! This product works wonderfully and the quality is impressive. Fast delivery too. Very happy customer!",
    "Really impressed with this {category}! The performance is smooth, the design is sleek, and it's very user-friendly. Recommended!",
    "Great buy! This {category} has all the features I wanted and more. Quality is excellent and it works flawlessly. Very pleased!",
    "Love this product! The {category} is high quality, performs great, and looks beautiful. Definitely worth the investment!"
  ]
};

const reviewerNames = [
  "Sarah Johnson", "Michael Chen", "Emma Williams", "David Martinez", "Jessica Brown",
  "James Wilson", "Emily Davis", "Robert Taylor", "Lisa Anderson", "Christopher Lee",
  "Amanda White", "Daniel Harris", "Jennifer Martin", "Matthew Thompson", "Ashley Garcia",
  "Joshua Rodriguez", "Melissa Martinez", "Andrew Robinson", "Stephanie Clark", "Ryan Lewis",
  "Nicole Walker", "Kevin Hall", "Rachel Allen", "Brandon Young", "Lauren King",
  "Justin Wright", "Samantha Lopez", "Tyler Hill", "Brittany Scott", "Jonathan Green",
  "Megan Adams", "Nicholas Baker", "Kayla Nelson", "Austin Carter", "Hannah Mitchell",
  "Zachary Perez", "Alexis Roberts", "Ethan Turner", "Victoria Phillips", "Nathan Campbell",
  "Olivia Parker", "Jacob Evans", "Sophia Edwards", "Alexander Collins", "Isabella Stewart",
  "William Sanchez", "Ava Morris", "Benjamin Rogers", "Mia Reed", "Elijah Cook",
  "Charlotte Morgan", "Lucas Bell", "Amelia Murphy", "Mason Bailey", "Harper Rivera",
  "Logan Cooper", "Evelyn Richardson", "Sebastian Cox", "Abigail Howard", "Jack Ward"
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomRating() {
  // Weighted towards higher ratings (4-5 stars)
  const weights = [5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4];
  return weights[Math.floor(Math.random() * weights.length)];
}

function generateReview(productName, category) {
  const rating = getRandomRating();
  let templateCategory;
  
  if (rating === 5) {
    templateCategory = getRandomElement(['excellent', 'great', 'positive', 'satisfied']);
  } else {
    templateCategory = getRandomElement(['great', 'good', 'positive']);
  }
  
  const templates = reviewTemplates[templateCategory];
  let reviewText = getRandomElement(templates);
  
  // Replace {category} placeholder
  const categoryName = category === 'Smartphones' ? 'phone' : 'laptop';
  reviewText = reviewText.replace(/{category}/g, categoryName);
  
  return {
    rating,
    comment: reviewText,
    reviewerName: getRandomElement(reviewerNames)
  };
}

function getRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

async function seedReviews() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let totalReviewsAdded = 0;

    for (const product of products) {
      // Generate 5 reviews per product
      const reviews = [];
      const usedNames = new Set();

      for (let i = 0; i < 5; i++) {
        let reviewerName;
        // Ensure unique reviewer names for each product
        do {
          reviewerName = getRandomElement(reviewerNames);
        } while (usedNames.has(reviewerName));
        
        usedNames.add(reviewerName);

        const review = generateReview(product.name, product.category);
        reviews.push({
          user: null, // Anonymous reviews
          rating: review.rating,
          comment: review.comment,
          reviewerName: reviewerName,
          createdAt: getRandomDate(90) // Reviews from last 90 days
        });
      }

      // Add reviews to product
      product.reviews = reviews;
      
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      product.averageRating = totalRating / reviews.length;
      
      await product.save();
      totalReviewsAdded += reviews.length;
      
      console.log(`✅ Added ${reviews.length} reviews to "${product.name}" (Avg: ${product.averageRating.toFixed(1)} ⭐)`);
    }

    console.log(`\n🎉 Successfully added ${totalReviewsAdded} reviews to ${products.length} products!`);
    
    // Calculate statistics
    const avgRatings = products.map(p => {
      const total = p.reviews.reduce((sum, r) => sum + r.rating, 0);
      return total / p.reviews.length;
    });
    const overallAvg = avgRatings.reduce((sum, r) => sum + r, 0) / avgRatings.length;
    
    console.log(`\nStatistics:`);
    console.log(`- Total Reviews: ${totalReviewsAdded}`);
    console.log(`- Reviews per Product: 5`);
    console.log(`- Overall Average Rating: ${overallAvg.toFixed(2)} ⭐`);
    console.log(`- 5-Star Reviews: ~${Math.round(totalReviewsAdded * 0.7)}`);
    console.log(`- 4-Star Reviews: ~${Math.round(totalReviewsAdded * 0.3)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
}

seedReviews();
