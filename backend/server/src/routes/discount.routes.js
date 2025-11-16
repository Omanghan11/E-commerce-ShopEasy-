import express from "express";
import Discount from "../models/Discount.js";
import Coupon from "../models/Coupon.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Get active discounts for a specific product (public route)
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const now = new Date();

        // Find active discounts that apply to this product
        const discounts = await Discount.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            $or: [
                { targetType: 'all' },
                { targetType: 'product', targetIds: productId }
            ]
        });

        res.json({ discounts });
    } catch (error) {
        console.error('Get product discounts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get active discounts for a category (public route)
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        const now = new Date();

        // Find active discounts that apply to this category
        const discounts = await Discount.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            $or: [
                { targetType: 'all' },
                { targetType: 'category', targetIds: categoryId }
            ]
        });

        res.json({ discounts });
    } catch (error) {
        console.error('Get category discounts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all active discounts (public route)
router.get('/active', async (req, res) => {
    try {
        const now = new Date();

        const discounts = await Discount.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate('createdBy', 'fullName');

        res.json({ discounts });
    } catch (error) {
        console.error('Get active discounts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get active coupons (public route)
router.get('/coupons/active', async (req, res) => {
    try {
        const now = new Date();

        const coupons = await Coupon.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        })
            .populate('applicableProducts', 'name price')
            .populate('applicableCategories', 'name')
            .populate('createdBy', 'fullName');

        res.json({ coupons });
    } catch (error) {
        console.error('Get active coupons error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Validate coupon code (public route)
router.post('/coupons/validate', async (req, res) => {
    try {
        const { code, cartItems, userId } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const now = new Date();
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        })
            .populate('applicableProducts', 'name price')
            .populate('applicableCategories', 'name');

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or expired coupon code' });
        }

        // Check usage limits
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit exceeded' });
        }

        // Check user usage limit
        if (userId && coupon.userUsageLimit) {
            const userUsage = coupon.usedBy.filter(usage =>
                usage.userId.toString() === userId.toString()
            ).length;

            if (userUsage >= coupon.userUsageLimit) {
                return res.status(400).json({ message: 'You have already used this coupon' });
            }
        }

        // Check if coupon applies to cart items
        if (cartItems && cartItems.length > 0) {
            // If coupon has specific products or categories, check if it applies
            if ((coupon.applicableProducts && coupon.applicableProducts.length > 0) ||
                (coupon.applicableCategories && coupon.applicableCategories.length > 0)) {

                const applies = cartItems.some(item => {
                    const productId = item.product?._id || item.productId;
                    const categoryId = item.product?.categoryId || item.categoryId;
                    const category = item.product?.category || item.category;

                    // Check if product is specifically included
                    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
                        if (coupon.applicableProducts.some(p => p._id.toString() === productId.toString())) {
                            return true;
                        }
                    }

                    // Check if product's category is included
                    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
                        if (categoryId && coupon.applicableCategories.some(c => c._id.toString() === categoryId.toString())) {
                            return true;
                        }
                        // Also check by category name
                        if (category && coupon.applicableCategories.some(c => c.name === category)) {
                            return true;
                        }
                    }

                    return false;
                });

                if (!applies) {
                    return res.status(400).json({ message: 'Coupon is not applicable to items in your cart' });
                }
            }
        }

        res.json({
            valid: true,
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minOrderAmount: coupon.minOrderAmount,
                maxDiscountAmount: coupon.maxDiscountAmount
            }
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Simple test route
router.get('/test', (req, res) => {
    res.json({ message: 'Discount routes working!' });
});

// Test route to check active discounts
router.get('/test-active', async (req, res) => {
    try {
        const now = new Date();
        const activeDiscounts = await Discount.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });
        
        res.json({ 
            message: 'Active discounts check',
            count: activeDiscounts.length,
            discounts: activeDiscounts.map(d => ({
                name: d.name,
                targetType: d.targetType,
                targetIds: d.targetIds,
                discountType: d.discountType,
                discountValue: d.discountValue,
                startDate: d.startDate,
                endDate: d.endDate,
                isActive: d.isActive
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test route to get first product for testing
router.get('/test-first-product', async (req, res) => {
    try {
        const Product = (await import('../models/Product.js')).default;
        const product = await Product.findOne({ isActive: true });
        
        if (!product) {
            return res.status(404).json({ message: 'No products found' });
        }

        res.json({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                categoryId: product.categoryId
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test route to check products and apply discounts
router.get('/test-product/:productId', async (req, res) => {
    try {
        const Product = (await import('../models/Product.js')).default;
        const product = await Product.findById(req.params.productId);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get active discounts
        const now = new Date();
        const activeDiscounts = await Discount.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        });

        // Check which discounts apply to this product
        const applicableDiscounts = activeDiscounts.filter(discount => {
            if (discount.targetType === 'all') return true;
            if (discount.targetType === 'product') {
                return discount.targetIds.some(id => id.toString() === product._id.toString());
            }
            if (discount.targetType === 'category') {
                const categoryId = product.categoryId?._id || product.categoryId;
                return discount.targetIds.some(id => id.toString() === categoryId?.toString());
            }
            return false;
        });

        res.json({
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                categoryId: product.categoryId
            },
            activeDiscounts: activeDiscounts.length,
            applicableDiscounts: applicableDiscounts.map(d => ({
                name: d.name,
                targetType: d.targetType,
                targetIds: d.targetIds,
                discountValue: d.discountValue
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;