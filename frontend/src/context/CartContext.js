import { createContext, useContext } from "react";

const CartContext = createContext({
  cartItems: [],
  loading: false,
  error: null,
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItem: () => {},
  clearCart: () => {},
  getCartCount: () => 0,
  getCartTotal: () => 0,
  refreshCart: () => {},
});

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;