import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

const router = Router();

// This route handles placing the order
router.post("/", auth, async (req, res) => {
  try {
    const { 
      shipping, 
      billing, 
      fromBuyNow, 
      items, 
      total, 
      orderId, 
      paymentMethod, 
      status = 'pending' 
    } = req.body;

    // Validation for shipping details (handle both pincode and zipCode)
    const zipCode = shipping?.zipCode || shipping?.pincode;
    if (!shipping || !shipping.address || !shipping.city || !zipCode) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // Combine shipping details into a string for the order model
    const shippingAddress = `${shipping.address}, ${shipping.city}, ${zipCode}`;

    let itemsToOrder;
    let totalPrice;

    // Logic to handle items - prioritize items sent from frontend
    if (items && items.length > 0) {
      // Items provided directly from frontend (cart checkout or buy now)
      itemsToOrder = items;
      totalPrice = total || items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
    } else if (fromBuyNow) {
      return res.status(400).json({ message: "No items provided for Buy Now" });
    } else {
      // Fallback: try to get items from user's cart in database
      const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      itemsToOrder = cart.items;
      totalPrice = cart.items.reduce((acc, item) => acc + (item.productId.price || 0) * (item.quantity || 1), 0);
    }

    // Create the order in the database
    const newOrder = await Order.create({
      userId: req.user.id,
      orderId: orderId || `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items: itemsToOrder.map(i => ({
        // Corrected mapping logic based on checkout type
        productId: i.product?._id || i.productId?._id || i.productId,
        quantity: i.quantity,
        price: i.product?.price || i.productId?.price || i.price,
        name: i.product?.name || i.productId?.name || i.name,
      })),
      totalPrice: total || totalPrice,
      shippingAddress,
      billingAddress: billing ? `${billing.address}, ${billing.city}, ${billing.zipCode || billing.pincode}` : shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      status: status,
    });

    // Deduct stock from products
    for (const item of itemsToOrder) {
      const productId = item.productId || item.product?._id;
      if (productId) {
        await Product.findByIdAndUpdate(productId, { $inc: { stock: -item.quantity } });
      }
    }
    
    // Clear cart if this was a cart checkout (not buy now)
    if (!fromBuyNow && (!items || items.length === 0)) {
      await Cart.findOneAndDelete({ userId: req.user.id });
    }
    
    // After creating the order, find and populate it before sending the response
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("items.productId", "name price imageUrl category brand images");

    res.status(201).json({ message: "Order placed successfully", order: populatedOrder });

  } catch (error) {
    console.error("❌ Checkout error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;