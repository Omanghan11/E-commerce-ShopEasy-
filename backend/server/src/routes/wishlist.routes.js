import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

const router = Router();
console.log("✅ Wishlist routes loaded");

// -------------------- GET WISHLIST --------------------
router.get("/", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user.id })
      .populate("items.productId", "name price imageUrl category brand")
      .lean();

    res.json(wishlist || { userId: req.user.id, items: [] });
  } catch (err) {
    console.error("❌ Wishlist fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- ADD ITEM --------------------
router.post("/add", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId format" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) wishlist = await Wishlist.create({ userId: req.user.id, items: [] });

    if (wishlist.items.some((i) => i.productId.toString() === productId)) {
      return res.status(400).json({ message: "Already in wishlist" });
    }

    wishlist.items.push({ productId });
    await wishlist.save();
    await wishlist.populate("items.productId", "name price imageUrl category brand");

    res.json(wishlist);
  } catch (err) {
    console.error("❌ Wishlist add error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- REMOVE ITEM --------------------
router.post("/remove", auth, async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({ userId: req.user.id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.items = wishlist.items.filter((i) => i.productId.toString() !== productId);

    await wishlist.save();
    await wishlist.populate("items.productId", "name price imageUrl category brand");

    res.json(wishlist);
  } catch (err) {
    console.error("❌ Wishlist remove error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
