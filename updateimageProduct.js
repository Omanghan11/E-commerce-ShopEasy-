// updateimageProduct.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Use the same Mongoose instance to define schema
const ProductSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    category: String,
    price: Number,
    currency: String,
    brand: String,
    imageUrl: String,
    stock: Number,
    rating: Number,
    description: String,
    images: { type: [String], default: [] },
  },
  { collection: "products" }
);

const Product = mongoose.model("Product", ProductSchema);

const __dirname = path.resolve();
const imagesFile = path.join(__dirname, "productImages.json");

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/shopeasy", {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected");

    if (!fs.existsSync(imagesFile)) {
      console.error("❌ productImages.json not found!");
      process.exit(1);
    }

    const imagesData = JSON.parse(fs.readFileSync(imagesFile, "utf-8"));

    // 💡 Create a map to ensure unique slugs
    const uniqueSlugs = new Map();
    for (const item of imagesData) {
      if (!uniqueSlugs.has(item.slug)) {
        uniqueSlugs.set(item.slug, item.images);
      }
    }

    // 🔄 Use a for...of loop to iterate over the unique slugs map
    for (const [slug, images] of uniqueSlugs.entries()) {
      try {
        const result = await Product.updateMany(
          { slug: slug },
          { $set: { images: images } }
        );

        if (result.matchedCount > 0) {
          console.log(
            `✅ Updated ${result.matchedCount} documents for slug: ${slug}`
          );
        } else {
          console.warn(`⚠️ No products found with slug: ${slug}`);
        }
      } catch (err) {
        console.error(`❌ Error updating ${slug}:`, err.message);
      }
    }

    console.log("🎉 All products processed!");
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

main();