import React, { useContext, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaHeart,
  FaSearch,
  FaArrowDown,
  FaUser,
  FaBox,
  FaSignOutAlt,
  FaCog,
  FaBell,
} from "react-icons/fa";
import { useAuth } from "../pages/useAuth.jsx";
import { ProductContext } from "../Context/ProductContext";
import { useNotifications } from "../Context/NotificationContext";

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistItems, cartItems, clearAll } = useContext(ProductContext);
  const { notifications, getUnreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    clearAll(); // Clear cart and wishlist
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  const handleUserMenuClick = (path) => {
    setIsUserDropdownOpen(false);
    navigate(path);
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <nav className="bg-gray-800 p-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <h1 className="text-white text-lg md:text-xl lg:text-2xl font-bold cursor-pointer">
              <Link to="/">ShopEasy</Link>
            </h1>
          </div>

          {/* Search */}
          <form
            className="flex-1 mx-1 sm:mx-2 md:mx-4 lg:mx-6 xl:mx-8 relative min-w-0"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              name="Search"
              className="w-full bg-gray-700 rounded text-white p-1.5 sm:p-2 md:p-2.5 pr-6 sm:pr-8 md:pr-10 text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-0.5 sm:right-1 top-1/2 transform -translate-y-1/2 bg-amber-600 p-1 sm:p-1.5 md:p-2 rounded cursor-pointer"
            >
              <FaSearch className="text-white text-xs sm:text-sm" />
            </button>
          </form>

          {/* Buttons */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-0 flex-shrink-0">
            {!isAuthenticated && (
              <div>
                <Link to="/Login">
                  <button className="bg-blue-500 text-white px-1.5 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 rounded cursor-pointer text-xs sm:text-sm">
                    <span className="hidden sm:inline">Hello, </span>Sign In
                  </button>
                </Link>
              </div>
            )}

            {isAuthenticated && user && (
              <div className="relative dropdown-container">
                <div
                  className="text-white text-xs sm:text-sm px-1 sm:px-2 md:px-4 inline-flex items-center gap-1 cursor-pointer hover:bg-gray-700 rounded transition-colors duration-200 py-1 sm:py-1.5 md:py-2"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  <span className="hidden sm:inline">Hello, </span>
                  {user.fullName || "User"}
                  <FaArrowDown
                    className={`w-3 h-3 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </div>

                {isUserDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email || user.phone}
                      </p>
                    </div>

                    <button
                      onClick={() => handleUserMenuClick("/Profile")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaUser className="w-4 h-4" />
                      Your Profile
                    </button>

                    <button
                      onClick={() => handleUserMenuClick("/orders")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaBox className="w-4 h-4" />
                      Order History
                    </button>

                    <button
                      onClick={() => handleUserMenuClick("/settings")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaCog className="w-4 h-4" />
                      Settings
                    </button>

                    <div className="border-t border-gray-200 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FaSignOutAlt className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell - Between user name and wishlist */}
            {isAuthenticated && user && (
              <div className="relative dropdown-container">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-white p-1 sm:p-2 hover:bg-gray-700 rounded transition-colors duration-200 relative ml-0.5 sm:ml-1"
                >
                  <FaBell className={`w-4 h-4 ${getUnreadCount() > 0 ? 'animate-pulse' : ''}`} />
                  {getUnreadCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px] animate-bounce">
                      {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-semibold text-gray-800">Notifications</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead();
                              setShowNotifications(false);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {getUnreadCount() > 0 && (
                        <p className="text-xs text-gray-500">
                          {getUnreadCount()} unread notification{getUnreadCount() !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <FaBell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications</p>
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${notification.resolved ? 'opacity-50' : ''
                              } ${notification.read ? 'bg-gray-50' : 'bg-white'}`}
                            onClick={() => {
                              markAsRead(notification.id);
                              if (notification.actionUrl) {
                                navigate(notification.actionUrl);
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' :
                                  notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 5 && (
                      <div className="p-3 border-t border-gray-200 text-center">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setShowNotifications(false);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist */}
            <div className="relative">
              <Link to="/Wishlist">
                <button className="bg-blue-500 text-white px-1.5 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 rounded ml-0.5 sm:ml-1 md:ml-4 cursor-pointer flex items-center gap-1 text-xs sm:text-sm">
                  <FaHeart className="text-white text-xs sm:text-sm" />
                  <span className="hidden lg:inline">Wishlist</span>
                </button>
              </Link>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none h-4 min-w-[16px] px-[3px] rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </div>

            {/* Cart */}
            <div className="relative">
              <Link to="/Cart">
                <button className="bg-blue-500 text-white px-1.5 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 rounded ml-0.5 sm:ml-1 md:ml-4 cursor-pointer flex items-center gap-1 text-xs sm:text-sm">
                  <FaShoppingCart className="text-white text-xs sm:text-sm" />
                  <span className="hidden lg:inline">Cart</span>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] leading-none h-4 min-w-[16px] px-[3px] rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </div>
        </nav>

        <nav className="bg-gray-700">
          <div className="relative">
            <ul className="flex flex-nowrap space-x-4 p-3 overflow-x-auto text-sm md:space-x-6 md:p-4">
              <li
                className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap relative flex-shrink-0"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <FiChevronDown
                  className={`inline mr-1 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                    }`}
                />
                <span className="text-sm md:text-base">All</span>

                {isDropdownOpen && (
                  <div className="fixed top-[90px] md:top-[95px] lg:top-[110px] left-[10px] md:left-[20px] lg:left-[10px] w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/electronics"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Electronics
                    </Link>
                    <Link
                      to="/fashion"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Fashion
                    </Link>
                    <Link
                      to="/books"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Books
                    </Link>
                  </div>
                )}
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <span className="text-sm md:text-base">BestSellers</span>
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <span className="text-sm md:text-base">Today's Deal</span>
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <span className="text-sm md:text-base">New Releases</span>
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <Link to="/Mobile">
                  <span className="text-sm md:text-base">Mobiles</span>
                </Link>
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <Link to="/Laptops">
                  <span className="text-sm md:text-base">Laptops</span>
                </Link>
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <Link to="/Fashion">
                  <span className="text-sm md:text-base">Fashion</span>
                </Link>
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <Link to="/Books">
                  <span className="text-sm md:text-base">Books</span>
                </Link>
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <Link to="/Automotive">
                  <span className="text-sm md:text-base">Automotive</span>
                </Link>
              </li>
              <li className="text-white hover:text-blue-400 cursor-pointer whitespace-nowrap flex-shrink-0">
                <Link to="/Grocery">
                  <span className="text-sm md:text-base">Grocery</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="h-[72px] md:h-[88px] lg:h-[96px]" />
    </>
  );
}

export default Header;



