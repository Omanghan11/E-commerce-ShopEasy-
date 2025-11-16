import fs from "fs";

// Load your current products JSON
const products = JSON.parse(fs.readFileSync("./products.json", "utf-8"));

// Generate JSON skeleton with 4 image placeholders per product
const imageSkeleton = products.map((product) => {
  const slug = product.slug;
  return {
    slug,
    images: [
      `/images/products/${slug}/1.jpg`,
      `/images/products/${slug}/2.jpg`,
      `/images/products/${slug}/3.jpg`,
      `/images/products/${slug}/4.jpg`
    ]
  };
});

// Save to a new JSON file
fs.writeFileSync("./productImages.json", JSON.stringify(imageSkeleton, null, 2));

console.log("✅ productImages.json created with 4 image placeholders per product!");
