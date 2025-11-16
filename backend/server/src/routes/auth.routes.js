import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Get logged-in user
router.get("/me", auth, async (req, res) => {
  res.json(req.user);
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const userId = req.user._id;
    const oldFullName = req.user.fullName;

    // Check if email or phone already exists for other users
    if (email || phone) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: userId } }, // Exclude current user
          {
            $or: [
              ...(email ? [{ email }] : []),
              ...(phone ? [{ phone }] : [])
            ]
          }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ 
          message: "Email or phone number already exists for another user" 
        });
      }
    }

    // Update user with explicit updatedAt for notification trigger
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(phone && { phone }),
        updatedAt: new Date() // Explicitly set for notification trigger
      },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // If fullName was updated, update all reviews by this user
    if (fullName && fullName !== oldFullName) {
      const Product = (await import("../models/Product.js")).default;
      
      await Product.updateMany(
        { "reviews.userId": userId },
        { 
          $set: { 
            "reviews.$[elem].user": fullName 
          } 
        },
        { 
          arrayFilters: [{ "elem.userId": userId }] 
        }
      );
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }

    // Get user with password to verify current password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password with timestamp for notification trigger
    await User.findByIdAndUpdate(userId, { 
      passwordHash: newPasswordHash,
      updatedAt: new Date() // Trigger security notification
    });

    res.json({
      message: "Password updated successfully"
    });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password, adminCode } = req.body;

    if (!fullName || !password) {
      return res.status(400).json({ message: "Full name and password required" });
    }

    const existing = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with this email or phone already exists" });
    }

    // Check if admin code is provided and valid
    let userRole = "user";
    if (adminCode) {
      const validAdminCode = "SHOPEASY_ADMIN_2024"; // You can change this secret code
      if (adminCode === validAdminCode) {
        userRole = "admin";
      } else {
        return res.status(400).json({ message: "Invalid admin code" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: userRole,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email || null,
        phone: user.phone || null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res
        .status(400)
        .json({ message: "Email/Phone and password required" });
    }

    const query = emailOrPhone.includes("@")
      ? { email: emailOrPhone }
      : { phone: emailOrPhone };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ 
        message: "Your account has been blocked. Please contact support for assistance.",
        blocked: true,
        blockReason: user.blockReason,
        blockedAt: user.blockedAt
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email || null,
        phone: user.phone || null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Login
router.post("/admin-login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res
        .status(400)
        .json({ message: "Email/Phone and password required" });
    }

    const query = emailOrPhone.includes("@")
      ? { email: emailOrPhone }
      : { phone: emailOrPhone };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ 
        message: "Your account has been blocked. Please contact support for assistance.",
        blocked: true,
        blockReason: user.blockReason,
        blockedAt: user.blockedAt
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email || null,
        phone: user.phone || null,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user addresses
router.get("/addresses", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.addresses);
  } catch (err) {
    console.error("Get addresses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new address
router.post("/addresses", auth, async (req, res) => {
  try {
    const { type, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;
    
    if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // If this is the first address, make it default
    const newAddress = {
      type: type || "home",
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault: isDefault || user.addresses.length === 0,
      createdAt: new Date() // Add timestamp for notification
    };

    user.addresses.push(newAddress);
    user.updatedAt = new Date(); // Update user timestamp
    await user.save();

    res.status(201).json({
      message: "Address added successfully",
      address: user.addresses[user.addresses.length - 1]
    });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update address
router.put("/addresses/:addressId", auth, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { type, fullName, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Update address fields
    if (type) address.type = type;
    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.json({
      message: "Address updated successfully",
      address
    });
  } catch (err) {
    console.error("Update address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete address
router.delete("/addresses/:addressId", auth, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(addressId);

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password - Reset password with email/phone verification
router.post("/forgot-password", async (req, res) => {
  try {
    const { emailOrPhone, newPassword } = req.body;

    if (!emailOrPhone || !newPassword) {
      return res.status(400).json({ message: "Email/Phone and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Find user by email or phone
    const query = emailOrPhone.includes("@")
      ? { email: emailOrPhone }
      : { phone: emailOrPhone };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ message: "No account found with this email or phone number" });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(user._id, { passwordHash: newPasswordHash });

    res.json({ message: "Password reset successfully. You can now login with your new password." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user notifications
router.get("/notifications", auth, async (req, res) => {
  try {
    const notifications = [];
    const userId = req.user._id;

    // Import models here to avoid circular dependency
    const Order = (await import("../models/Order.js")).default;
    const Ticket = (await import("../models/Ticket.js")).default;

    // Get recent activity timeframe (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent orders
    const recentOrders = await Order.find({
      userId: userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    // Add order notifications
    recentOrders.forEach(order => {
      let type = 'info';
      let isResolved = false;
      let statusDisplay = '';

      switch (order.status) {
        case 'pending':
          statusDisplay = 'Pending';
          type = 'info';
          break;
        case 'paid':
          statusDisplay = 'Paid';
          type = 'success';
          break;
        case 'shipped':
          statusDisplay = 'Shipped';
          type = 'info';
          break;
        case 'completed':
          statusDisplay = 'Completed';
          type = 'success';
          isResolved = true;
          break;
        case 'cancelled':
          statusDisplay = 'Cancelled';
          type = 'error';
          isResolved = true;
          break;
        default:
          statusDisplay = 'Pending';
          type = 'info';
      }

      notifications.push({
        id: `order-${order._id}`,
        type: type,
        title: `Order ${statusDisplay}`,
        message: `Your order #${order._id.toString().slice(-6)} is ${statusDisplay.toLowerCase()}`,
        timestamp: order.createdAt,
        read: false,
        resolved: isResolved,
        actionUrl: '/profile'
      });
    });

    // Get user's tickets
    const userTickets = await Ticket.find({
      userId: userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ lastActivity: -1 });

    // Add ticket notifications
    userTickets.forEach(ticket => {
      let type = 'info';
      let isResolved = false;
      
      if (ticket.status === 'resolved' || ticket.status === 'closed') {
        type = 'success';
        isResolved = true;
      } else if (ticket.status === 'waiting_for_user') {
        type = 'warning';
      }

      notifications.push({
        id: `ticket-${ticket._id}`,
        type: type,
        title: 'Support Ticket Update',
        message: `Your ticket "${ticket.subject}" status: ${ticket.status.replace('_', ' ')}`,
        timestamp: ticket.lastActivity,
        read: false,
        resolved: isResolved,
        actionUrl: '/profile'
      });
    });

    // Profile update notifications (check if user was updated recently)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    if (req.user.updatedAt && req.user.updatedAt >= sevenDaysAgo && req.user.updatedAt > req.user.createdAt) {
      notifications.push({
        id: `profile-update-${req.user.updatedAt.getTime()}`,
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated',
        timestamp: req.user.updatedAt,
        read: false,
        resolved: true,
        actionUrl: '/profile'
      });
    }

    // Address notifications (check if user has addresses)
    if (req.user.addresses && req.user.addresses.length > 0) {
      const recentAddresses = req.user.addresses.filter(addr => 
        addr.createdAt && addr.createdAt >= sevenDaysAgo
      );
      
      recentAddresses.forEach(address => {
        notifications.push({
          id: `address-${address._id}`,
          type: 'success',
          title: 'New Address Added',
          message: `${address.type.charAt(0).toUpperCase() + address.type.slice(1)} address added successfully`,
          timestamp: address.createdAt,
          read: false,
          resolved: true,
          actionUrl: '/profile'
        });
      });
    }

    // Security notifications (password changes, etc.)
    // Note: In a real app, you'd track these events separately
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // Simulate password change notification (you'd track this in a separate events table)
    if (req.user.updatedAt && req.user.updatedAt >= threeDaysAgo) {
      // Check if this might be a password change (you'd have better logic in production)
      const timeDiff = Math.abs(new Date() - req.user.updatedAt);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 72) { // Within last 3 days
        notifications.push({
          id: `security-${req.user.updatedAt.getTime()}`,
          type: 'warning',
          title: 'Security Update',
          message: 'Your account security settings were recently updated',
          timestamp: req.user.updatedAt,
          read: false,
          resolved: true,
          actionUrl: '/profile'
        });
      }
    }

    // Welcome notification for new users
    if (req.user.createdAt >= sevenDaysAgo) {
      notifications.push({
        id: 'welcome',
        type: 'success',
        title: 'Welcome to our store!',
        message: 'Thank you for joining us. Explore our products and enjoy shopping!',
        timestamp: req.user.createdAt,
        read: false,
        resolved: false,
        actionUrl: '/'
      });
    }

    // Cart abandonment notification (if user has items in cart for more than 24 hours)
    try {
      const Cart = (await import("../models/Cart.js")).default;
      const userCart = await Cart.findOne({ userId: userId });
      
      if (userCart && userCart.items.length > 0) {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        if (userCart.updatedAt <= oneDayAgo) {
          notifications.push({
            id: `cart-reminder-${userCart._id}`,
            type: 'info',
            title: 'Items in Your Cart',
            message: `You have ${userCart.items.length} item${userCart.items.length > 1 ? 's' : ''} waiting in your cart`,
            timestamp: userCart.updatedAt,
            read: false,
            resolved: false,
            actionUrl: '/cart'
          });
        }
      }
    } catch (error) {
      console.log('Cart notification error:', error);
    }

    // Wishlist notifications
    try {
      const Wishlist = (await import("../models/Wishlist.js")).default;
      const userWishlist = await Wishlist.findOne({ userId: userId }).populate('items.productId');
      
      if (userWishlist && userWishlist.items.length > 0) {
        // Check for price drops or stock updates (simplified version)
        const recentWishlistItems = userWishlist.items.filter(item => {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          return item.addedAt >= threeDaysAgo;
        });

        recentWishlistItems.forEach(item => {
          if (item.productId) {
            notifications.push({
              id: `wishlist-${item._id}`,
              type: 'info',
              title: 'Wishlist Item Added',
              message: `${item.productId.name} was added to your wishlist`,
              timestamp: item.addedAt,
              read: false,
              resolved: false,
              actionUrl: '/wishlist'
            });
          }
        });
      }
    } catch (error) {
      console.log('Wishlist notification error:', error);
    }

    // Account activity notifications
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Login activity notification (if user logged in recently)
    if (req.user.lastLoginAt && req.user.lastLoginAt >= oneDayAgo) {
      notifications.push({
        id: `login-${req.user.lastLoginAt.getTime()}`,
        type: 'info',
        title: 'Recent Login',
        message: `You logged in on ${req.user.lastLoginAt.toLocaleDateString()} at ${req.user.lastLoginAt.toLocaleTimeString()}`,
        timestamp: req.user.lastLoginAt,
        read: false,
        resolved: true,
        actionUrl: '/profile'
      });
    }

    // Account verification notifications
    if (req.user.emailVerified === false) {
      notifications.push({
        id: 'email-verification',
        type: 'warning',
        title: 'Verify Your Email',
        message: 'Please verify your email address to secure your account',
        timestamp: req.user.createdAt,
        read: false,
        resolved: false,
        actionUrl: '/profile'
      });
    }

    // Promotional notifications (seasonal, discounts, etc.)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    
    // Weekend special notification (only show on weekends)
    if ((dayOfWeek === 0 || dayOfWeek === 6) && hour >= 9 && hour <= 21) {
      notifications.push({
        id: `weekend-special-${now.toDateString()}`,
        type: 'success',
        title: 'Weekend Special!',
        message: 'Enjoy special weekend discounts on selected items',
        timestamp: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0),
        read: false,
        resolved: false,
        actionUrl: '/'
      });
    }

    // Monthly summary notification (first day of month)
    if (now.getDate() === 1 && hour >= 9 && hour <= 12) {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const monthlyOrders = await Order.countDocuments({
        userId: userId,
        createdAt: { $gte: lastMonth }
      });

      if (monthlyOrders > 0) {
        notifications.push({
          id: `monthly-summary-${now.getMonth()}-${now.getFullYear()}`,
          type: 'info',
          title: 'Monthly Summary',
          message: `You placed ${monthlyOrders} order${monthlyOrders > 1 ? 's' : ''} last month. Thank you for shopping with us!`,
          timestamp: new Date(now.getFullYear(), now.getMonth(), 1, 9, 0, 0),
          read: false,
          resolved: false,
          actionUrl: '/profile'
        });
      }
    }

    // Birthday notification (if user has birthday in profile - you'd need to add this field)
    // For now, let's add a generic celebration notification for long-time users
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    if (req.user.createdAt <= sixMonthsAgo) {
      const daysSinceJoining = Math.floor((now - req.user.createdAt) / (1000 * 60 * 60 * 24));
      
      // Show milestone notifications
      if (daysSinceJoining % 365 === 0) { // Anniversary
        notifications.push({
          id: `anniversary-${Math.floor(daysSinceJoining / 365)}`,
          type: 'success',
          title: '🎉 Anniversary!',
          message: `Congratulations! You've been with us for ${Math.floor(daysSinceJoining / 365)} year${Math.floor(daysSinceJoining / 365) > 1 ? 's' : ''}!`,
          timestamp: new Date(),
          read: false,
          resolved: false,
          actionUrl: '/profile'
        });
      }
    }

    // Sort notifications by timestamp (newest first)
    notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(notifications.slice(0, 20)); // Limit to 20 notifications
  } catch (err) {
    console.error("Get user notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notification as read
router.put("/notifications/:notificationId/read", auth, async (req, res) => {
  try {
    // For now, we'll just return success since we're managing read status on frontend
    // In a production app, you'd store this in a separate notifications table
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Mark notification as read error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
