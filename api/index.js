// Vercel serverless function handler
import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { connectDB } from "../backend/server/src/db.js";

// Routes
import productRoutes from "../backend/server/src/routes/product.routes.js";
import authRoutes from "../backend/server/src/routes/auth.routes.js";
import cartRoutes from "../backend/server/src/routes/cart.routes.js";
import orderRoutes from "../backend/server/src/routes/order.routes.js";
import checkoutRoutes from "../backend/server/src/routes/checkout.routes.js";
import wishlistRoutes from "../backend/server/src/routes/wishlist.routes.js";
import adminRoutes from "../backend/server/src/routes/admin.routes.js";
import ticketRoutes from "../backend/server/src/routes/ticket.routes.js";
import discountRoutes from "../backend/server/src/routes/discount.routes.js";
import categoryRoutes from "../backend/server/src/routes/category.routes.js";
import brandRoutes from "../backend/server/src/routes/brand.routes.js";

const app = express();

// Enable JSON parsing
app.use(express.json());

// Enable CORS
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://e-commerce-shop-easy.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('public/images'));

// Mount routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);

// Default route
app.get("/api", (req, res) => {
  res.send("Backend is running 🚀");
});

// Connect to MongoDB
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }
  
  try {
    await connectDB(process.env.MONGODB_URI);
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

// Serverless function handler
export default async function handler(req, res) {
  await connectToDatabase();
  return app(req, res);
}
