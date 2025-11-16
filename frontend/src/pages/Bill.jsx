// Bill.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import defaultImage from '../assets/Images/default-placeholder-image.jpg';

function Bill() {
  const location = useLocation();
  const orderData = location.state;

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Order Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find your order details.</p>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const { items, total, orderDate, orderId } = orderData;

  // Debug: Log the order data to see what's being passed
  console.log('Bill page - Order data:', orderData);
  console.log('Bill page - Items:', items);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

  const getProductDetails = (item) => {
    // Item can be the direct item from orderData.items or nested under product
    const product = item.product || item;
    const price = typeof product.price === 'string' 
      ? parseFloat(product.price.replace('₹', '').replace(',', ''))
      : product.price;
    const quantity = item.quantity || 1;
    
    // Handle different image formats - check item level first, then product level
    let image = defaultImage;
    
    // Check item level images first (from checkout data)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      image = item.images[0];
    } else if (item.imageUrl) {
      image = item.imageUrl;
    }
    // Then check product level images
    else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      image = product.images[0];
    } else if (product.imageUrl) {
      image = product.imageUrl;
    } else if (product.image) {
      image = product.image;
    }
    
    return {
      name: product.name || item.name,
      price: price,
      image: image,
      category: product.category || item.category,
      quantity: quantity,
      total: (price * quantity).toFixed(2)
    };
  };

  // Correcting the displayTotal to handle both cases and use ₹
  const displayTotal = `₹${parseFloat(total).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header - Green Bar */}
        <div className="bg-green-500 text-white rounded-t-lg px-6 py-4 flex items-center">
          <div className="bg-white rounded-full p-1 mr-3">
            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Order Placed Successfully!</h1>
        </div>

        {/* Order Details Cards */}
        <div className="bg-white rounded-b-lg shadow-sm">
          {/* Order Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <p className="font-semibold text-gray-900">{orderId}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-semibold text-gray-900">{formatDate(orderDate)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-semibold text-gray-900">{displayTotal}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            {items.map((item, index) => {
              const product = getProductDetails(item);
              
              return (
                <div key={index} className="flex items-center py-4 border-b border-gray-100 last:border-b-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mr-6 flex-shrink-0">
                    <img 
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = defaultImage;
                      }}
                    />
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                      <span><strong>Category:</strong> <span className="text-blue-600">{product.category}</span></span>
                      <span><strong>Quantity:</strong> {product.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-gray-700">Unit Price</span>
                        <p className="text-xl font-bold text-gray-900">
                          ₹{product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-700">Total Amount</span>
                        <p className="text-xl font-bold text-green-600">₹{product.total}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                Continue Shopping
              </Link>
              <button 
                onClick={() => window.print()}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Bill
              </button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-b-lg px-6 py-4 text-center text-gray-600 text-sm">
            <p className="mb-1"><strong>Thank you for shopping with ShopEasy!</strong> Your order will be processed within 24 hours.</p>
            <p>Order confirmation has been sent to your email address.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Bill;


