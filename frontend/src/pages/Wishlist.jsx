// Wishlist.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import WishlistImage from '../assets/Images/WishlistImage.jpg';
import { useProductContext } from '../Context/ProductContext';
import defaultImage from '../assets/Images/default-placeholder-image.jpg'; // Import default image

function Wishlist() {
  const { wishlistItems, removeFromWishlist, addToCart } = useProductContext();

  return (
    <div className="min-h-screen text-black bg-gray-100 p-6">
      <div className="text-center text-white py-20 mb-12 rounded-lg bg-cover bg-center"
        style={{
          backgroundImage: `url(${WishlistImage})`,
        }}
      >
        <h1 className="text-4xl font-bold mb-4">Wishlist</h1>
        <p className="text-lg mb-6">Save items for later purchase.</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Continue Shopping
        </Link>
      </div>
      
      <div className="mt-8 text-center">
        {wishlistItems.length === 0 ? (
          <p className="text-gray-500">Your wishlist is empty.</p>
        ) : (
          <ul className="space-y-4">
            {wishlistItems.map((item) => (
              <li key={item.productId._id} className="flex items-center justify-between bg-white p-4 rounded shadow">
                {/* Wrap product info in a Link component */}
                <Link to={`/${item.productId.category}/${item.productId._id}`} className="flex items-center text-left">
                  <img 
                    src={
                      (item.productId.images && item.productId.images.length > 0 && item.productId.images[0]) ||
                      item.productId.imageUrl ||
                      defaultImage
                    }
                    alt={item.productId.name} 
                    className="w-16 h-16 object-contain rounded mr-4"
                    onError={(e) => {
                      e.target.src = defaultImage;
                    }}
                  />
                  <div>
                    <span className="font-semibold">{item.productId.name}</span>
                    <p className="text-gray-600">₹{item.productId.price}</p>
                  </div>
                </Link>
                <div className="flex flex-row-reverse gap-2"> {/* Align buttons to the right */}
                  <button 
                    onClick={() => {
                      addToCart(item.productId);
                      removeFromWishlist(item.productId._id);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(item.productId._id)} 
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Wishlist;


