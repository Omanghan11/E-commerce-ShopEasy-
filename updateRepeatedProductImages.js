// updateRepeatedProductImages.js - Handle repeated products and their image updates
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
    console.log(`📊 Found ${imagesData.length} image entries in productImages.json`);

    // Find all products in database
    const allProducts = await Product.find({});
    console.log(`📊 Found ${allProducts.length} products in database`);

    // Group products by slug to identify duplicates
    const productsBySlug = {};
    allProducts.forEach(product => {
      if (!productsBySlug[product.slug]) {
        productsBySlug[product.slug] = [];
      }
      productsBySlug[product.slug].push(product);
    });

    // Find duplicates
    const duplicateSlugs = Object.keys(productsBySlug).filter(slug => 
      productsBySlug[slug].length > 1
    );

    if (duplicateSlugs.length > 0) {
      console.log(`🔍 Found ${duplicateSlugs.length} slugs with duplicate products:`);
      duplicateSlugs.forEach(slug => {
        console.log(`   - ${slug}: ${productsBySlug[slug].length} products`);
      });
    }

    // Update images for all products (including duplicates)
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const imageEntry of imagesData) {
      const { slug, images } = imageEntry;
      
      try {
        // Update ALL products with this slug (handles duplicates)
        const result = await Product.updateMany(
          { slug: slug },
          { $set: { images: images } }
        );

        if (result.matchedCount > 0) {
          console.log(`✅ Updated ${result.matchedCount} product(s) for slug: ${slug}`);
          updatedCount += result.matchedCount;
        } else {
          console.warn(`⚠️ No products found with slug: ${slug}`);
          notFoundCount++;
        }
      } catch (err) {
        console.error(`❌ Error updating ${slug}:`, err.message);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Total products updated: ${updatedCount}`);
    console.log(`⚠️ Slugs not found in database: ${notFoundCount}`);
    console.log(`🔍 Duplicate slugs handled: ${duplicateSlugs.length}`);

    // Verify the updates
    console.log("\n🔍 Verifying updates...");
    const productsWithImages = await Product.countDocuments({ 
      images: { $exists: true, $not: { $size: 0 } } 
    });
    const productsWithoutImages = await Product.countDocuments({ 
      $or: [
        { images: { $exists: false } },
        { images: { $size: 0 } }
      ]
    });

    console.log(`✅ Products with images: ${productsWithImages}`);
    console.log(`❌ Products without images: ${productsWithoutImages}`);

    console.log("🎉 All products processed!");
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

main();