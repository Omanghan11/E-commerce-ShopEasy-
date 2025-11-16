// src/Context/ProductContext.jsx
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { cartReducer, initialState } from "../pages/CartReducer";

export const ProductContext = createContext();

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProductContext must be used within a ProductProvider');
  return context;
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const API_URL = "${import.meta.env.VITE_API_URL || "https://shopeasy-backend-sagk.onrender.com"}/api";

  // -------- LOAD CART & WISHLIST FROM BACKEND --------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn("No authentication token found. Cannot fetch cart/wishlist.");
          return;
        }

        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        };

        const [cartRes, wishlistRes] = await Promise.all([
          fetch(`${API_URL}/cart`, { headers, credentials: "include" }),
          fetch(`${API_URL}/wishlist`, { headers, credentials: "include" })
        ]);

        if (cartRes.status === 401 || wishlistRes.status === 401) {
            console.error("❌ Unauthorized. Please log in.");
            return;
        }

        const cartData = await cartRes.json();
        const wishlistData = await wishlistRes.json();

        if (cartData?.items) {
          dispatch({ type: "SET_CART", payload: cartData.items });
        }
        if (wishlistData?.items) {
          dispatch({ type: "SET_WISHLIST", payload: wishlistData.items });
        }
      } catch (err) {
        console.error("❌ Failed to fetch cart/wishlist:", err);
      }
    };
    fetchData();
  }, []);

  // -------- CART ACTIONS --------
  const addToCart = async (product, quantity = 1) => {
    try {
      // Check stock availability before adding to cart
      if (!product.stock || product.stock <= 0) {
        console.warn("Cannot add out of stock product to cart");
        return;
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/cart/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ productId: product._id, quantity })
      });
      const data = await res.json();
      dispatch({ type: "SET_CART", payload: data.items || [] });
    } catch (err) {
      console.error("❌ Add to cart error:", err);
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/cart/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ productId, quantity })
      });
      const data = await res.json();
      dispatch({ type: "SET_CART", payload: data.items || [] });
    } catch (err) {
      console.error("❌ Update cart error:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/cart/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      dispatch({ type: "SET_CART", payload: data.items || [] });
    } catch (err) {
      console.error("❌ Remove from cart error:", err);
    }
  };

  // -------- WISHLIST ACTIONS (Optimistic Updates) --------
  const addToWishlist = async (product) => {
    // Optimistically update state
    if (!state.wishlistItems.some(item => item.productId._id === product._id)) {
      dispatch({ type: "SET_WISHLIST", payload: [...state.wishlistItems, { productId: product }] });
    }

    // Call backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/wishlist/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ productId: product._id })
      });
    } catch (err) {
      console.error("❌ Add to wishlist error:", err);
    }
  };

  const removeFromWishlist = async (productId) => {
    // Optimistically update state
    dispatch({ type: "SET_WISHLIST", payload: state.wishlistItems.filter(item => item.productId._id !== productId) });

    // Call backend
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/wishlist/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        credentials: "include",
        body: JSON.stringify({ productId })
      });
    } catch (err) {
      console.error("❌ Remove from wishlist error:", err);
    }
  };

  // -------- HELPERS --------
  const isInCart = (productId) => state.cartItems.some(item => item.productId === productId || item._id === productId);
  const isInWishlist = (productId) => state.wishlistItems.some(item => item.productId._id === productId || item._id === productId);

  const getCartTotal = () =>
    state.cartItems.reduce((total, item) => total + (item.productId?.price || 0) * (item.quantity || 1), 0);

  const getCartItemCount = () =>
    state.cartItems.reduce((count, item) => count + (item.quantity || 1), 0);

  return (
    <ProductContext.Provider
      value={{
        // State
        cartItems: state.cartItems,
        wishlistItems: state.wishlistItems,
        // Actions
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        addToWishlist,
        removeFromWishlist,
        // Selectors
        isInCart,
        isInWishlist,
        getCartTotal,
        getCartItemCount
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};


