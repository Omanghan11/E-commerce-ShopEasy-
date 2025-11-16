import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useProductContext } from "../Context/ProductContext";
import { FaShoppingCart, FaBolt, FaStar, FaStarHalfAlt, FaRegStar, FaUser, FaEdit, FaTrash } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Dialog from '../components/Dialog';
import { useDialog } from '../hooks/useDialog';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

function ProductDetails() {
  const { category, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useProductContext();

  const [product, setProduct] = useState(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  // Review states
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const { dialog, hideDialog, showConfirm } = useDialog();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    setIsLoggedIn(!!token);

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    }

    const fetchProduct = async () => {
      if (product) return;

      try {
        const response = await fetch(`http://localhost:5000/api/products/id/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        console.log('Product data received:', data);
        console.log('Has discount:', data.hasDiscount);
        console.log('Discount info:', data.discount);
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, product]);

  useEffect(() => {
    if (product && product.reviews) {
      setReviews(product.reviews);
    }
  }, [product]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setMessage("Please log in to add items to cart.");
      return;
    }

    if (!product.stock || product.stock <= 0) {
      setMessage("Sorry, this product is currently out of stock.");
      return;
    }

    addToCart(product);
    setMessage("Added to Cart!");
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setMessage("Please log in to purchase.");
      return;
    }

    if (!product.stock || product.stock <= 0) {
      setMessage("Sorry, this product is currently out of stock.");
      return;
    }

    navigate("/Checkout", {
      state: { product: { ...product, quantity: 1 }, fromBuyNow: true },
    });
  };

  const renderStars = (rating, size = "w-5 h-5") => {
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

    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setMessage("Please log in to submit a review.");
      return;
    }

    if (!newReview.comment.trim()) {
      setMessage("Please write a comment for your review.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setMessage("Please log in to submit a review.");
        return;
      }

      const url = editingReview
        ? `http://localhost:5000/api/products/${product._id}/reviews/${editingReview._id}`
        : `http://localhost:5000/api/products/${product._id}/reviews`;

      const method = editingReview ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newReview),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setProduct(data.product);
      setReviews(data.product.reviews);
      setNewReview({ rating: 5, comment: "" });
      setShowReviewForm(false);
      setEditingReview(null);
      setHoverRating(0);
      setMessage(editingReview ? "Review updated successfully!" : "Review submitted successfully!");
    } catch (err) {
      setMessage(err.message || "Failed to submit review. Please try again.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    showConfirm(
      "Are you sure you want to delete this review? This action cannot be undone.",
      async () => {
        await deleteReview(reviewId);
      },
      "Delete Review"
    );
  };

  const deleteReview = async (reviewId) => {

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/products/${product._id}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete review");
      }

      setProduct(data.product);
      setReviews(data.product.reviews);
      setMessage("Review deleted successfully!");
    } catch (err) {
      setMessage(err.message || "Failed to delete review. Please try again.");
    }
  };

  const startEditReview = (review) => {
    setEditingReview(review);
    setNewReview({ rating: review.rating, comment: review.comment });
    setShowReviewForm(true);
  };

  if (loading) return <div className="text-center py-10">Loading product...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4 relative">
              {/* Sale Badge */}
              {product.hasDiscount && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-2 rounded-full z-10 shadow-lg">
                  SALE - {product.discount.percentage}% OFF
                </div>
              )}
              
              {product.images && product.images.length > 0 ? (
                <Swiper
                  modules={[Navigation, Pagination, Autoplay]}
                  navigation
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3000 }}
                  className="w-full h-96 rounded-lg"
                >
                  {product.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain bg-gray-50"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  {renderStars(product.rating)}
                  <span className="text-gray-600">({product.reviewCount || 0} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                {product.hasDiscount ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <p className="text-3xl font-bold text-green-600">₹{product.discountedPrice}</p>
                      <p className="text-xl text-gray-500 line-through">₹{product.originalPrice}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                        {product.discount.percentage}% OFF
                      </span>
                      <span className="text-green-600 font-semibold">
                        You save ₹{Math.round(product.savings)}!
                      </span>
                    </div>
                    {product.discount.name && (
                      <p className="text-sm text-gray-600 italic">
                        Discount: {product.discount.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">₹{product.price}</p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              {product.specifications && product.specifications.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                  <div className="space-y-2">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between py-1 border-b border-gray-200">
                        <span className="font-medium">{spec.name}:</span>
                        <span>{spec.value} {spec.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock || product.stock <= 0}
                  className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition ${
                    !product.stock || product.stock <= 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!product.stock || product.stock <= 0}
                  className={`flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition ${
                    !product.stock || product.stock <= 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  <FaBolt className="mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              {isLoggedIn && !showReviewForm && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">
                  {editingReview ? "Edit Your Review" : "Write a Review"}
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Rating *</label>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="flex items-center space-x-1 p-2 rounded-lg border-2 border-dashed border-gray-200 hover:border-yellow-300 transition-colors"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          onMouseEnter={() => setHoverRating(star)}
                          className="p-1 hover:scale-110 transition-all duration-150 rounded-full hover:bg-yellow-50"
                        >
                          <FaStar 
                            className={`w-8 h-8 transition-all duration-200 ${
                              star <= (hoverRating || newReview.rating) 
                                ? 'text-yellow-400 drop-shadow-sm' 
                                : 'text-gray-300 hover:text-gray-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 font-medium">
                        {hoverRating || newReview.rating} out of 5 stars
                      </span>
                      <span className="text-xs text-gray-500">
                        {hoverRating ? (
                          hoverRating === 1 ? "Poor" :
                          hoverRating === 2 ? "Fair" :
                          hoverRating === 3 ? "Good" :
                          hoverRating === 4 ? "Very Good" : "Excellent"
                        ) : (
                          newReview.rating === 1 ? "Poor" :
                          newReview.rating === 2 ? "Fair" :
                          newReview.rating === 3 ? "Good" :
                          newReview.rating === 4 ? "Very Good" : "Excellent"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Click on a star to rate this product
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Your Review * 
                    <span className="text-xs text-gray-500 ml-1">
                      ({newReview.comment.length}/500 characters)
                    </span>
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    maxLength="500"
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={!newReview.comment.trim()}
                    className={`px-6 py-2 rounded-lg font-medium transition ${
                      !newReview.comment.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {editingReview ? "Update Review" : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                      setNewReview({ rating: 5, comment: "" });
                      setHoverRating(0);
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Reviews Summary */}
            {reviews.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{product.rating.toFixed(1)}</div>
                      <div className="flex items-center justify-center mb-1">
                        {renderStars(product.rating, "w-4 h-4")}
                      </div>
                      <div className="text-sm text-gray-600">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = reviews.filter(r => r.rating === rating).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center space-x-2 mb-1">
                            <span className="w-8 text-xs">{rating}★</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-yellow-400 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="w-8 text-xs text-gray-500">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((review) => (
                  <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{review.user}</span>
                            {review.isVerified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating, "w-4 h-4")}
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {user && (user._id === review.userId || user.id === review.userId) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditReview(review)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition"
                            title="Edit review"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition"
                            title="Delete review"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    {review.updatedAt && review.updatedAt !== review.createdAt && (
                      <p className="text-xs text-gray-400 mt-2 italic">
                        Edited on {new Date(review.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FaStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2">No reviews yet</p>
                  <p className="text-gray-400">Be the first to share your experience with this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={hideDialog}
        onConfirm={dialog.onConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        showCancel={dialog.showCancel}
      />
    </div>
  );
}

export default ProductDetails;