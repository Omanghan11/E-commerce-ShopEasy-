import React, { useEffect, useState, useRef } from "react";
import { useProductContext } from "../Context/ProductContext";
import { useNavigate, Link } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import defaultImage from "../assets/Images/default-placeholder-image.jpg";
import ProductFilter from "../Components/ProductFilter";

function ProductsPage() {
  const { addToCart, addToWishlist, isInCart, isInWishlist } = useProductContext();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [message, setMessage] = useState("");
  const productsPerPage = 20;
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const productsGridRef = useRef(null);

  // Move fetchProducts outside useEffect so it can be used by handlePageChange
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/products?page=${page}&limit=${productsPerPage}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotalProducts(data.total || 0);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    fetchProducts(1);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleAction = (product, actionType) => {
    if (!isLoggedIn) {
      setMessage("Please log in to perform this action.");
      return;
    }

    if ((actionType === "buy" || actionType === "cart") && (!product.stock || product.stock <= 0)) {
      setMessage("Sorry, this product is currently out of stock.");
      return;
    }

    if (actionType === "buy") {
      navigate("/Checkout", {
        state: { product: { ...product, quantity: 1 }, fromBuyNow: true },
      });
      setMessage("Redirecting to Checkout");
    } else if (actionType === "cart") {
      addToCart(product);
      setMessage(isInCart(product._id) ? "Quantity increased!" : "Added to Cart");
    } else if (actionType === "wishlist") {
      if (isInWishlist(product._id)) {
        setMessage("Already in Wishlist");
        return;
      }
      addToWishlist(product);
      setMessage("Added to Wishlist");
    }
  };

  const renderStars = (rating, size = "w-4 h-4") => {
    if (!rating || rating === 0) {
      return <span className="text-sm text-gray-500">No reviews</span>;
    }

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className={`text-yellow-400 ${size}`} />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className={`text-yellow-400 ${size}`} />);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className={`text-gray-300 ${size}`} />);
    }

    return (
      <div className="flex items-center space-x-1">
        {stars}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Use filtered products directly (no client-side pagination)
  const currentProducts = filteredProducts;

  const handlePageChange = async (pageNumber) => {
    await fetchProducts(pageNumber);
    if (productsGridRef.current) {
      productsGridRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen text-black bg-gray-100 p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">All Products</h1>
        <p className="text-lg mb-6">Discover our complete collection.</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go Back to Home
        </Link>
      </div>

      <ProductFilter
        products={products}
        onFilteredProducts={(filtered) => {
          setFilteredProducts(filtered);
          // Reset to page 1 when filtering
          if (filtered.length !== products.length) {
            setCurrentPage(1);
            setTotalPages(Math.ceil(filtered.length / productsPerPage));
          }
        }}
        brands={[...new Set(products.map((p) => p.brand).filter(Boolean))]}
        priceRange={{ min: 0, max: Math.max(...products.map((p) => Number(p.price) || 0)) }}
      />

      <div ref={productsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        {currentProducts.map((product) => (
          <div
            key={product._id}
            className="relative border rounded-lg p-4 shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 flex flex-col items-center"
          >
            {/* Sale Badge */}
            {product.hasDiscount && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                SALE
              </div>
            )}

            <button
              onClick={() => handleAction(product, "wishlist")}
              className={`absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full transition ${
                isInWishlist(product._id) && isLoggedIn
                  ? "bg-red-100 border border-red-300 text-red-600"
                  : "border-2 border-gray-400 bg-white hover:bg-gray-200 text-gray-500 cursor-pointer"
              }`}
              disabled={isInWishlist(product._id) && isLoggedIn}
            >
              {isInWishlist(product._id) && isLoggedIn ? <FaHeart /> : <FaRegHeart />}
            </button>

            <Link
              to={`/${product.category}/${product._id}`}
              state={{ product, category: product.category }}
              className="block flex-1 w-full"
            >
              <div className="w-full h-48 bg-gray-50 rounded mb-4 overflow-hidden flex items-center justify-center">
                <img
                  src={(product.images && product.images[0]) || product.imageUrl || defaultImage}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold mb-1 line-clamp-2 text-left">{product.name}</h2>
              <div className="mb-2 text-left">{renderStars(product.rating)}</div>

              {/* Price */}
              <div className="mb-2 text-left w-full">
                {product.hasDiscount ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-lg font-bold text-green-600">₹{product.discountedPrice}</p>
                      <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                        {product.discount.percentage}% OFF
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        Save ₹{Math.round(product.savings)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-gray-700">₹{product.price}</p>
                )}
              </div>

              {/* Stock Information */}
              <div className="mb-2 text-left w-full">
                {product.stock > 0 ? (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10
                        ? "bg-green-100 text-green-800"
                        : product.stock > 5
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {product.stock > 10 ? "In Stock" : `Only ${product.stock} left`}
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                )}
              </div>
            </Link>

            <div className="flex justify-between items-center gap-2 w-full">
              <button
                onClick={() => handleAction(product, "cart")}
                disabled={(isInCart(product._id) && isLoggedIn) || !product.stock || product.stock <= 0}
                className={`flex items-center justify-center w-1/2 py-2 rounded transition ${
                  !product.stock || product.stock <= 0
                    ? "bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed"
                    : isInCart(product._id) && isLoggedIn
                    ? "bg-green-100 border border-green-400 text-green-700"
                    : "border border-[#364153] text-[#364153] hover:bg-[#364153] hover:text-white cursor-pointer"
                }`}
              >
                <FaShoppingCart className="mr-2" />
                {!product.stock || product.stock <= 0
                  ? "No Stock"
                  : isInCart(product._id) && isLoggedIn
                  ? "In Cart"
                  : "Cart"}
              </button>

              <button
                onClick={() => handleAction(product, "buy")}
                disabled={!product.stock || product.stock <= 0}
                className={`w-1/2 py-2 rounded transition-colors ${
                  !product.stock || product.stock <= 0
                    ? "bg-gray-200 border border-gray-300 text-gray-400 cursor-not-allowed"
                    : "text-[#364153] border border-[#364153] cursor-pointer hover:bg-[#364153] hover:text-white"
                }`}
              >
                {!product.stock || product.stock <= 0 ? "No Stock" : "Buy Now"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mb-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-2 rounded ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-10">
          <div className="text-gray-500 text-lg">No products found.</div>
          <div className="text-gray-400 text-sm mt-2">Try adjusting your filters or check back later.</div>
        </div>
      )}

      {/* Toast Message */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {message}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;


