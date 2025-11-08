import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";
// Get user's cart
export const getCart = async (req, res) => {
  const userId = req.id;
  try {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    res.status(200).json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart." });
  }
};

// Add or update item in cart
export const addToCart = async (req, res) => {
  const userId = req.id;
  const { productId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId))
    return res.status(400).json({ error: "Invalid productId" });

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    let itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // Update quantity
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      // Check if product exists
      const productExists = await Product.findById(productId);
      if (!productExists)
        return res.status(404).json({ error: "Product not found" });
      // Add new item
      cart.items.push({ product: productId, quantity: quantity || 1 });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to add to cart." });
  }
};

// Update item quantity in cart
export const updateCartItem = async (req, res) => {
  const userId = req.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart)
      return res.status(404).json({ error: "Cart does not exist" });
    console.log(cart.items[0].product.toString());
    console.log(productId);
    
    let item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    console.log(item);
    if (!item)
      return res.status(404).json({ error: "Item not in cart" });
    
    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to update cart item." });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  const userId = req.id;
  const { productId } = req.params;

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart)
      return res.status(404).json({ error: "Cart does not exist" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    cart.updatedAt = Date.now();
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from cart." });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  const userId = req.id;

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart)
      return res.status(404).json({ error: "Cart does not exist" });

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: "Failed to clear cart." });
  }
};
