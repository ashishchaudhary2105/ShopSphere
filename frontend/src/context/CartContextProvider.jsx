import React, { useState, useEffect, useCallback } from "react";
import CartContext from "./CartContext";
import {
  getCartItems,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartAPI,
} from "../services/cartApi";

const CartContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCartItems();
      console.log(response.items);

      setCartItems(response.items);
      console.log(cartItems);

      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch cart items");
      console.error("Error fetching cart items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      const cartItem = {
        productId: product.id,
        quantity,
        price: product.price,
        name: product.name,
        image: product.image,
      };
      const updatedItem = await addItemToCart(cartItem);
      setCartItems((prev) => [...prev, updatedItem]);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to add item to cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      await removeCartItem(itemId);
      setCartItems((prev) => prev.filter((item) => item.product._id !== itemId));
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to remove item from cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

const updateCartItemQuantity = (productId, newQuantity) => {
  setCartItems(prevItems => 
    prevItems.map(item => 
      item.product._id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    )
  );
};

  const clearCart = async () => {
    try {
      setLoading(true);
      await clearCartAPI();
      setCartItems([]);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to clear cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCartItems();
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartSubtotal = () => getCartTotal();

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        refreshCart,
        getCartCount,
        getCartTotal,
        getCartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContextProvider;
