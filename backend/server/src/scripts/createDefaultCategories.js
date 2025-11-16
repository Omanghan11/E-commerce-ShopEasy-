import mongoose from 'mongoose';
import Category from '../models/Category.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const defaultCategories = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    sortOrder: 1
  },
  {
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories',
    sortOrder: 2
  },
  {
    name: 'Books',
    description: 'Books and educational materials',
    sortOrder: 3
  },
  {
    name: 'Home & Kitchen',
    description: 'Home appliances and kitchen items',
    sortOrder: 4
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    sortOrder: 5
  },
  {
    name: 'Beauty & Health',
    description: 'Beauty products and health items',
    sortOrder: 6
  },
  {
    name: 'Automotive',
    description: 'Car accessories and automotive parts',
    sortOrder: 7
  },
  {
    name: 'Toys & Games',
    description: 'Toys, games, and entertainment',
    sortOrder: 8
  },
  {
    name: 'Grocery',
    description: 'Food and grocery items',
    sortOrder: 9
  }
];

const createDefaultCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to use as createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Using admin user: ${adminUser.fullName} (${adminUser.email})`);

    // Check existing categories
    const existingCategories = await Category.find();
    console.log(`Found ${existingCategories.length} existing categories`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of defaultCategories) {
      // Check if category already exists
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') } 
      });

      if (existingCategory) {
        console.log(`Category "${categoryData.name}" already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create new category
      const category = new Category({
        ...categoryData,
        createdBy: adminUser._id
      });

      await category.save();
      console.log(`Created category: ${category.name}`);
      createdCount++;
    }

    console.log(`\nSummary:`);
    console.log(`- Created: ${createdCount} categories`);
    console.log(`- Skipped: ${skippedCount} categories`);
    console.log(`- Total categories in database: ${await Category.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating default categories:', error);
    process.exit(1);
  }
};

createDefaultCategories();