import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Cart from "../models/Cart.js";
import mongoose from "mongoose";
import Product from "../models/Product.js";

const router = Router();
console.log("✅ Cart routes loaded");

// -------------------- HELPERS --------------------
// cleanup invalid/null items
const cleanupCart = async (cart) => {
  const originalLength = cart.items.length;
  cart.items = cart.items.filter((i) => i.productId);

  if (cart.items.length !== originalLength) {
    await cart.save();
  }

  return cart;
};

// -------------------- GET CART --------------------
router.get("/", auth, async (req, res) => {
  try {
    // 👈 Corrected populate query
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.productId", "name price imageUrl category brand images");

    if (!cart) {
      return res.json({ userId: req.user.id, items: [] });
    }

    cart = await cleanupCart(cart);

    res.json(cart);
  } catch (err) {
    console.error("❌ Cart fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- ADD ITEM --------------------
router.post("/add", auth, async (req, res) => {
  console.log("👉 Reached /api/cart/add route");
  const { productId, quantity } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId format" });
    }

    const objId = new mongoose.Types.ObjectId(productId);

    const product = await Product.findById(objId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const qty = quantity || 1;
    if (qty > product.stock) {
      return res
        .status(400)
        .json({ message: `Only ${product.stock} items in stock` });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = await Cart.create({ userId: req.user.id, items: [] });

    cart = await cleanupCart(cart);

    const item = cart.items.find(
      (i) => i.productId.toString() === objId.toString()
    );

    if (item) {
      const newQty = item.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({
          message: `Cannot add more than ${product.stock} items to cart`,
        });
      }
      item.quantity = newQty;
    } else {
      cart.items.push({ productId: objId, quantity: qty });
    }

    await cart.save();
    // 👈 Corrected populate query
    await cart.populate("items.productId", "name price imageUrl category brand images");

    res.json(cart);
  } catch (err) {
    console.error("❌ Cart add error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// -------------------- UPDATE QUANTITY --------------------
router.post("/update", auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId format" });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Quantity must be an integer >= 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res
        .status(400)
        .json({ message: `Only ${product.stock} items in stock` });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart = await cleanupCart(cart);

    const idx = cart.items.findIndex(
      (i) => i.productId.toString() === productId
    );
    if (idx === -1) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    cart.items[idx].quantity = quantity;

    await cart.save();
    // 👈 Corrected populate query
    await cart.populate("items.productId", "name price imageUrl category brand images");

    return res.json(cart);
  } catch (err) {
    console.error("❌ Cart update error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// -------------------- REMOVE ITEM --------------------
router.post("/remove", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId format" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId
    );

    await cart.save();
    // 👈 Corrected populate query
    await cart.populate("items.productId", "name price imageUrl category brand images");

    res.json(cart);
  } catch (err) {
    console.error("❌ Cart remove error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;