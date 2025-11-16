import express from 'express';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import { auth } from '../middleware/auth.js';
import { isAdmin as adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Get all brands (public)
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    res.json(brands);
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all brands for admin
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const brands = await Brand.find({})
      .populate('createdBy', 'fullName email')
      .sort({ name: 1 });
    
    // Add product count to each brand
    const brandsWithCount = await Promise.all(
      brands.map(async (brand) => {
        const productCount = await Product.countDocuments({ brand: brand.name });
        return {
          ...brand.toObject(),
          productCount
        };
      })
    );
    
    res.json({ brands: brandsWithCount, total: brands.length });
  } catch (error) {
    console.error('Get admin brands error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create brand
router.post('/admin', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, logo, website, email, phone, categories, isFeatured } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    // Check if brand with same name exists
    const existingBrand = await Brand.findOne({
      name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
    });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand with this name already exists' });
    }

    const brand = new Brand({
      name,
      description,
      logo,
      website,
      email,
      phone,
      categories: categories || [],
      isFeatured: isFeatured || false,
      createdBy: req.user._id || req.user.id
    });

    await brand.save();
    await brand.populate('createdBy', 'fullName email');
    res.status(201).json({ message: 'Brand created successfully', brand });
  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update brand
router.put('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, logo, website, email, phone, categories, isActive, isFeatured } = req.body;
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Check if name is being changed and conflicts with existing brand
    if (name && name !== brand.name) {
      const existingBrand = await Brand.findOne({
        name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingBrand) {
        return res.status(400).json({ message: 'Brand with this name already exists' });
      }
    }

    // Update fields
    if (name !== undefined) brand.name = name;
    if (description !== undefined) brand.description = description;
    if (logo !== undefined) brand.logo = logo;
    if (website !== undefined) brand.website = website;
    if (email !== undefined) brand.email = email;
    if (phone !== undefined) brand.phone = phone;
    if (categories !== undefined) brand.categories = categories;
    if (isActive !== undefined) brand.isActive = isActive;
    if (isFeatured !== undefined) brand.isFeatured = isFeatured;

    await brand.save();
    await brand.populate('createdBy', 'fullName email');
    res.json({ message: 'Brand updated successfully', brand });
  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete brand
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    await Brand.findByIdAndDelete(req.params.id);
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;