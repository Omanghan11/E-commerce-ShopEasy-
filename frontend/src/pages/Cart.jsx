import React from "react";
import { Link, useNavigate } from "react-router-dom";
import CartImage from "../assets/Images/CartImage.jpg";
import defaultImage from "../assets/Images/default-placeholder-image.jpg";
import { useProductContext } from "../Context/ProductContext";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateCartItemQuantity,
    getCartTotal,
  } = useProductContext();

  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/Checkout", { state: { cartItems } });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen text-black bg-gray-100 p-6">
        <div
          className="text-center text-white py-20 mb-12 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${CartImage})` }}
        >
          <h1 className="text-4xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-lg mb-6">Start shopping to add items to your cart!</p>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6">
      {/* Header Banner */}
      <div
        className="text-center text-white py-20 mb-12 rounded-lg bg-cover bg-center"
        style={{ backgroundImage: `url(${CartImage})` }}
      >
        <h1 className="text-4xl font-bold mb-4">Shopping Cart</h1>
      </div>

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId._id}
              className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-lg shadow-md"
            >
              {/* Wrap product info in a Link component */}
              <Link to={`/${item.productId.category}/${item.productId._id}`} className="flex items-center mb-4 sm:mb-0">
                <img
                  src={
                    (item.productId.images && item.productId.images.length > 0 && item.productId.images[0]) ||
                    item.productId.imageUrl ||
                    defaultImage
                  }
                  alt={item.productId.name}
                  className="w-24 h-24 object-contain rounded-md mr-4"
                  onError={(e) => {
                    e.target.src = defaultImage;
                  }}
                />
                <div>
                  <h2 className="text-lg font-semibold">
                    {item.productId.name}
                  </h2>
                  <p className="text-gray-600">
                    ₹
                    {item.productId.price
                      ? item.productId.price.toFixed(2)
                      : "N/A"}
                  </p>
                </div>
              </Link>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    updateCartItemQuantity(
                      item.productId._id,
                      item.quantity - 1
                    )
                  }
                  disabled={item.quantity <= 1}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() =>
                    updateCartItemQuantity(
                      item.productId._id,
                      item.quantity + 1
                    )
                  }
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.productId._id)}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-6">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div key={item.productId._id} className="flex justify-between">
                  <span className="text-gray-600">{item.productId.name}</span>
                  <span className="font-semibold">
                    ₹
                    {item.productId.price
                      ? item.productId.price.toFixed(2)
                      : "N/A"}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-300 mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>₹{getCartTotal().toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

