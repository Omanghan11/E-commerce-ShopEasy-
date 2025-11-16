import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
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
    targetType: {
      type: String,
      enum: ['all', 'category', 'product'],
      required: true,
      default: 'all'
    },
    targetIds: [{
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetType'
    }],
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
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
    usedCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
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
discountSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
discountSchema.index({ targetType: 1, targetIds: 1 });
discountSchema.index({ createdAt: -1 });

// Virtual to check if discount is currently valid
discountSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.startDate <= now && 
         this.endDate >= now &&
         (!this.usageLimit || this.usedCount < this.usageLimit);
});

// Method to check if discount applies to a product
discountSchema.methods.appliesTo = function(productId, categoryId) {
  if (this.targetType === 'all') {
    return true;
  } else if (this.targetType === 'category') {
    return this.targetIds.includes(categoryId);
  } else if (this.targetType === 'product') {
    return this.targetIds.includes(productId);
  }
  return false;
};

// Method to calculate discount amount
discountSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.isValid || orderAmount < this.minOrderAmount) {
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

export default mongoose.model("Discount", discountSchema);