import express from "express";
import {
  getUserOrders,
  getSellerOrders,
  placeOrder,
} from "../controllers/order.controller.js";
import userMiddleware from "../middleware/userMiddleware.js";
import sellerMiddleware from "../middleware/sellerMiddleware.js";

const router = express.Router();

// User routes
router.get("/user", userMiddleware, getUserOrders); // Get all orders for logged-in user
router.post("/", userMiddleware, placeOrder); // Place a new order

// Seller routes
router.get("/seller", sellerMiddleware, getSellerOrders); // Get all orders for seller's products

export default router;
