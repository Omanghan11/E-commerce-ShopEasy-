import mongoose from "mongoose";

// New schema for a single review
const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 }
}, { timestamps: true });

// Images are now stored as simple string arrays

// Schema for product specifications
const specificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String, default: '' }
});

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    subcategory: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand'
    },
    // Enhanced image handling
    imageUrl: String, // Keep for backward compatibility
    images: [String], // Simple string array for image URLs
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300
    },
    specifications: [specificationSchema],
    features: [String],
    tags: [String],
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    barcode: {
      type: String,
      trim: true
    },
    weight: {
      value: Number,
      unit: { type: String, default: 'kg' }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: { type: String, default: 'cm' }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isDigital: {
      type: Boolean,
      default: false
    },
    shippingRequired: {
      type: Boolean,
      default: true
    },
    shippingWeight: Number,
    taxable: {
      type: Boolean,
      default: true
    },
    taxClass: {
      type: String,
      default: 'standard'
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 60
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160
    },
    seoKeywords: [String],
    reviews: [reviewSchema],
    // Analytics
    viewCount: {
      type: Number,
      default: 0
    },
    purchaseCount: {
      type: Number,
      default: 0
    },
    wishlistCount: {
      type: Number,
      default: 0
    },
    // Admin fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    collection: "products",
    timestamps: true
  }
);

// Indexes for better performance
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ brand: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });

// Pre-save middleware to generate slug
ProductSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Images are now simple strings, no need to set isPrimary
  // The first image in the array is considered the primary image

  // Update review count and rating
  if (this.reviews && this.reviews.length > 0) {
    this.reviewCount = this.reviews.length;
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  } else {
    this.reviewCount = 0;
    this.rating = 0;
  }

  next();
});

// Method to check if product is in stock
ProductSchema.methods.isInStock = function (quantity = 1) {
  return this.stock >= quantity;
};

// Method to check if product is low stock
ProductSchema.methods.isLowStock = function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
};

// Method to get primary image
ProductSchema.methods.getPrimaryImage = function () {
  if (this.images && this.images.length > 0) {
    return this.images[0]; // First image is primary
  }
  return this.imageUrl || '/placeholder-image.jpg';
};

// Method to update stock
ProductSchema.methods.updateStock = function (quantity, operation = 'subtract') {
  if (operation === 'subtract') {
    this.stock = Math.max(0, this.stock - quantity);
  } else if (operation === 'add') {
    this.stock += quantity;
  }
  return this.save();
};

// Method to recalculate reviews
ProductSchema.methods.recalculateReviews = function () {
  if (this.reviews && this.reviews.length > 0) {
    this.reviewCount = this.reviews.length;
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
  } else {
    this.reviewCount = 0;
    this.rating = 0;
  }
  return this;
};

// Static method to get featured products
ProductSchema.statics.getFeaturedProducts = function (limit = 10) {
  return this.find({ isActive: true, isFeatured: true })
    .sort({ rating: -1, purchaseCount: -1 })
    .limit(limit);
};

// Static method to get products by category
ProductSchema.statics.getByCategory = function (category, options = {}) {
  const { limit = 20, sort = { createdAt: -1 }, minRating = 0 } = options;

  return this.find({
    category,
    isActive: true,
    rating: { $gte: minRating }
  })
    .sort(sort)
    .limit(limit);
};

// Static method to search products
ProductSchema.statics.searchProducts = function (query, options = {}) {
  const { limit = 20, skip = 0, sort = { score: { $meta: 'textScore' } } } = options;

  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  )
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export default mongoose.model("Product", ProductSchema);