import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    description: {
      type: String,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    maxDiscountAmount: {
      type: Number,
      min: 0
    },
    usageLimit: {
      type: Number,
      min: 1
    },
    userUsageLimit: {
      type: Number,
      min: 1,
      default: 1
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    applicableProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    applicableCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    usedBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      usedAt: {
        type: Date,
        default: Date.now
      },
      orderAmount: {
        type: Number,
        required: true
      },
      discountAmount: {
        type: Number,
        required: true
      }
    }],
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
    timestamps: true
  }
);

// Indexes for better performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ applicableCategories: 1 });
couponSchema.index({ applicableProducts: 1 });
couponSchema.index({ createdAt: -1 });

// Virtual to check if coupon is currently valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (!this.usageLimit || this.usedCount < this.usageLimit);
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUse = function(userId) {
  if (!this.isValid) return false;
  
  const userUsage = this.usedBy.filter(usage => usage.userId.toString() === userId.toString());
  return userUsage.length < this.userUsageLimit;
};

// Method to check if coupon applies to products in cart
couponSchema.methods.appliesTo = function(cartItems) {
  // If no specific products or categories are set, applies to all
  if ((!this.applicableProducts || this.applicableProducts.length === 0) &&
      (!this.applicableCategories || this.applicableCategories.length === 0)) {
    return true;
  }

  // Check if any cart item matches the coupon criteria
  return cartItems.some(item => {
    const productId = item.productId || item.product?._id;
    const categoryId = item.product?.categoryId || item.categoryId;

    // Check if product is specifically included
    if (this.applicableProducts && this.applicableProducts.length > 0) {
      if (this.applicableProducts.includes(productId)) {
        return true;
      }
    }

    // Check if product's category is included
    if (this.applicableCategories && this.applicableCategories.length > 0) {
      if (this.applicableCategories.includes(categoryId)) {
        return true;
      }
    }

    return false;
  });
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount, cartItems) {
  if (!this.isValid || orderAmount < this.minOrderAmount) {
    return 0;
  }

  // If coupon doesn't apply to any items in cart, return 0
  if (!this.appliesTo(cartItems)) {
    return 0;
  }

  let discountAmount = 0;
  if (this.discountType === 'percentage') {
    discountAmount = (orderAmount * this.discountValue) / 100;
  } else {
    discountAmount = this.discountValue;
  }

  // Apply maximum discount limit if set
  if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
    discountAmount = this.maxDiscountAmount;
  }

  return Math.min(discountAmount, orderAmount);
};

// Method to mark coupon as used
couponSchema.methods.markAsUsed = function(userId, orderAmount, discountAmount) {
  this.usedCount += 1;
  this.usedBy.push({
    userId,
    orderAmount,
    discountAmount
  });
  return this.save();
};

export default mongoose.model("Coupon", couponSchema);