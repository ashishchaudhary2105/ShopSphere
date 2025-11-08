import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    images: { type: String, required: true },
    rating: { type: Number, default: 0 },
    createdBy: {type: mongoose.Schema.ObjectId, ref:"User"}
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
