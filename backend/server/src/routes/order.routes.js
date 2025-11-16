import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

const router = Router();
console.log("✅ Order routes loaded");

// ---------------- CREATE ORDER ----------------
router.post("/checkout", auth, async (req, res) => {
  try {
    const { shipping, total, items, fromBuyNow, billing } = req.body;

    // Check if shipping object exists and has required properties
    if (!shipping || !shipping.address || !shipping.city || !shipping.pincode) {
      return res.status(400).json({ message: "Shipping address required" });
    }

    // Combine shipping details into a single string for the database
    const shippingAddress = `${shipping.address}, ${shipping.city}, ${shipping.pincode}`;

    let itemsToOrder;
    let totalPrice;

    // Logic for 'Buy Now' vs. 'Cart' checkout
    if (fromBuyNow) {
      if (!items || items.length === 0) {
        return res.status(400).json({ message: "No items provided for Buy Now" });
      }
      
      // Validate stock for Buy Now items
      for (const item of items) {
        const product = await Product.findById(item.product._id);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.product.name} not found` });
        }
        if (item.quantity > product.stock) {
          return res.status(400).json({ message: `${product.name} is out of stock. Available: ${product.stock}` });
        }
      }
      
      itemsToOrder = items;
      // Calculate total price for 'Buy Now'
      totalPrice = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    } else {
      const cart = await Cart.findOne({ userId: req.user.id }).populate(
        "items.productId"
      );
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      itemsToOrder = cart.items;
      totalPrice = 0;
      for (const item of itemsToOrder) {
        if (!item.productId) {
          return res.status(400).json({ message: "Invalid product in cart" });
        }
        if (item.quantity > item.productId.stock) {
          return res
            .status(400)
            .json({ message: `${item.productId.name} is out of stock. Available: ${item.productId.stock}` });
        }
        totalPrice += item.productId.price * item.quantity;
      }
    }

    // 3. Create order
    const order = await Order.create({
      userId: req.user.id,
      items: itemsToOrder.map((i) => {
        // Corrected mapping logic based on checkout type
        const productId = fromBuyNow ? i.product._id : i.productId._id;
        const price = fromBuyNow ? i.product.price : i.productId.price;

        return {
          productId: productId,
          quantity: i.quantity,
          price: price,
        };
      }),
      totalPrice,
      shippingAddress,
    });

    // 4. Deduct stock for all orders (both Buy Now and Cart)
    if (fromBuyNow) {
      // Deduct stock for Buy Now items
      for (const item of itemsToOrder) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: -item.quantity },
        });
      }
    } else {
      // Deduct stock for cart items and clear cart
      for (const item of itemsToOrder) {
        await Product.findByIdAndUpdate(item.productId._id, {
          $inc: { stock: -item.quantity },
        });
      }
      const cart = await Cart.findOne({ userId: req.user.id });
      cart.items = [];
      await cart.save();
    }
    
    res.json({ message: "Order created successfully", order });

  } catch (err) {
    console.error("❌ Checkout error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- USER ROUTES ----------------

// Get all orders for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.productId", "name price imageUrl category brand")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Fetch orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single order by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("items.productId", "name price imageUrl category brand");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Fetch order error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- ADMIN ROUTES ----------------

// Get all orders (admin only)
router.get("/admin/all", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const orders = await Order.find()
      .populate("userId", "email phone")
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Admin fetch orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order status (admin only)
router.put("/admin/:id/status", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;
    if (!["pending", "shipped", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("❌ Update order status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;