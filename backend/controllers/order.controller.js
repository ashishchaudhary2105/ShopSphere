import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

// Controller for users to view their past orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.id; // Assuming user ID is available from auth middleware

    const orders = await Order.find({ user: userId })
      .populate({
        path: "orderItems.product",
        select: "name images price", // Only populate necessary product fields
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// Controller for sellers to view orders containing their products
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.id; // Get from auth middleware
    console.log('Fetching orders for seller:', sellerId); // Debug log

    // 1. First find all products belonging to this seller
    const sellerProducts = await Product.find({ createdBy: sellerId }).select("_id");
    console.log('Found products:', sellerProducts.length); // Debug log

    // If no products found, return empty array but don't treat as error
    if (!sellerProducts.length) {
      console.log('No products found for seller:', sellerId); // Debug log
      return res.status(200).json({
        success: true,
        data: [],
        message: "No products found for this seller",
      });
    }

    // Convert to array of ObjectIds
    const productIds = sellerProducts.map(p => p._id);
    console.log('Product IDs to search:', productIds); // Debug log

    // 2. Find orders containing these products
    const orders = await Order.aggregate([
      { $unwind: "$orderItems" },
      { 
        $match: { 
          "orderItems.product": { 
            $in: productIds 
          } 
        } 
      },
      {
        $group: {
          _id: "$_id",
          user: { $first: "$user" },
          orderItems: { 
            $push: {
              $mergeObjects: [
                "$orderItems",
                { product: { $toObjectId: "$orderItems.product" } }
              ]
            }
          },
          shippingAddress: { $first: "$shippingAddress" },
          status: { $first: "$status" },
          paymentMethod: { $first: "$paymentMethod" },
          isPaid: { $first: "$isPaid" },
          paidAt: { $first: "$paidAt" },
          isDelivered: { $first: "$isDelivered" },
          deliveredAt: { $first: "$deliveredAt" },
          itemsPrice: { $first: "$itemsPrice" },
          taxPrice: { $first: "$taxPrice" },
          shippingPrice: { $first: "$shippingPrice" },
          totalPrice: { $first: "$totalPrice" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $project: {
          "user.password": 0,
          "user.__v": 0,
          "productDetails.seller": 0,
          "productDetails.__v": 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    console.log('Found orders:', orders.length); // Debug log

    res.status(200).json({
      success: true,
      data: orders,
      message: orders.length ? "Orders retrieved successfully" : "No orders found for seller's products"
    });

  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller orders",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Controller to place a new order
export const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  let transactionCompleted = false;

  try {
    await session.startTransaction();
    const userId = req.id; // From auth middleware
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice = 0,
      shippingPrice = 0,
    } = req.body;

    // Validate required fields
    if (
      !orderItems ||
      !orderItems.length ||
      !shippingAddress ||
      !paymentMethod ||
      itemsPrice === undefined
    ) {
      await session.abortTransaction();
      transactionCompleted = true;
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
        missingFields: {
          orderItems: !orderItems || !orderItems.length,
          shippingAddress: !shippingAddress,
          paymentMethod: !paymentMethod,
          itemsPrice: itemsPrice === undefined,
        },
      });
    }

    // Validate payment method against enum values
    const validPaymentMethods = [
      "PayPal",
      "Stripe",
      "Credit Card",
      "Cash on Delivery",
      "Bank Transfer",
    ];

    if (!validPaymentMethods.includes(paymentMethod)) {
      await session.abortTransaction();
      transactionCompleted = true;
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
        validPaymentMethods,
      });
    }

    // Calculate total price
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Validate and process order items
    const productIds = orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session
    );

    // Check if all products exist
    if (products.length !== orderItems.length) {
      const missingProducts = orderItems.filter(
        (item) =>
          !products.some((p) => p._id.toString() === item.product.toString())
      );
      await session.abortTransaction();
      transactionCompleted = true;
      return res.status(404).json({
        success: false,
        message: "Some products not found",
        missingProducts: missingProducts.map((item) => item.product),
      });
    }

    // Prepare order items and validate stock
    const updatedOrderItems = [];
    const stockUpdates = [];
    const outOfStockItems = [];

    for (const item of orderItems) {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString()
      );

      if (!product) continue;

      if (product.stock < item.quantity) {
        outOfStockItems.push({
          product: product._id,
          name: product.name,
          availableStock: product.stock,
          requestedQuantity: item.quantity,
        });
        continue;
      }

      updatedOrderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: item.price,
        image: product.images[0] || "",
        variant: item.variant || "",
      });

      stockUpdates.push({
        updateOne: {
          filter: { _id: product._id },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }

    // Check for out of stock items
    if (outOfStockItems.length > 0) {
      await session.abortTransaction();
      transactionCompleted = true;
      return res.status(400).json({
        success: false,
        message: "Some items are out of stock",
        outOfStockItems,
      });
    }

    // Create and save the order
    const order = new Order({
      user: userId,
      orderItems: updatedOrderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === "Cash on Delivery" ? false : true,
      paidAt: paymentMethod !== "Cash on Delivery" ? new Date() : undefined,
      isDelivered: false,
      status: "Pending",
    });

    // Execute all database operations
    if (stockUpdates.length > 0) {
      await Product.bulkWrite(stockUpdates, { session });
    }
    await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    transactionCompleted = true;

    // Get order details without a new session
    const populatedOrder = await Order.findById(order._id)
      .populate("orderItems.product", "name images price")
      .populate("user", "name email");

    // Clear user cart after successful order (outside transaction)
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: populatedOrder,
      orderNumber: `ORD-${order._id.toString().substring(0, 8).toUpperCase()}`,
    });
  } catch (error) {
    console.error("Order placement error:", error);

    // Only abort if transaction wasn't completed
    if (!transactionCompleted && session.inTransaction()) {
      await session.abortTransaction();
    }

    // Handle specific error types
    let statusCode = 500;
    let errorMessage = "Failed to place order";

    if (error.code === 11000) {
      statusCode = 400;
      errorMessage = "Order creation conflict - duplicate detected";
    } else if (error.name === "ValidationError") {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes("transaction")) {
      errorMessage = "Order processing error";
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    // End session regardless of success/failure
    if (session) {
      await session.endSession();
    }
  }
};
// Controller to update order to paid
export const updateOrderToPaid = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { paymentResult } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;
    order.status = "Processing"; // Update status to next step

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order payment status",
      error: error.message,
    });
  }
};

// Controller to update order to delivered
export const updateOrderToDelivered = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = "Delivered";

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order delivery status",
      error: error.message,
    });
  }
};
