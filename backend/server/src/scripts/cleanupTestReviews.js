import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanupTestReviews = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find products with test reviews
    const products = await Product.find({
      'reviews.user': { $in: ['Test User', 'Anonymous'] }
    });

    console.log(`Found ${products.length} products with test reviews`);

    for (const product of products) {
      const originalReviewCount = product.reviews.length;
      
      // Remove test reviews
      product.reviews = product.reviews.filter(review => 
        review.user !== 'Test User' && review.user !== 'Anonymous'
      );

      const newReviewCount = product.reviews.length;
      
      if (originalReviewCount !== newReviewCount) {
        console.log(`Product ${product.name}: Removed ${originalReviewCount - newReviewCount} test reviews`);
        
        // Recalculate rating and review count
        if (product.reviews.length > 0) {
          const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
          product.rating = Math.round((totalRating / product.reviews.length) * 10) / 10;
          product.reviewCount = product.reviews.length;
        } else {
          product.rating = 0;
          product.reviewCount = 0;
        }

        await product.save({ validateBeforeSave: false });
        console.log(`Updated product ${product.name}: Rating=${product.rating}, Reviews=${product.reviewCount}`);
      }
    }

    console.log('Cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupTestReviews();