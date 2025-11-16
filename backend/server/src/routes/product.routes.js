import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Discount from '../models/Discount.js';
import { auth } from '../middleware/auth.js';
import { isAdmin as adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Helper function to calculate discounts for products
const calculateProductDiscounts = async (products) => {
  try {
    // Get all active discounts
    const now = new Date();
    const activeDiscounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });

    console.log(`Found ${activeDiscounts.length} active discounts`);
    if (activeDiscounts.length > 0) {
      console.log('Active discounts:', activeDiscounts.map(d => ({
        name: d.name,
        targetType: d.targetType,
        targetIds: d.targetIds,
        discountType: d.discountType,
        discountValue: d.discountValue
      })));
    }

    // Get all categories to create a mapping from name to ID
    const Category = (await import('../models/Category.js')).default;
    const categories = await Category.find({});
    const categoryNameToId = {};
    const categoryIdToName = {};
    
    categories.forEach(cat => {
      categoryNameToId[cat.name] = cat._id.toString();
      categoryIdToName[cat._id.toString()] = cat.name;
    });

    console.log('Category mapping created:', Object.keys(categoryNameToId));

    // Process each product to add discount information
    const productsWithDiscounts = products.map(product => {
      const productObj = product.toObject ? product.toObject() : product;
      let bestDiscount = null;
      let discountedPrice = productObj.price;

      // Check all applicable discounts for this product
      activeDiscounts.forEach(discount => {
        try {
          let applies = false;

          if (discount.targetType === 'all') {
            applies = true;
          } else if (discount.targetType === 'category') {
            // Handle both populated categoryId and category name matching
            if (productObj.categoryId) {
              const categoryId = productObj.categoryId._id || productObj.categoryId;
              applies = discount.targetIds.filter(id => id != null).some(id => id.toString() === categoryId.toString());
            } else if (productObj.category) {
              // Match by category name using our mapping
              const productCategoryId = categoryNameToId[productObj.category];
              if (productCategoryId) {
                applies = discount.targetIds.filter(id => id != null).some(id => id.toString() === productCategoryId);
              }
            }
          } else if (discount.targetType === 'product') {
            applies = discount.targetIds.filter(id => id != null).some(id => id.toString() === productObj._id.toString());
          }

          if (applies) {
            console.log(`Discount "${discount.name}" applies to product "${productObj.name}"`);
            let discountAmount = 0;
            if (discount.discountType === 'percentage') {
              discountAmount = (productObj.price * discount.discountValue) / 100;
            } else {
              discountAmount = discount.discountValue;
            }
            console.log(`Discount amount: ${discountAmount}, Original price: ${productObj.price}`);

            // Apply maximum discount limit if set
            if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
              discountAmount = discount.maxDiscountAmount;
            }

            const newPrice = Math.max(0, productObj.price - discountAmount);
            
            // Keep the best discount (lowest price)
            if (!bestDiscount || newPrice < discountedPrice) {
              bestDiscount = {
                _id: discount._id,
                name: discount.name,
                discountType: discount.discountType,
                discountValue: discount.discountValue,
                discountAmount: discountAmount,
                percentage: Math.round((discountAmount / productObj.price) * 100)
              };
              discountedPrice = newPrice;
            }
          }
        } catch (discountError) {
          console.error('Error applying discount:', discountError);
        }
      });

      return {
        ...productObj,
        originalPrice: productObj.price,
        discountedPrice: discountedPrice,
        discount: bestDiscount,
        hasDiscount: !!bestDiscount,
        savings: bestDiscount ? Math.round(productObj.price - discountedPrice) : 0
      };
    });

    return productsWithDiscounts;
  } catch (error) {
    console.error('Error calculating discounts:', error);
    // Return products without discount info if calculation fails
    return products.map(product => ({
      ...(product.toObject ? product.toObject() : product),
      hasDiscount: false,
      discount: null
    }));
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      // Create slug from product name for folder organization
      const productName = req.body.name || 'unnamed-product';
      const slug = productName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Use absolute path to frontend's public directory
      // Current working directory is backend/server, so go up two levels to reach project root
      const projectRoot = path.resolve(process.cwd(), '..', '..');
      const uploadPath = path.join(projectRoot, 'frontend', 'public', 'images', 'products', slug);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Use simple numbering like existing products (1.jpg, 2.jpg, etc.)
    const fileIndex = req.fileIndex || 1;
    req.fileIndex = fileIndex + 1;
    cb(null, `${fileIndex}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      minPrice,
      maxPrice,
      minRating,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured
    } = req.query;

    const query = { isActive: true };

    // Filters
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (featured === 'true') query.isFeatured = true;

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    // Add discount information to products
    const productsWithDiscounts = await calculateProductDiscounts(products);

    res.json({
      products: productsWithDiscounts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .populate('reviews.userId', 'fullName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Add discount information
    const [productWithDiscount] = await calculateProductDiscounts([product]);

    res.json(productWithDiscount);
  } catch (error) {
    console.error('Get product by slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product by ID (public)
router.get('/id/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true })
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug logo')
      .populate('reviews.userId', 'fullName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    try {
      product.viewCount += 1;
      await product.save();
    } catch (saveError) {
      // If save fails due to validation, just log it and continue
      console.warn('Failed to increment view count:', saveError.message);
    }

    // Add discount information
    const [productWithDiscount] = await calculateProductDiscounts([product]);

    res.json(productWithDiscount);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get featured products (public)
router.get('/featured', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const products = await Product.getFeaturedProducts(parseInt(limit));
    
    // Add discount information to featured products
    const productsWithDiscounts = await calculateProductDiscounts(products);
    
    res.json(productsWithDiscounts);
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes

// Get all products for admin
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (status !== undefined) query.isActive = status === 'active';

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .populate('createdBy', 'fullName email')
      .populate('lastModifiedBy', 'fullName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product
router.post('/admin', auth, adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      category,
      subcategory,
      brand,
      price,
      currency,
      description,
      shortDescription,
      images,
      stock,
      lowStockThreshold,
      specifications,
      features,
      tags,
      sku,
      barcode,
      weight,
      dimensions,
      isDigital,
      shippingRequired,
      shippingWeight,
      taxable,
      taxClass,
      seoTitle,
      seoDescription,
      seoKeywords,
      isFeatured
    } = req.body;

    // Validation
    if (!name || !category || !brand || !price || !description) {
      return res.status(400).json({ 
        message: 'Name, category, brand, price, and description are required' 
      });
    }

    // Check if product with same name exists
    const existingProduct = await Product.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this name already exists' });
    }

    // Check if SKU exists
    if (sku) {
      const existingSKU = await Product.findOne({ sku });
      if (existingSKU) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
    }

    // Generate unique slug from product name FIRST
    let baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Handle uploaded images - use the slug for the URL path
    const uploadedImages = req.files ? req.files.map(file => `/images/products/${slug}/${file.filename}`) : [];

    // Find category and brand IDs
    const categoryDoc = await Category.findOne({ name: category });
    const brandDoc = await Brand.findOne({ name: brand });

    const product = new Product({
      name,
      slug,
      category,
      subcategory,
      categoryId: categoryDoc?._id,
      brand,
      brandId: brandDoc?._id,
      price: parseFloat(price),
      currency: currency || 'INR',
      description,
      shortDescription,
      images: uploadedImages,
      stock: parseInt(stock) || 0,
      lowStockThreshold: lowStockThreshold || 10,
      specifications: specifications || [],
      features: features || [],
      tags: tags || [],
      sku,
      barcode,
      weight,
      dimensions,
      isDigital: isDigital || false,
      shippingRequired: shippingRequired !== false,
      shippingWeight,
      taxable: taxable !== false,
      taxClass: taxClass || 'standard',
      seoTitle,
      seoDescription,
      seoKeywords: seoKeywords || [],
      isFeatured: isFeatured || false,
      createdBy: req.user._id
    });

    await product.save();

    // Update category and brand product counts
    // if (categoryDoc) await categoryDoc.updateProductCount();
    // if (brandDoc) await brandDoc.updateProductCount();

    await product.populate('categoryId', 'name');
    await product.populate('brandId', 'name');
    await product.populate('createdBy', 'fullName email');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get product by ID
router.get('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name slug')
      .populate('brandId', 'name slug')
      .populate('createdBy', 'fullName email')
      .populate('lastModifiedBy', 'fullName email')
      .populate('reviews.userId', 'fullName email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product
router.put('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const {
      name,
      category,
      subcategory,
      brand,
      price,
      currency,
      description,
      shortDescription,
      images,
      stock,
      lowStockThreshold,
      specifications,
      features,
      tags,
      sku,
      barcode,
      weight,
      dimensions,
      isActive,
      isDigital,
      shippingRequired,
      shippingWeight,
      taxable,
      taxClass,
      seoTitle,
      seoDescription,
      seoKeywords,
      isFeatured
    } = req.body;

    // Check if name is being changed and if it conflicts
    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this name already exists' });
      }
    }

    // Check if SKU is being changed and if it conflicts
    if (sku && sku !== product.sku) {
      const existingSKU = await Product.findOne({ 
        sku,
        _id: { $ne: req.params.id }
      });
      if (existingSKU) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
    }

    // Store old category and brand for count updates
    const oldCategory = product.category;
    const oldBrand = product.brand;

    // Update fields
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (brand !== undefined) product.brand = brand;
    if (price !== undefined) product.price = price;
    if (currency !== undefined) product.currency = currency;
    if (description !== undefined) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (images !== undefined) product.images = images;
    if (stock !== undefined) product.stock = stock;
    if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
    if (specifications !== undefined) product.specifications = specifications;
    if (features !== undefined) product.features = features;
    if (tags !== undefined) product.tags = tags;
    if (sku !== undefined) product.sku = sku;
    if (barcode !== undefined) product.barcode = barcode;
    if (weight !== undefined) product.weight = weight;
    if (dimensions !== undefined) product.dimensions = dimensions;
    if (isActive !== undefined) product.isActive = isActive;
    if (isDigital !== undefined) product.isDigital = isDigital;
    if (shippingRequired !== undefined) product.shippingRequired = shippingRequired;
    if (shippingWeight !== undefined) product.shippingWeight = shippingWeight;
    if (taxable !== undefined) product.taxable = taxable;
    if (taxClass !== undefined) product.taxClass = taxClass;
    if (seoTitle !== undefined) product.seoTitle = seoTitle;
    if (seoDescription !== undefined) product.seoDescription = seoDescription;
    if (seoKeywords !== undefined) product.seoKeywords = seoKeywords;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;

    // Update category and brand IDs if changed
    if (category && category !== oldCategory) {
      const categoryDoc = await Category.findOne({ name: category });
      product.categoryId = categoryDoc?._id;
    }
    if (brand && brand !== oldBrand) {
      const brandDoc = await Brand.findOne({ name: brand });
      product.brandId = brandDoc?._id;
    }

    product.lastModifiedBy = req.user._id;
    await product.save();

    // Update product counts if category or brand changed
    // (commented out to avoid method errors)
    // if (category && category !== oldCategory) {
    //   const oldCategoryDoc = await Category.findOne({ name: oldCategory });
    //   const newCategoryDoc = await Category.findOne({ name: category });
    //   if (oldCategoryDoc) await oldCategoryDoc.updateProductCount();
    //   if (newCategoryDoc) await newCategoryDoc.updateProductCount();
    // }

    await product.populate('categoryId', 'name');
    await product.populate('brandId', 'name');
    await product.populate('createdBy', 'fullName email');
    await product.populate('lastModifiedBy', 'fullName email');

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Store category and brand for count updates
    const category = product.category;
    const brand = product.brand;

    await Product.findByIdAndDelete(req.params.id);

    // Update category and brand product counts
    // (commented out to avoid method errors)
    // const categoryDoc = await Category.findOne({ name: category });
    // const brandDoc = await Brand.findOne({ name: brand });
    // if (categoryDoc) await categoryDoc.updateProductCount();
    // if (brandDoc) await brandDoc.updateProductCount();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle product status
router.patch('/admin/:id/toggle', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    product.lastModifiedBy = req.user._id;
    await product.save();

    res.json({
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      product
    });
  } catch (error) {
    console.error('Toggle product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle featured status
router.patch('/admin/:id/featured', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isFeatured = !product.isFeatured;
    product.lastModifiedBy = req.user._id;
    await product.save();

    res.json({
      message: `Product ${product.isFeatured ? 'marked as featured' : 'removed from featured'} successfully`,
      product
    });
  } catch (error) {
    console.error('Toggle product featured error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product stock
router.patch('/admin/:id/stock', auth, adminAuth, async (req, res) => {
  try {
    const { stock, operation = 'set' } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (operation === 'set') {
      product.stock = stock;
    } else if (operation === 'add') {
      product.stock += stock;
    } else if (operation === 'subtract') {
      product.stock = Math.max(0, product.stock - stock);
    }

    product.lastModifiedBy = req.user._id;
    await product.save();

    res.json({
      message: 'Product stock updated successfully',
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock,
        isLowStock: product.isLowStock()
      }
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Review Routes


// Add a review to a product
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const userId = req.user._id || req.user.id;
    const existingReview = product.reviews.find(
      review => review.userId.toString() === userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add new review
    const newReview = {
      user: req.user.fullName || req.user.name || 'Anonymous',
      userId: new mongoose.Types.ObjectId(userId),
      rating: parseInt(rating),
      comment: comment.trim(),
      isVerified: false // Can be set to true if user purchased the product
    };

    product.reviews.push(newReview);
    product.recalculateReviews();
    await product.save({ validateBeforeSave: false });

    // Populate the updated product with user details
    const updatedProduct = await Product.findById(req.params.id)
      .populate('reviews.userId', 'fullName');

    res.status(201).json({
      message: 'Review added successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Add review error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id || req.user?.id,
      productId: req.params.id,
      body: req.body
    });
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update a review
router.put('/:id/reviews/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user owns this review
    const userId = req.user._id || req.user.id;
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    // Update review
    review.rating = parseInt(rating);
    review.comment = comment.trim();
    review.updatedAt = new Date();
    product.recalculateReviews();

    await product.save({ validateBeforeSave: false });

    // Populate the updated product with user details
    const updatedProduct = await Product.findById(req.params.id)
      .populate('reviews.userId', 'fullName');

    res.json({
      message: 'Review updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update review error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id || req.user?.id,
      productId: req.params.id,
      reviewId: req.params.reviewId,
      body: req.body
    });
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Delete a review
router.delete('/:id/reviews/:reviewId', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if the user owns this review or is an admin
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    if (review.userId.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    // Remove review
    product.reviews.pull(req.params.reviewId);
    product.recalculateReviews();
    await product.save({ validateBeforeSave: false });

    // Populate the updated product with user details
    const updatedProduct = await Product.findById(req.params.id)
      .populate('reviews.userId', 'fullName');

    res.json({
      message: 'Review deleted successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Delete review error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?._id || req.user?.id,
      productId: req.params.id,
      reviewId: req.params.reviewId
    });
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get all reviews for a product
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.userId', 'fullName')
      .select('reviews rating reviewCount');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      reviews: product.reviews,
      rating: product.rating,
      reviewCount: product.reviewCount
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;