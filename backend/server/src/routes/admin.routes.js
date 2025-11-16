import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Ticket from "../models/Ticket.js";
import Discount from "../models/Discount.js";
import Coupon from "../models/Coupon.js";
import { auth } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      let slug;
      
      // For updates, get existing product slug
      if (req.params.productId) {
        const existingProduct = await Product.findById(req.params.productId);
        slug = existingProduct?.slug || req.body.name?.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim() || 'unnamed-product';
      } else {
        // For new products, create slug from name
        const productName = req.body.name || 'unnamed-product';
        slug = productName.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim();
      }
      
      // Use absolute path to ensure it works correctly
      const projectRoot = path.resolve(__dirname, '../../../../');
      const uploadPath = path.join(projectRoot, 'frontend/public/images/products', slug);
      console.log('Upload path:', uploadPath);
      console.log('__dirname:', __dirname);
      console.log('Project root:', projectRoot);
      console.log('Slug:', slug);
      
      if (!fs.existsSync(uploadPath)) {
        console.log('Creating directory:', uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
      } else {
        console.log('Directory already exists:', uploadPath);
      }
      
      // Store the slug in req for later use
      req.productSlug = slug;
      cb(null, uploadPath);
    } catch (error) {
      console.error('Error in multer destination:', error);
      cb(error);
    }
  },
  filename: async (req, file, cb) => {
    try {
      // For updates, check existing images to determine next index
      let startIndex = 1;
      if (req.params.productId) {
        const existingProduct = await Product.findById(req.params.productId);
        if (existingProduct && existingProduct.images) {
          startIndex = existingProduct.images.length + 1;
        }
      }
      
      // Initialize file counter if not exists
      if (!req.fileCounter) req.fileCounter = startIndex;
      
      const filename = `${req.fileCounter}.jpg`;
      console.log('Generated filename:', filename);
      req.fileCounter++;
      cb(null, filename);
    } catch (error) {
      console.error('Error in filename function:', error);
      // Fallback to simple indexing
      if (!req.fileCounter) req.fileCounter = 1;
      const filename = `${req.fileCounter}.jpg`;
      req.fileCounter++;
      cb(null, filename);
    }
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

const router = Router();

// Middleware to check admin role
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

// Get dashboard statistics
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    // Get real counts from database
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: { $in: ["open", "in_progress"] } });
    
    // Calculate total revenue from orders
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const stats = {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalTickets,
      openTickets
    };

    res.json(stats);
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get analytics data
router.get("/analytics", auth, adminAuth, async (req, res) => {
  try {
    // Get ALL sales data grouped by day (last 30 days for better visualization)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalSales: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    // Get ALL revenue data grouped by month (all time)
    const revenueData = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalRevenue: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Get ALL orders summary for total analytics
    const allOrdersData = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
          avgOrderValue: { $avg: "$totalPrice" }
        }
      }
    ]);

    // Get ALL category-wise sales (all time) - Enhanced with better data handling
    const categoryData = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { 
        $unwind: { 
          path: "$product", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        $group: {
          _id: { 
            $ifNull: ["$product.category", "Uncategorized"] 
          },
          totalSales: { 
            $sum: { 
              $multiply: [
                { $ifNull: ["$items.quantity", 0] }, 
                { $ifNull: ["$items.price", 0] }
              ] 
            } 
          },
          itemCount: { $sum: { $ifNull: ["$items.quantity", 0] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $match: {
          totalSales: { $gt: 0 }
        }
      },
      {
        $sort: { totalSales: -1 }
      }
    ]);

    // Get ALL top products (all time) - Enhanced with better data handling
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { 
        $unwind: { 
          path: "$product", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        $group: {
          _id: "$items.productId",
          name: { 
            $first: { 
              $ifNull: ["$product.name", "$items.name"] 
            } 
          },
          category: { 
            $first: { 
              $ifNull: ["$product.category", "Uncategorized"] 
            } 
          },
          totalSold: { 
            $sum: { $ifNull: ["$items.quantity", 0] } 
          },
          totalRevenue: { 
            $sum: { 
              $multiply: [
                { $ifNull: ["$items.quantity", 0] }, 
                { $ifNull: ["$items.price", 0] }
              ] 
            } 
          },
          orderCount: { $sum: 1 }
        }
      },
      {
        $match: {
          totalRevenue: { $gt: 0 },
          totalSold: { $gt: 0 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      { $limit: 15 }
    ]);

    // Get daily order trends (last 7 days for quick overview)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrends = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    res.json({
      salesData,
      revenueData,
      categoryData,
      topProducts,
      dailyTrends,
      allOrdersData: allOrdersData[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 }
    });
  } catch (err) {
    console.error("Get analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get admin notifications
router.get("/notifications", auth, adminAuth, async (req, res) => {
  try {
    const notifications = [];

    // Get recent tickets (last 24 hours)
    const recentTickets = await Ticket.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentTickets > 0) {
      notifications.push({
        id: 'new-tickets',
        type: 'info',
        title: 'New Support Tickets',
        message: `${recentTickets} new support ticket${recentTickets > 1 ? 's' : ''} received in the last 24 hours`,
        timestamp: new Date(),
        read: false
      });
    }

    // Get low stock products
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5, $gt: 0 } });
    if (lowStockProducts > 0) {
      notifications.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockProducts} product${lowStockProducts > 1 ? 's' : ''} running low on stock`,
        timestamp: new Date(),
        read: false
      });
    }

    // Get out of stock products
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    if (outOfStockProducts > 0) {
      notifications.push({
        id: 'out-of-stock',
        type: 'error',
        title: 'Out of Stock',
        message: `${outOfStockProducts} product${outOfStockProducts > 1 ? 's are' : ' is'} out of stock`,
        timestamp: new Date(),
        read: false
      });
    }

    // Get recent orders (last 24 hours)
    const recentOrders = await Order.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentOrders > 0) {
      notifications.push({
        id: 'new-orders',
        type: 'success',
        title: 'New Orders',
        message: `${recentOrders} new order${recentOrders > 1 ? 's' : ''} received in the last 24 hours`,
        timestamp: new Date(),
        read: false
      });
    }

    // Get blocked users with open tickets
    const blockedUsersWithTickets = await Ticket.countDocuments({
      isBlocked: true,
      status: { $in: ["open", "in_progress"] }
    });

    if (blockedUsersWithTickets > 0) {
      notifications.push({
        id: 'blocked-user-tickets',
        type: 'warning',
        title: 'Blocked User Tickets',
        message: `${blockedUsersWithTickets} open ticket${blockedUsersWithTickets > 1 ? 's' : ''} from blocked users need attention`,
        timestamp: new Date(),
        read: false
      });
    }

    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
router.get("/users", auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all products
router.get("/products", auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // 20 products per page for better pagination
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const status = req.query.status || '';
    const lowStock = req.query.lowStock === 'true';

    // Build search query
    let query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Status filter (Active/Inactive based on stock)
    if (status) {
      if (status === 'Active') {
        query.stock = { $gt: 0 };
      } else if (status === 'Inactive') {
        query.stock = 0;
      }
    }

    // Low stock filter (stock <= 10)
    if (lowStock) {
      query.stock = { $lte: 10, $gt: 0 };
    }

    const products = await Product.find(query)
      .select('name category price stock rating imageUrl images brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalProducts = await Product.countDocuments(query);

    // Transform data to match frontend expectations
    const transformedProducts = products.map(product => ({
      id: product._id,
      name: product.name,
      category: product.category,
      brand: product.brand || 'Generic',
      price: product.price,
      stock: product.stock || 0,
      rating: product.rating || 0,
      status: (product.stock > 0) ? 'Active' : 'Out of Stock',
      imageUrl: product.imageUrl || (product.images && product.images[0]) || 'https://via.placeholder.com/300x300?text=No+Image'
    }));

    res.json({
      products: transformedProducts,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: page < Math.ceil(totalProducts / limit),
      hasPrevPage: page > 1,
      searchTerm: search,
      filters: {
        category,
        status,
        lowStock
      }
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders
router.get("/orders", auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'fullName email')
      .populate('items.productId', 'name category')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 orders for performance

    // Transform data to match frontend expectations
    const transformedOrders = orders.map(order => ({
      id: order._id,
      customer: order.userId?.fullName || 'Unknown Customer',
      customerEmail: order.userId?.email || '',
      total: order.totalPrice, // Fixed: use totalPrice instead of totalAmount
      status: order.status || 'pending',
      date: order.createdAt.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      items: order.items?.length || 0,
      itemDetails: order.items?.map(item => ({
        name: item.productId?.name || 'Unknown Product',
        category: item.productId?.category || 'Unknown',
        quantity: item.quantity,
        price: item.price
      })) || [],
      shippingAddress: order.shippingAddress
    }));

    res.json(transformedOrders);
  } catch (err) {
    console.error("Get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single order details
router.get("/orders/:orderId", auth, adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'fullName email phone')
      .populate('items.productId', 'name category imageUrl');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      id: order._id,
      customer: order.userId?.fullName || 'Unknown Customer',
      customerEmail: order.userId?.email || '',
      customerPhone: order.userId?.phone || '',
      total: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippingAddress: order.shippingAddress,
      items: order.items.map(item => ({
        id: item._id,
        product: {
          id: item.productId?._id,
          name: item.productId?.name || 'Unknown Product',
          category: item.productId?.category || 'Unknown',
          imageUrl: item.productId?.imageUrl
        },
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price
      }))
    });
  } catch (err) {
    console.error("Get order details error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status
router.put("/orders/:orderId/status", auth, adminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!["pending", "paid", "shipped", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order status updated successfully",
      order: {
        id: order._id,
        customer: order.userId?.fullName || 'Unknown Customer',
        status: order.status,
        total: order.totalPrice
      }
    });
  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new user
router.post("/users", auth, adminAuth, async (req, res) => {
  try {
    const { fullName, email, phone, role = 'user' } = req.body;

    if (!fullName || (!email && !phone)) {
      return res.status(400).json({ message: "Full name and email or phone required" });
    }

    const existing = await User.findOne({
      $or: [{ email }, { phone }],
    });
    
    if (existing) {
      return res.status(400).json({ message: "User with this email or phone already exists" });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      tempPassword // In production, send this via email
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user
router.put("/users/:userId", auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email, phone, role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(role && { role })
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Block user
router.put("/users/:userId/block", auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: "Block reason is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        status: 'blocked',
        blockReason: reason.trim(),
        blockedAt: new Date(),
        blockedBy: req.user._id
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User blocked successfully",
      user
    });
  } catch (err) {
    console.error("Block user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Unblock user
router.put("/users/:userId/unblock", auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        status: 'active',
        $unset: { 
          blockReason: 1, 
          blockedAt: 1, 
          blockedBy: 1 
        }
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User unblocked successfully",
      user
    });
  } catch (err) {
    console.error("Unblock user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:userId", auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new product with file upload
router.post("/products", auth, adminAuth, upload.array('images', 4), async (req, res) => {
  try {
    const { name, category, price, stock, description, brand, currency } = req.body;

    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ message: "Name, category, price, and stock are required" });
    }

    // Handle uploaded images
    console.log('Files received:', req.files);
    console.log('Product slug:', req.productSlug);
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // Create image paths in the format: /images/products/product-slug/1.jpg
      imageUrls = req.files.map((file, index) => `/images/products/${req.productSlug}/${index + 1}.jpg`);
      console.log('Image URLs created:', imageUrls);
    } else {
      console.log('No files uploaded, using placeholder images');
      // Use placeholder images if none uploaded
      imageUrls = [
        'https://via.placeholder.com/300x300?text=Product+Image+1'
      ];
    }

    // Create product slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();

    const product = await Product.create({
      name,
      slug,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description || '',
      brand: brand || 'Generic',
      currency: currency || 'INR',
      imageUrl: imageUrls[0], // First image as main image
      images: imageUrls, // All images in array
      rating: 0,
      reviews: []
    });

    console.log('Product created with images:', {
      imageUrl: product.imageUrl,
      images: product.images
    });

    res.status(201).json({
      message: "Product created successfully",
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        rating: product.rating,
        status: product.stock > 0 ? 'Active' : 'Out of Stock',
        imageUrl: product.imageUrl,
        brand: product.brand,
        currency: product.currency,
        description: product.description
      }
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get single product
router.get("/products/:productId", auth, adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log('Returning product data:', {
      id: product._id,
      imageUrl: product.imageUrl,
      images: product.images
    });

    res.json({
      id: product._id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      rating: product.rating,
      description: product.description,
      brand: product.brand,
      currency: product.currency,
      imageUrl: product.imageUrl,
      images: product.images,
      status: product.stock > 0 ? 'Active' : 'Out of Stock',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    });
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update product
router.put("/products/:productId", auth, adminAuth, upload.array('images', 4), async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, category, price, stock, description, brand, currency, replaceImages } = req.body;

    // Get existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prepare update object
    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (description !== undefined) updateData.description = description;
    if (brand) updateData.brand = brand;
    if (currency) updateData.currency = currency;
    
    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      // Use existing slug or create new one
      const slug = existingProduct.slug || (name || existingProduct.name).toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      let allImages;
      let newImageUrls;
      
      if (replaceImages === 'true') {
        // Replace all existing images
        newImageUrls = req.files.map((file, index) => `/images/products/${slug}/${index + 1}.jpg`);
        allImages = newImageUrls;
        updateData.imageUrl = allImages[0]; // First new image as main
        console.log('Update - Replacing all images with:', newImageUrls);
      } else {
        // Add to existing images
        const existingImages = existingProduct.images || [];
        const startIndex = existingImages.length + 1;
        newImageUrls = req.files.map((file, index) => `/images/products/${slug}/${startIndex + index}.jpg`);
        allImages = [...existingImages, ...newImageUrls];
        updateData.imageUrl = existingProduct.imageUrl || allImages[0]; // Keep existing main image or use first
        console.log('Update - Existing images:', existingImages);
        console.log('Update - Adding new images:', newImageUrls);
      }
      
      updateData.images = allImages; // All images
      if (!existingProduct.slug) updateData.slug = slug; // Add slug if missing
      
      console.log('Update - Final images:', allImages);
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Product updated successfully",
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        rating: product.rating,
        status: product.stock > 0 ? 'Active' : 'Out of Stock',
        imageUrl: product.imageUrl,
        brand: product.brand,
        currency: product.currency,
        description: product.description
      }
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete product
router.delete("/products/:productId", auth, adminAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all tickets (Admin)
router.get("/tickets", auth, adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;

    // Build filter query
    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .select("-messages")
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit);

    const totalTickets = await Ticket.countDocuments(query);

    res.json({
      tickets,
      totalTickets,
      currentPage: page,
      totalPages: Math.ceil(totalTickets / limit),
      hasNextPage: page < Math.ceil(totalTickets / limit),
      hasPrevPage: page > 1
    });
  } catch (err) {
    console.error("Get tickets error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single ticket (Admin)
router.get("/tickets/:ticketId", auth, adminAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findOne({
      $or: [
        { _id: ticketId },
        { ticketId: ticketId }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(ticket);
  } catch (err) {
    console.error("Get ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update ticket status (Admin)
router.put("/tickets/:ticketId/status", auth, adminAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!["open", "in_progress", "waiting_for_user", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateData = { status };
    if (status === "resolved") {
      updateData.resolvedAt = new Date();
    } else if (status === "closed") {
      updateData.closedAt = new Date();
    }

    const ticket = await Ticket.findOneAndUpdate(
      {
        $or: [
          { _id: ticketId },
          { ticketId: ticketId }
        ]
      },
      updateData,
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({
      message: "Ticket status updated successfully",
      ticket
    });
  } catch (err) {
    console.error("Update ticket status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Assign ticket to admin (Admin)
router.put("/tickets/:ticketId/assign", auth, adminAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignToSelf } = req.body;

    const ticket = await Ticket.findOneAndUpdate(
      {
        $or: [
          { _id: ticketId },
          { ticketId: ticketId }
        ]
      },
      {
        assignedTo: assignToSelf ? req.user._id : null,
        assignedToName: assignToSelf ? req.user.fullName : null
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({
      message: assignToSelf ? "Ticket assigned to you" : "Ticket unassigned",
      ticket
    });
  } catch (err) {
    console.error("Assign ticket error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add admin reply to ticket (Admin)
router.post("/tickets/:ticketId/reply", auth, adminAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const ticket = await Ticket.findOne({
      $or: [
        { _id: ticketId },
        { ticketId: ticketId }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status === "closed") {
      return res.status(400).json({ message: "Cannot reply to closed ticket" });
    }

    const newMessage = {
      sender: "admin",
      senderName: req.user.fullName,
      senderId: req.user._id,
      message: message.trim(),
      timestamp: new Date()
    };

    ticket.messages.push(newMessage);
    
    // Update status to waiting for user if it was open
    if (ticket.status === "open") {
      ticket.status = "waiting_for_user";
    }

    await ticket.save();

    res.json({
      message: "Reply added successfully",
      newMessage
    });
  } catch (err) {
    console.error("Add reply error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Discount routes
router.get("/discounts", auth, adminAuth, async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate('createdBy', 'fullName')
      .populate('lastModifiedBy', 'fullName')
      .sort({ createdAt: -1 });
    
    res.json({ discounts });
  } catch (err) {
    console.error("Get discounts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get active discounts for products/categories
router.get("/active-discounts", auth, adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const activeDiscounts = await Discount.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('createdBy', 'fullName');
    
    // Group discounts by target type and IDs
    const discountMap = {
      products: {},
      categories: {},
      all: []
    };
    
    activeDiscounts.forEach(discount => {
      if (discount.targetType === 'all') {
        discountMap.all.push(discount);
      } else if (discount.targetType === 'products') {
        discount.targetIds.forEach(productId => {
          if (!discountMap.products[productId]) {
            discountMap.products[productId] = [];
          }
          discountMap.products[productId].push(discount);
        });
      } else if (discount.targetType === 'categories') {
        discount.targetIds.forEach(categoryId => {
          if (!discountMap.categories[categoryId]) {
            discountMap.categories[categoryId] = [];
          }
          discountMap.categories[categoryId].push(discount);
        });
      }
    });
    
    res.json({ discountMap, activeDiscounts });
  } catch (err) {
    console.error("Get active discounts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/discounts", auth, adminAuth, async (req, res) => {
  try {
    const discountData = {
      ...req.body,
      createdBy: req.user._id || req.user.id
    };

    // Filter out null/empty targetIds
    if (discountData.targetIds && Array.isArray(discountData.targetIds)) {
      discountData.targetIds = discountData.targetIds.filter(id => id != null && id !== '');
    }

    const discount = new Discount(discountData);
    await discount.save();

    const populatedDiscount = await Discount.findById(discount._id)
      .populate('createdBy', 'fullName');

    res.status(201).json({ 
      message: "Discount created successfully",
      discount: populatedDiscount 
    });
  } catch (err) {
    console.error("Create discount error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/discounts/:id", auth, adminAuth, async (req, res) => {
  try {
    const updateData = { 
      ...req.body, 
      lastModifiedBy: req.user._id || req.user.id 
    };

    // Filter out null/empty targetIds
    if (updateData.targetIds && Array.isArray(updateData.targetIds)) {
      updateData.targetIds = updateData.targetIds.filter(id => id != null && id !== '');
    }

    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'fullName')
     .populate('lastModifiedBy', 'fullName');

    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    res.json({ 
      message: "Discount updated successfully",
      discount 
    });
  } catch (err) {
    console.error("Update discount error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/discounts/:id", auth, adminAuth, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }

    res.json({ message: "Discount deleted successfully" });
  } catch (err) {
    console.error("Delete discount error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Coupon routes
router.get("/coupons", auth, adminAuth, async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('createdBy', 'fullName')
      .populate('lastModifiedBy', 'fullName')
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ coupons });
  } catch (err) {
    console.error("Get coupons error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get active coupons for products/categories
router.get("/active-coupons", auth, adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const activeCoupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    })
    .populate('createdBy', 'fullName')
    .populate('applicableProducts', 'name price')
    .populate('applicableCategories', 'name');
    
    // Group coupons by products and categories
    const couponMap = {
      products: {},
      categories: {}
    };
    
    activeCoupons.forEach(coupon => {
      coupon.applicableProducts.forEach(product => {
        if (!couponMap.products[product._id]) {
          couponMap.products[product._id] = [];
        }
        couponMap.products[product._id].push(coupon);
      });
      
      coupon.applicableCategories.forEach(category => {
        if (!couponMap.categories[category._id]) {
          couponMap.categories[category._id] = [];
        }
        couponMap.categories[category._id].push(coupon);
      });
    });
    
    res.json({ couponMap, activeCoupons });
  } catch (err) {
    console.error("Get active coupons error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/coupons", auth, adminAuth, async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user._id || req.user.id
    };

    // Filter out null/empty values from arrays
    if (couponData.applicableProducts && Array.isArray(couponData.applicableProducts)) {
      couponData.applicableProducts = couponData.applicableProducts.filter(id => id != null && id !== '');
    }
    if (couponData.applicableCategories && Array.isArray(couponData.applicableCategories)) {
      couponData.applicableCategories = couponData.applicableCategories.filter(id => id != null && id !== '');
    }

    const coupon = new Coupon(couponData);
    await coupon.save();

    const populatedCoupon = await Coupon.findById(coupon._id)
      .populate('createdBy', 'fullName')
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name');

    res.status(201).json({ 
      message: "Coupon created successfully",
      coupon: populatedCoupon 
    });
  } catch (err) {
    console.error("Create coupon error:", err);
    if (err.code === 11000) {
      res.status(400).json({ message: "Coupon code already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

router.put("/coupons/:id", auth, adminAuth, async (req, res) => {
  try {
    const updateData = { 
      ...req.body, 
      lastModifiedBy: req.user._id || req.user.id 
    };

    // Filter out null/empty values from arrays
    if (updateData.applicableProducts && Array.isArray(updateData.applicableProducts)) {
      updateData.applicableProducts = updateData.applicableProducts.filter(id => id != null && id !== '');
    }
    if (updateData.applicableCategories && Array.isArray(updateData.applicableCategories)) {
      updateData.applicableCategories = updateData.applicableCategories.filter(id => id != null && id !== '');
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy', 'fullName')
     .populate('lastModifiedBy', 'fullName')
     .populate('applicableProducts', 'name price')
     .populate('applicableCategories', 'name');

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ 
      message: "Coupon updated successfully",
      coupon 
    });
  } catch (err) {
    console.error("Update coupon error:", err);
    if (err.code === 11000) {
      res.status(400).json({ message: "Coupon code already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

router.delete("/coupons/:id", auth, adminAuth, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    console.error("Delete coupon error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;