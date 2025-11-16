import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, ShoppingBag, Heart, MapPin, Phone, Mail, Edit3, Camera, Package, Star, CreditCard, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { FaTrash, FaPlus, FaEye, FaComments, FaTimes, FaPaperPlane, FaUser, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../pages/useAuth';
import { useProductContext } from '../Context/ProductContext';
import { useNotifications } from '../Context/NotificationContext';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'

  // Password update states
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  // Address management states
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressData, setAddressData] = useState({
    type: 'home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [submittingAddress, setSubmittingAddress] = useState(false);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Support ticket states
  const [tickets, setTickets] = useState([]);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'general_inquiry',
    priority: 'medium',
    description: ''
  });

  // Use notification context
  const { notifications, markAsRead, refreshNotifications, refreshNotificationsImmediate } = useNotifications();

  const navigate = useNavigate();

  // Use actual auth and product context
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, wishlistItems, removeFromWishlist, addToCart, getCartTotal } = useProductContext();

  // User data state with actual user info
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
    profileImage: ''
  });

  // Check authentication and load user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!isAuthenticated && !isLoggedIn && !currentUser && !token) {
      navigate('/login');
      return;
    }

    // Fetch user data from backend
    const fetchUserData = async () => {
      try {
        if (token) {
          const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUserData(prev => ({
              ...prev,
              name: userData.fullName || 'User',
              email: userData.email || '',
              phone: userData.phone || '',
              joinDate: `Member since ${new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
            }));

            // Update localStorage with fresh data
            localStorage.setItem('currentUser', JSON.stringify(userData));
          } else {
            // Fallback to localStorage if API fails
            if (user || currentUser) {
              const userData = user || JSON.parse(currentUser);
              setUserData(prev => ({
                ...prev,
                name: userData.fullName || userData.name || 'User',
                email: userData.email || '',
                phone: userData.phone || '',
                joinDate: userData.createdAt ? `Member since ${new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Member since January 2024'
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage
        if (user || currentUser) {
          const userData = user || JSON.parse(currentUser);
          setUserData(prev => ({
            ...prev,
            name: userData.fullName || userData.name || 'User',
            email: userData.email || '',
            phone: userData.phone || '',
            joinDate: userData.createdAt ? `Member since ${new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 'Member since January 2024'
          }));
        }
      }
    };

    // Fetch orders from the backend
    const fetchOrders = async () => {
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchOrders();
    fetchAddresses();
    fetchTickets();

  }, [isAuthenticated, user, navigate]);

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getOrderStatus = (order) => {
    const status = order.status || 'pending';
    
    switch (status) {
      case 'pending':
        return { status: 'Pending', color: 'text-gray-600 bg-gray-50' };
      case 'paid':
        return { status: 'Paid', color: 'text-yellow-600 bg-yellow-50' };
      case 'shipped':
        return { status: 'Shipped', color: 'text-blue-600 bg-blue-50' };
      case 'completed':
        return { status: 'Completed', color: 'text-green-600 bg-green-50' };
      case 'cancelled':
        return { status: 'Cancelled', color: 'text-red-600 bg-red-50' };
      default:
        return { status: 'Pending', color: 'text-gray-600 bg-gray-50' };
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'profile', label: 'Profile Information', icon: Edit3 },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const showNotificationPopup = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotificationPopup('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotificationPopup('New password must be at least 6 characters long', 'error');
      return;
    }

    setUpdatingPassword(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotificationPopup('Please log in again to update your password', 'error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotificationPopup('Password updated successfully!', 'success');
        setIsEditingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Refresh notifications to show security update notification
        refreshNotificationsImmediate();
      } else {
        showNotificationPopup(data.message || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showNotificationPopup('Failed to update password. Please try again.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Address management functions
  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/auth/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAddress(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotificationPopup('Please log in again', 'error');
        return;
      }

      const url = editingAddress 
        ? `https://shopeasy-backend-sagk.onrender.com/api/auth/addresses/${editingAddress._id}`
        : 'https://shopeasy-backend-sagk.onrender.com/api/auth/addresses';
      
      const method = editingAddress ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      const data = await response.json();

      if (response.ok) {
        showNotificationPopup(
          editingAddress ? 'Address updated successfully!' : 'Address added successfully!', 
          'success'
        );
        setShowAddressForm(false);
        setEditingAddress(null);
        resetAddressForm();
        fetchAddresses(); // Refresh addresses
        
        // Refresh notifications to show address update notification
        refreshNotificationsImmediate();
      } else {
        showNotificationPopup(data.message || 'Failed to save address', 'error');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      showNotificationPopup('Failed to save address. Please try again.', 'error');
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressData({
      type: address.type,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (address) => {
    setAddressToDelete(address);
    setShowDeleteModal(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/auth/addresses/${addressToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        showNotificationPopup('Address deleted successfully!', 'success');
        fetchAddresses(); // Refresh addresses
        setShowDeleteModal(false);
        setAddressToDelete(null);
      } else {
        showNotificationPopup(data.message || 'Failed to delete address', 'error');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      showNotificationPopup('Failed to delete address. Please try again.', 'error');
    }
  };

  const resetAddressForm = () => {
    setAddressData({
      type: 'home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
  };

  // Support ticket functions
  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/tickets/my-tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };



  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      showNotificationPopup('Please fill in all required fields', 'error');
      return;
    }

    setSubmittingTicket(true);
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || user._id,
          userEmail: user.email,
          userName: user.fullName || user.name,
          ...newTicket
        })
      });

      const data = await response.json();

      if (response.ok) {
        showNotificationPopup('Ticket created successfully!', 'success');
        setShowCreateTicketModal(false);
        setNewTicket({ subject: '', category: 'general_inquiry', priority: 'medium', description: '' });
        fetchTickets();
      } else {
        showNotificationPopup(data.message || 'Failed to create ticket', 'error');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      showNotificationPopup('Network error: Failed to create ticket', 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleViewTicket = async (ticket) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/tickets/${ticket._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedTicket(data);
        setShowTicketModal(true);
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      showNotificationPopup('Failed to load ticket details', 'error');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSubmittingTicket(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://shopeasy-backend-sagk.onrender.com/api/tickets/${selectedTicket._id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedTicket(prev => ({
          ...prev,
          messages: [...prev.messages, data.newMessage]
        }));
        setNewMessage('');
        fetchTickets(); // Refresh ticket list
      } else {
        showNotificationPopup(data.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      showNotificationPopup('Network error: Failed to send message', 'error');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotificationPopup('Please log in again to update your profile', 'error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const response = await fetch('https://shopeasy-backend-sagk.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: userData.name,
          email: userData.email,
          phone: userData.phone
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage with new user data
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUser = {
          ...currentUser,
          fullName: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Update local state
        setUserData(prev => ({
          ...prev,
          name: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone
        }));

        setIsEditing(false);
        showNotificationPopup('Profile updated successfully!', 'success');
        
        // Refresh notifications to show profile update notification
        refreshNotificationsImmediate();
      } else {
        showNotificationPopup(data.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotificationPopup('Failed to update profile. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.setItem('isLoggedIn', 'false');

    if (logout) {
      logout();
    }
    navigate('/login');
  };

  const calculateTotalSpent = () => {
    return `₹${orders.reduce((total, order) => {
      return total + parseFloat(order.totalPrice || 0);
    }, 0).toFixed(2)}`;
  };

  const getTotalOrderItems = () => {
    return orders.reduce((total, order) => {
      return total + (order.items ? order.items.length : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && localStorage.getItem('isLoggedIn') !== 'true') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please log in to view your profile</h2>
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {userData.name}!</h2>
        <p className="text-blue-100">Here's what's happening with your account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
              <p className="text-gray-600 text-sm">Total Orders</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{wishlistItems ? wishlistItems.length : 0}</p>
              <p className="text-gray-600 text-sm">Wishlist Items</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{cartItems ? cartItems.length : 0}</p>
              <p className="text-gray-600 text-sm">Cart Items</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{calculateTotalSpent()}</p>
              <p className="text-gray-600 text-sm">Total Spent</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders yet</p>
              <Link to="/" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order, index) => {
                const orderStatus = getOrderStatus(order);
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 rounded-full p-2">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">Order ID: {order._id.substring(0, 8)}...</p>
                        <p className="text-xs text-gray-500">
                          {formatOrderDate(order.createdAt)} • {order.items ? order.items.length : 0} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800 text-sm">₹{order.totalPrice}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${orderStatus.color}`}>
                        {orderStatus.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Orders</h2>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const orderStatus = getOrderStatus(order);
            return (
              <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Order ID: {order._id}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on {formatOrderDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-800">₹{order.totalPrice}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${orderStatus.color} mt-2`}>
                        {orderStatus.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {order.items && order.items.map((item, itemIndex) => {
                      // Handle both populated and non-populated product data
                      const product = item.productId || {};
                      const productName = product.name || item.name || 'Unknown Product';
                      const productCategory = product.category || item.category || 'Unknown Category';
                      const productImage = product.imageUrl || product.images?.[0] || null;
                      
                      return (
                        <div key={itemIndex} className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={productName}
                                className="w-full h-full object-cover rounded-xl"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <Package className="w-8 h-8 text-gray-400" style={{ display: productImage ? 'none' : 'flex' }} />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-800">{productName}</h4>
                            <p className="text-sm text-gray-500">
                              Category: {productCategory} • Quantity: {item.quantity || 1}
                            </p>
                            <p className="text-sm font-medium text-gray-800">₹{item.price}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Wishlist</h2>
        <p className="text-gray-600">Items you've saved for later</p>
      </div>

      {!wishlistItems || wishlistItems.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 mb-6">Save items you love to buy them later</p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-2">{item.category}</p>
                <p className="text-xl font-bold text-gray-800 mb-4">₹{item.price}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      addToCart(item);
                      removeFromWishlist(item.id);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">My Addresses</h2>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => {
            resetAddressForm();
            setEditingAddress(null);
            setShowAddressForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          Add New Address
        </button>
      </div>

      {/* Address Form */}
      {showAddressForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <form onSubmit={handleAddressSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                <select
                  value={addressData.type}
                  onChange={(e) => setAddressData({...addressData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({...addressData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={addressData.phone}
                onChange={(e) => setAddressData({...addressData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input
                type="text"
                value={addressData.addressLine1}
                onChange={(e) => setAddressData({...addressData, addressLine1: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="House/Flat No., Building Name, Street"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={addressData.addressLine2}
                onChange={(e) => setAddressData({...addressData, addressLine2: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Area, Landmark"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={addressData.city}
                  onChange={(e) => setAddressData({...addressData, city: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={addressData.state}
                  onChange={(e) => setAddressData({...addressData, state: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={addressData.pincode}
                  onChange={(e) => setAddressData({...addressData, pincode: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  pattern="[0-9]{6}"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={addressData.isDefault}
                onChange={(e) => setAddressData({...addressData, isDefault: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={submittingAddress}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingAddress ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddressForm(false);
                  setEditingAddress(null);
                  resetAddressForm();
                }}
                className="border border-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No addresses saved</h3>
            <p className="text-gray-600 mb-6">Add your first delivery address</p>
            <button
              onClick={() => {
                resetAddressForm();
                setEditingAddress(null);
                setShowAddressForm(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
            >
              Add Address
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                      address.type === 'home' ? 'bg-green-100 text-green-800' :
                      address.type === 'work' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                    </span>
                    {address.isDefault && (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Default
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{address.fullName}</h4>
                  <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                  <p className="text-gray-700">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  <p className="text-gray-700">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition"
                    title="Edit address"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address)}
                    className="p-2 text-gray-500 hover:text-red-600 transition"
                    title="Delete address"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderProfileInfo = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Information</h2>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Personal Details</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-800 py-2">{userData.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-800 py-2">{userData.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-800 py-2">{userData.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <p className="text-gray-800 py-2">{userData.joinDate}</p>
          </div>

          {isEditing && (
            <div className="flex space-x-4 pt-4">
              <button
                onClick={handleSaveProfile}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="border border-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password Update Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Password & Security</h3>
          <button
            onClick={() => setIsEditingPassword(!isEditingPassword)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditingPassword ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {isEditingPassword ? (
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                minLength="6"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={updatingPassword}
                className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingPassword(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="border border-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <p className="text-gray-800 py-2">••••••••••••</p>
            </div>
            <p className="text-sm text-gray-500">
              Keep your account secure by using a strong password and updating it regularly.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Notifications</h2>
        <p className="text-gray-600">Stay updated with your account activity</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications yet</h3>
          <p className="text-gray-600">We'll notify you about important updates here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                  notification.resolved ? 'opacity-50' : ''
                } ${notification.read ? 'bg-gray-50' : 'bg-white'}`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.actionUrl) {
                    navigate(notification.actionUrl);
                  }
                }}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                    notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-lg font-medium ${
                        notification.read ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {notification.title}
                        {notification.resolved && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Resolved
                          </span>
                        )}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`mt-1 ${
                      notification.read ? 'text-gray-500' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    {notification.actionUrl && !notification.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(notification.actionUrl);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2 font-medium"
                      >
                        View Details →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Help & Support</h2>
          <p className="text-gray-600">Get help with your account and technical issues</p>
        </div>
        <button
          onClick={() => setShowCreateTicketModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No support tickets yet</h3>
          <p className="text-gray-600 mb-6">Create your first support ticket to get help</p>
          <button
            onClick={() => setShowCreateTicketModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Create Ticket
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Support Tickets</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <div key={ticket._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{ticket.subject}</h4>
                      <span className="text-sm text-gray-500">#{ticket.ticketId}</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.status === 'waiting_for_user' ? 'bg-orange-100 text-orange-800' :
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        ticket.priority === 'low' ? 'bg-green-100 text-green-800' :
                        ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{ticket.description.substring(0, 150)}...</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Category: {ticket.category.replace('_', ' ')}</span>
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                      <span>Last Activity: {new Date(ticket.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Reply"
                    >
                      <FaComments className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'profile':
        return renderProfileInfo();
      case 'orders':
        return renderOrders();
      case 'wishlist':
        return renderWishlist();
      case 'addresses':
        return renderAddresses();
      case 'notifications':
        return renderNotifications();
      case 'help':
        return renderSupport();
      default:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">This section is under development.</h3>
            <p className="text-gray-600">We're working hard to bring you this feature soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-800">{userData.name}</h3>
                      <p className="text-xs text-gray-500">{userData.joinDate}</p>
                    </div>
                  </div>
                  
                  {/* Notification Bell */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      {notifications.filter(n => !n.read && !n.resolved).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {notifications.filter(n => !n.read && !n.resolved).length > 9 ? '9+' : notifications.filter(n => !n.read && !n.resolved).length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Admin Panel Button - Show only for admin users */}
                {user?.role === 'admin' && (
                  <div className="mt-4">
                    <Link
                      to="/admin"
                      className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">Admin Panel</span>
                    </Link>
                  </div>
                )}
              </div>

              <nav className="p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors mb-1 ${activeTab === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  );
                })}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition-colors mt-4 border-t border-gray-100"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${notificationType === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                {notificationType === 'success' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${notificationType === 'success' ? 'text-green-900' : 'text-red-900'
                  }`}>
                  {notificationType === 'success' ? 'Success!' : 'Error!'}
                </h3>
                <p className="text-sm text-gray-600">
                  {notificationType === 'success' ? 'Your changes have been saved' : 'Something went wrong'}
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              {notificationMessage}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowNotification(false)}
                className={`px-4 py-2 rounded-lg transition ${notificationType === 'success'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Address Confirmation Modal */}
      {showDeleteModal && addressToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FaTrash className="text-red-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Address</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                  addressToDelete.type === 'home' ? 'bg-green-100 text-green-800' :
                  addressToDelete.type === 'work' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {addressToDelete.type.charAt(0).toUpperCase() + addressToDelete.type.slice(1)}
                </span>
                {addressToDelete.isDefault && (
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Default
                  </span>
                )}
              </div>
              <p className="font-medium text-gray-800">{addressToDelete.fullName}</p>
              <p className="text-sm text-gray-600">{addressToDelete.phone}</p>
              <p className="text-sm text-gray-700">
                {addressToDelete.addressLine1}
                {addressToDelete.addressLine2 && `, ${addressToDelete.addressLine2}`}
              </p>
              <p className="text-sm text-gray-700">
                {addressToDelete.city}, {addressToDelete.state} - {addressToDelete.pincode}
              </p>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this address? This will permanently remove it from your saved addresses.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAddressToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAddress}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Support Ticket</h2>
              <button
                onClick={() => setShowCreateTicketModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general_inquiry">General Inquiry</option>
                    <option value="technical_issue">Technical Issue</option>
                    <option value="account_blocked">Account Blocked</option>
                    <option value="billing">Billing</option>
                    <option value="bug_report">Bug Report</option>
                    <option value="feature_request">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Please provide detailed information about your issue..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => setShowCreateTicketModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={submittingTicket}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submittingTicket ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                <p className="text-sm text-gray-500">Ticket #{selectedTicket.ticketId}</p>
              </div>
              <button
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedTicket(null);
                  setNewMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Info */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Status</span>
                  <p className="font-medium">{selectedTicket.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Priority</span>
                  <p className="font-medium">{selectedTicket.priority}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Category</span>
                  <p className="font-medium">{selectedTicket.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created</span>
                  <p className="font-medium">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedTicket.messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {msg.sender === 'user' ? (
                        <FaUser className="w-3 h-3" />
                      ) : (
                        <FaUserShield className="w-3 h-3" />
                      )}
                      <span className="text-xs font-medium">{msg.senderName}</span>
                      <span className="text-xs opacity-75">
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Section */}
            {selectedTicket.status !== 'closed' && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex space-x-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={submittingTicket || !newMessage.trim()}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPaperPlane className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;


