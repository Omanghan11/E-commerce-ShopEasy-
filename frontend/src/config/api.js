// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  
  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  
  // Admin
  ADMIN: `${API_BASE_URL}/api/admin`,
  
  // Cart
  CART: `${API_BASE_URL}/api/cart`,
  
  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  CHECKOUT: `${API_BASE_URL}/api/checkout`,
  
  // Wishlist
  WISHLIST: `${API_BASE_URL}/api/wishlist`,
  
  // Tickets
  TICKETS: `${API_BASE_URL}/api/tickets`,
  
  // Categories & Brands
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  BRANDS: `${API_BASE_URL}/api/brands`,
  
  // Discounts
  DISCOUNTS: `${API_BASE_URL}/api/discounts`,
};


