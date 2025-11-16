import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { auth } from '../middleware/auth.js';
import { isAdmin as adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const { includeInactive = false, hierarchy = false } = req.query;
    
    if (hierarchy === 'true') {
      const categoryHierarchy = await Category.getCategoryHierarchy();
      return res.json(categoryHierarchy);
    }
    
    const query = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug')
      .sort({ sortOrder: 1, name: 1 });
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get category by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all categories for admin
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = req.query;   
 
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const categories = await Category.find(query)
      .populate('parentCategory', 'name')
      .populate('createdBy', 'fullName email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Add product count to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category.name });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );
    
    const total = await Category.countDocuments(query);
    
    res.json({
      categories: categoriesWithCount,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get admin categories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category
router.post('/admin', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, image, parentCategory, sortOrder, seoTitle, seoDescription } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Check if category with same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
    });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    const category = new Category({
      name,
      description,
      image,
      parentCategory: parentCategory || null,
      sortOrder: sortOrder || 0,
      seoTitle,
      seoDescription,
      createdBy: req.user._id || req.user.id
    });
    
    await category.save();
    
    // Update parent category's subcategories if applicable
    if (parentCategory) {
      await Category.findByIdAndUpdate(parentCategory, {
        $addToSet: { subcategories: category._id }
      });
    }
    
    await category.populate('parentCategory', 'name');
    await category.populate('createdBy', 'fullName email');
    
    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Get category by ID
router.get('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name slug')
      .populate('subcategories', 'name slug')
      .populate('createdBy', 'fullName email');
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category
router.put('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, image, parentCategory, isActive, sortOrder, seoTitle, seoDescription } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if name is being changed and conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
        _id: { $ne: req.params.id }
      });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
    }
    
    // Update fields
    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (seoTitle !== undefined) category.seoTitle = seoTitle;
    if (seoDescription !== undefined) category.seoDescription = seoDescription;
    
    await category.save();
    await category.populate('parentCategory', 'name');
    await category.populate('createdBy', 'fullName email');
    
    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete category
router.delete('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${productCount} products associated with it.` 
      });
    }
    
    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category. It has subcategories. Please delete or move subcategories first.' 
      });
    }
    
    // Remove from parent category's subcategories
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(category.parentCategory, {
        $pull: { subcategories: category._id }
      });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle category status
router.patch('/admin/:id/toggle', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    res.json({
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      category
    });
  } catch (error) {
    console.error('Toggle category error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;