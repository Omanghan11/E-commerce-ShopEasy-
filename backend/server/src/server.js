import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

// Routes
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js"; // New import
import wishlistRoutes from "./routes/wishlist.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import discountRoutes from "./routes/discount.routes.js";

import categoryRoutes from "./routes/category.routes.js";
import brandRoutes from "./routes/brand.routes.js";

const app = express();
const port = process.env.PORT || 5000;

// ✅ Enable JSON parsing
app.use(express.json());

// ✅ Enable CORS (allow frontend http://localhost:5173)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('public/images'));

// ✅ Mount routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes); // Endpoint for retrieving orders
app.use("/api/checkout", checkoutRoutes); // New endpoint for placing orders
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/discounts", discountRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);

console.log(
  "✅ Registered routes: /api/products, /api/auth, /api/cart, /api/orders, /api/checkout, /api/wishlist, /api/admin, /api/tickets, /api/categories, /api/brands"
);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Test route for path resolution
app.get("/test-path", (req, res) => {
  const path = require('path');
  const fs = require('fs');
  
  try {
    const __filename = require('url').fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const projectRoot = path.resolve(__dirname, '../../../');
    const frontendPath = path.join(projectRoot, 'frontend/public/images/products');
    
    res.json({
      __dirname,
      projectRoot,
      frontendPath,
      exists: fs.existsSync(frontendPath),
      contents: fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath) : 'Path does not exist'
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Test route for static file serving
app.get("/test-image", (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const uploadsDir = path.join(__dirname, '../uploads/products');
    const files = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [];
    
    res.send(`
      <h1>Test Static File Serving</h1>
      <p>Uploads directory: ${uploadsDir}</p>
      <p>Files in uploads/products:</p>
      <ul>
        ${files.map(file => `<li><a href="/uploads/products/${file}" target="_blank">${file}</a></li>`).join('')}
      </ul>
      <p>Test file: <a href="/uploads/products/test.txt" target="_blank">/uploads/products/test.txt</a></p>
      <p>If you can see the content of test.txt, static serving is working.</p>
    `);
  } catch (error) {
    res.send(`Error: ${error.message}`);
  }
});

// ✅ Connect DB and start server
connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => console.error("❌ DB connection error:", err));

// ✅ Log available collections once DB is connected
mongoose.connection.once("open", async () => {
  console.log("✅ Connected to DB:", mongoose.connection.name);
  const collections = await mongoose.connection.db
    .listCollections()
    .toArray();
  console.log(
    "✅ Available collections:",
    collections.map((c) => c.name)
  );
});