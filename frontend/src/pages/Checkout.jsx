import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CheckoutImage from '../assets/Images/CheckoutImage.jpg';
import defaultImage from '../assets/Images/default-placeholder-image.jpg';
import { useProductContext } from '../Context/ProductContext';
import { useNotifications } from '../Context/NotificationContext';
import Dialog from '../Components/Dialog';
import { useDialog } from '../hooks/useDialog';

function Checkout() {
  const location = useLocation();
  const { cartItems, getCartTotal } = useProductContext();
  const { refreshNotificationsImmediate } = useNotifications();
  const navigate = useNavigate();
  const { dialog, hideDialog, showError, showAlert } = useDialog();

  // From Buy Now
  const { product: buyNowProduct, fromBuyNow } = location.state || {};
  const checkoutItems = fromBuyNow && buyNowProduct
    ? [{ product: { ...buyNowProduct }, quantity: buyNowProduct.quantity || 1 }]
    : cartItems;

  // Debug: Log the checkout items structure (remove in production)
  console.log('Checkout items:', checkoutItems);

  const [shipping, setShipping] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const [billing, setBilling] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useNewAddress, setUseNewAddress] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  // Fetch saved addresses
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api/auth/addresses', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const addresses = await response.json();
          console.log('Fetched addresses:', addresses); // Debug log
          
          // Transform addresses to match checkout format
          const transformedAddresses = addresses.map(addr => ({
            fullName: addr.fullName,
            phone: addr.phone,
            address: `${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`,
            city: addr.city,
            state: addr.state,
            zipCode: addr.pincode,
            type: addr.type,
            isDefault: addr.isDefault
          }));
          
          setSavedAddresses(transformedAddresses);
          
          // Auto-fill with first saved address if available
          if (transformedAddresses.length > 0 && !useNewAddress) {
            const firstAddress = transformedAddresses[0];
            setShipping(firstAddress);
            if (sameAsShipping) {
              setBilling(firstAddress);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };

    fetchSavedAddresses();
  }, [useNewAddress, sameAsShipping]);

  const calculateTotal = () => {
    return checkoutItems.reduce((total, item) => {
      // Use discounted price if available, otherwise use regular price
      const product = item.product || item.productId;
      const price = parseFloat(
        product?.hasDiscount ? product.discountedPrice : 
        (product?.price || item.price || 0)
      );
      const quantity = parseInt(item.quantity || 1);
      return total + (price * quantity);
    }, 0).toFixed(2);
  };

  const calculateOrderTotal = () => {
    const subtotal = parseFloat(calculateTotal());
    return Math.max(0, subtotal - couponDiscount);
  };

  // Coupon functions
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api/discounts/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          cartItems: checkoutItems,
          userId: localStorage.getItem('userId')
        })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        const subtotal = parseFloat(calculateTotal());
        let discount = 0;

        if (data.coupon.discountType === 'percentage') {
          discount = (subtotal * data.coupon.discountValue) / 100;
        } else {
          discount = data.coupon.discountValue;
        }

        // Apply maximum discount limit if set
        if (data.coupon.maxDiscountAmount && discount > data.coupon.maxDiscountAmount) {
          discount = data.coupon.maxDiscountAmount;
        }

        // Check minimum order amount
        if (data.coupon.minOrderAmount && subtotal < data.coupon.minOrderAmount) {
          showError(`Minimum order amount of ₹${data.coupon.minOrderAmount} required for this coupon`);
          return;
        }

        setAppliedCoupon(data.coupon);
        setCouponDiscount(Math.round(discount));
        showAlert(`Coupon applied! You saved ₹${Math.round(discount)}`);
      } else {
        showError(data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      showError('Failed to apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    showAlert('Coupon removed');
  };

  const handlePlaceOrder = async () => {
    if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.state || !shipping.zipCode) {
      showError('Please fill in all shipping details', 'Missing Information');
      return;
    }

    if (!sameAsShipping && (!billing.fullName || !billing.address || !billing.city || !billing.state || !billing.zipCode)) {
      showError('Please fill in all billing details', 'Missing Information');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('Please log in to place an order', 'Authentication Required');
        setTimeout(() => navigate('/Login'), 2000);
        return;
      }

      const orderData = {
        orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: checkoutItems.map(item => ({
          productId: item.product?._id || item.productId?._id || item.productId,
          name: item.product?.name || item.productId?.name || item.name,
          price: parseFloat(
            (item.product?.hasDiscount ? item.product.discountedPrice : item.product?.price) ||
            (item.productId?.hasDiscount ? item.productId.discountedPrice : item.productId?.price) ||
            item.price || 0
          ),
          quantity: item.quantity || 1,
          // Include image data for the Bill page
          images: item.product?.images || item.productId?.images || [],
          imageUrl: item.product?.imageUrl || item.productId?.imageUrl || item.imageUrl,
          category: item.product?.category || item.productId?.category || item.category,
        })),
        total: calculateOrderTotal(),
        originalTotal: calculateTotal(),
        couponDiscount: couponDiscount,
        appliedCoupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discountType: appliedCoupon.discountType,
          discountValue: appliedCoupon.discountValue,
          discountAmount: couponDiscount
        } : null,
        orderDate: new Date().toISOString(),
        status: 'pending',
        shipping,
        billing: sameAsShipping ? shipping : billing,
        paymentMethod
      };

      const response = await fetch('${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const savedOrder = await response.json();

      // Refresh notifications to show new order notification
      await refreshNotificationsImmediate();

      // Navigate to existing Bill page for order success
      navigate('/Bill', {
        state: {
          ...orderData,
          orderId: savedOrder.order?._id || orderData.orderId
        }
      });

    } catch (error) {
      console.error('Error placing order:', error);
      showError('Failed to place order. Please try again.', 'Order Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (address) => {
    setShipping(address);
    if (sameAsShipping) {
      setBilling(address);
    }
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link to="/" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div 
        className="bg-cover bg-center py-16 text-white text-center"
        style={{ backgroundImage: `url(${CheckoutImage})` }}
      >
        <div className="py-8">
          <h1 className="text-4xl font-bold text-shadow-lg">Checkout</h1>
          <p className="text-lg mt-2 text-shadow">Complete your purchase</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && !useNewAddress && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Select Saved Address</h2>
                <div className="space-y-3">
                  {savedAddresses.map((address, index) => (
                    <div 
                      key={index}
                      className={`p-3 border rounded cursor-pointer transition ${
                        shipping.address === address.address ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <p className="font-medium">{address.fullName}</p>
                      <p className="text-sm text-gray-600">{address.address}</p>
                      <p className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setUseNewAddress(true)}
                  className="mt-4 text-blue-500 hover:text-blue-600"
                >
                  + Use a new address
                </button>
              </div>
            )}

            {/* No Saved Addresses Message */}
            {savedAddresses.length === 0 && !useNewAddress && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">No Saved Addresses</h2>
                <p className="text-gray-600 mb-4">You don't have any saved addresses yet.</p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setUseNewAddress(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add New Address
                  </button>
                  <Link
                    to="/Profile"
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                  >
                    Manage Addresses in Profile
                  </Link>
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {(useNewAddress || savedAddresses.length === 0) && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                  {savedAddresses.length > 0 && (
                    <button
                      onClick={() => setUseNewAddress(false)}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Use saved address
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({...shipping, fullName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={shipping.phone}
                    onChange={(e) => setShipping({...shipping, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={shipping.address}
                    onChange={(e) => setShipping({...shipping, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={shipping.city}
                    onChange={(e) => setShipping({...shipping, city: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={shipping.state}
                    onChange={(e) => setShipping({...shipping, state: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={shipping.zipCode}
                    onChange={(e) => setShipping({...shipping, zipCode: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Billing Address */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Billing Address</h2>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sameAsShipping}
                    onChange={(e) => {
                      setSameAsShipping(e.target.checked);
                      if (e.target.checked) {
                        setBilling(shipping);
                      }
                    }}
                    className="mr-2"
                  />
                  Same as shipping address
                </label>
              </div>
              
              {!sameAsShipping && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={billing.fullName}
                    onChange={(e) => setBilling({...billing, fullName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={billing.phone}
                    onChange={(e) => setBilling({...billing, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={billing.address}
                    onChange={(e) => setBilling({...billing, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500 md:col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={billing.city}
                    onChange={(e) => setBilling({...billing, city: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={billing.state}
                    onChange={(e) => setBilling({...billing, state: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={billing.zipCode}
                    onChange={(e) => setBilling({...billing, zipCode: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Cash on Delivery
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Credit/Debit Card
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  UPI
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {/* Items */}
            <div className="space-y-4 mb-6">
              {checkoutItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <img
                    src={
                      // Handle both cart items (productId) and buy now items (product)
                      (item.product?.images && item.product.images.length > 0 && item.product.images[0]) ||
                      (item.productId?.images && item.productId.images.length > 0 && item.productId.images[0]) ||
                      item.product?.imageUrl ||
                      item.productId?.imageUrl ||
                      item.imageUrl ||
                      defaultImage
                    }
                    alt={item.product?.name || item.productId?.name || item.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = defaultImage;
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product?.name || item.productId?.name || item.name}</h3>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    {(item.product?.hasDiscount || item.productId?.hasDiscount) ? (
                      <div className="space-y-1">
                        <p className="font-medium text-green-600">
                          ₹{((
                            (item.product?.hasDiscount ? item.product.discountedPrice : item.product?.price) ||
                            (item.productId?.hasDiscount ? item.productId.discountedPrice : item.productId?.price) ||
                            item.price || 0
                          ) * (item.quantity || 1)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          ₹{((item.product?.price || item.productId?.price || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="font-medium">₹{((item.product?.price || item.productId?.price || item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Apply Coupon</h3>
              {!appliedCoupon ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={couponLoading}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className={`px-4 py-2 rounded font-medium transition ${
                      couponLoading || !couponCode.trim()
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-green-800">
                        {appliedCoupon.code} Applied
                      </span>
                      <p className="text-sm text-green-600">
                        {appliedCoupon.description || `${appliedCoupon.discountType === 'percentage' ? appliedCoupon.discountValue + '%' : '₹' + appliedCoupon.discountValue} discount applied`}
                      </p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{calculateTotal()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({appliedCoupon.code}):</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>₹{calculateOrderTotal()}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className={`w-full mt-6 py-3 rounded font-semibold transition ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

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

export default Checkout;

