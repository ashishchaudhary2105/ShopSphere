import mongoose from "mongoose";
import { addressSchema } from "./user.model.js";
const Schema = mongoose.Schema;

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    variant: {
      type: String,
    },
  },
  { _id: false }
);

const paymentResultSchema = new Schema(
  {
    paymentId: {
      type: String,
    },
    status: {
      type: String,
    },
    updateTime: {
      type: String,
    },
    emailAddress: {  // This is only for payment receipts, not for order identification
      type: String,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true  // Add index for better query performance
    },
    orderItems: [orderItemSchema],
    shippingAddress: addressSchema,
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "PayPal",
        "Stripe",
        "Credit Card",
        "Cash on Delivery",
        "Bank Transfer",
      ],
    },
    paymentResult: paymentResultSchema,
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Refunded",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Add virtual for formatted order number
orderSchema.virtual("orderNumber").get(function () {
  return `ORD-${this._id.toString().substring(0, 8).toUpperCase()}`;
});

// Add compound index to prevent potential duplicates
orderSchema.index({ user: 1, createdAt: 1 }, { unique: false });

export const Order = mongoose.model("Order", orderSchema);