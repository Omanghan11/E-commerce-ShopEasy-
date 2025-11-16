const API_URL = "http://localhost:5000/api"; // change if backend is hosted

export const api = {
  auth: {
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
  },
  products: `${API_URL}/products`,
  cart: `${API_URL}/cart`,
  wishlist: `${API_URL}/wishlist`,
  orders: `${API_URL}/orders`,
};
