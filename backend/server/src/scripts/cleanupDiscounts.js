import mongoose from 'mongoose';
import Discount from '../models/Discount.js';
import Coupon from '../models/Coupon.js';

const cleanupDiscounts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

    // Clean up discounts with null targetIds
    const discounts = await Discount.find({});
    let discountUpdates = 0;

    for (const discount of discounts) {
      if (discount.targetIds && discount.targetIds.some(id => id == null)) {
        discount.targetIds = discount.targetIds.filter(id => id != null && id !== '');
        await discount.save();
        discountUpdates++;
        console.log(`Cleaned discount: ${discount.name}`);
      }
    }

    // Clean up coupons with null applicableProducts/Categories
    const coupons = await Coupon.find({});
    let couponUpdates = 0;

    for (const coupon of coupons) {
      let updated = false;
      
      if (coupon.applicableProducts && coupon.applicableProducts.some(id => id == null)) {
        coupon.applicableProducts = coupon.applicableProducts.filter(id => id != null && id !== '');
        updated = true;
      }
      
      if (coupon.applicableCategories && coupon.applicableCategories.some(id => id == null)) {
        coupon.applicableCategories = coupon.applicableCategories.filter(id => id != null && id !== '');
        updated = true;
      }

      if (updated) {
        await coupon.save();
        couponUpdates++;
        console.log(`Cleaned coupon: ${coupon.code}`);
      }
    }

    console.log(`Cleanup complete: ${discountUpdates} discounts and ${couponUpdates} coupons updated`);
    process.exit(0);
  } catch (error) {
    console.error('Cleanup error:', error);
    process.exit(1);
  }
};

cleanupDiscounts();