import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ProductFilter from "../Components/ProductFilter";
import { FaHeart, FaShoppingCart, FaRegHeart, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useProductContext } from "../Context/ProductContext";

function SearchPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  const { addToCart, addToWishlist, isInCart, isInWishlist } = useProductContext();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (!searchTerm) {
      setProducts([]);
      setFilteredProducts([]);
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://shopeasy-backend-sagk.onrender.com/api/products?search=${encodeURIComponent(searchTerm)}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        const productsArray = data.products || data || [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } catch (err) {
        console.error("❌ Search fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleAction = (product, actionType) => {
    if (!isLoggedIn) {
      setMessage("Please log in to perform this action.");
      return;
    }

    if (actionType === "cart") {
      addToCart(product);
      setMessage(isInCart(product._id) ? 'Quantity increased!' : 'Added to Cart');
    } else if (actionType === "wishlist") {
      if (isInWishlist(product._id)) {
        setMessage('Already in Wishlist');
        return;
      }
      addToWishlist(product);
      setMessage('Added to Wishlist');
    }
  };

  // Helper function to render star rating
  const renderStars = (rating, size = "w-4 h-4") => {
    if (!rating || rating === 0) {
      return <span className="text-sm text-gray-500">No reviews</span>;
    }

    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className={`text-yellow-400 ${size}`} />);
    }

    // Half star
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className={`text-yellow-400 ${size}`} />);
    }

    // Empty stars
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

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">⚠️ {error}</div>;
  }

  if (filteredProducts.length === 0 && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="text-center text-gray-500">
          No products found for "<b>{searchTerm}</b>"
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-semibold mb-6">
        Search results for "<span className="text-blue-600">{searchTerm}</span>"
      </h2>

      {/* Product Filter */}
      {products.length > 0 && (
        <ProductFilter
          products={products}
          onFilteredProducts={setFilteredProducts}
          brands={[...new Set(products.map(p => p.brand).filter(Boolean))]}
          priceRange={{ min: 0, max: Math.max(...products.map(p => Number(p.price) || 0)) }}
        />
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredProducts.map((product) => (
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

            {/* Wishlist top-right */}
            <button
              onClick={() => handleAction(product, 'wishlist')}
              className={`absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full transition ${isInWishlist(product._id) && isLoggedIn
                  ? 'bg-red-100 border border-red-300 text-red-600'
                  : 'border-2 border-gray-400 bg-white hover:bg-gray-200 text-gray-500 cursor-pointer'
                }`}
              disabled={isInWishlist(product._id) && isLoggedIn}
            >
              {isInWishlist(product._id) && isLoggedIn ? <FaHeart /> : <FaRegHeart />}
            </button>

            {/* Product Image + Info */}
            <Link
              to={`/${product.category}/${product._id}`}
              state={{ product, category: product.category }}
              className="block flex-1 w-full"
            >
              <div className="w-full h-48 bg-gray-50 rounded mb-4 overflow-hidden flex items-center justify-center">
                <img
                  src={(product.images && product.images[0]) || product.imageUrl}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold mb-1 line-clamp-2 text-left">{product.name}</h2>
              <div className="mb-2 text-left">
                {renderStars(product.rating)}
              </div>
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
            </Link>

            {/* Action Buttons */}
            <div className="flex justify-between items-center gap-2 w-full">
              <button
                onClick={() => handleAction(product, 'cart')}
                className={`flex items-center justify-center w-1/2 py-2 rounded transition ${isInCart(product._id) && isLoggedIn
                    ? 'bg-green-100 border border-green-400 text-green-700'
                    : 'border border-[#364153] text-[#364153] hover:bg-[#364153] hover:text-white cursor-pointer'
                  }`}
                disabled={isInCart(product._id) && isLoggedIn}
              >
                <FaShoppingCart className="mr-2" />
                {isInCart(product._id) && isLoggedIn ? 'In Cart' : 'Cart'}
              </button>

              <Link
                to="/Checkout"
                state={{ product: { ...product, quantity: 1 }, fromBuyNow: true }}
                className="w-1/2 text-[#364153] border border-[#364153] py-2 rounded cursor-pointer hover:bg-[#364153] hover:text-white transition-colors text-center"
              >
                Buy Now
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Toast Message */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in">
          {message}
        </div>
      )}
    </div>
  );
}

export default SearchPage;


