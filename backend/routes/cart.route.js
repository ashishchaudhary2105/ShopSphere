import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from "../controllers/cart.controller.js";
import userMiddleware from "../middleware/userMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(userMiddleware);

// GET /api/cart - Get user's cart
router.get("/", getCart);

// POST /api/cart - Add or update item in cart
router.post("/", addToCart);

// PUT /api/cart/:productId - Update specific cart item quantity
router.put("/:productId", updateCartItem);

// DELETE /api/cart/:productId - Remove specific item from cart
router.delete("/:productId", removeFromCart);

// DELETE /api/cart - Clear entire cart
router.delete("/", clearCart);

export default router;