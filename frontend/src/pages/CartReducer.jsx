// src/Context/CartReducer.jsx
const initialState = {
  cartItems: [],
  wishlistItems: []
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cartItems: action.payload };

    case "SET_WISHLIST":
      return { ...state, wishlistItems: action.payload };

    default:
      return state;
  }
};

export { cartReducer, initialState };
