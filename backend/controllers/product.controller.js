import { Product } from "../models/product.model.js";

// Create a Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, categories, price, stock, images } = req.body;
    const sellerId = req.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorize access",
      });
    }
    if (!name || !description || !price || !images) {
      return res.status(400).json({
        success: false,
        message: "Fill all the required details",
      });
    }

    const product = await Product.create({
      name,
      description,
      categories,
      price,
      stock,
      images,
      createdBy: sellerId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Some error occurred while creating the product",
    });
  }
};

// Get All Products (or optionally by seller)

export const getCreatedProducts = async (req, res) => {
  try {
    const sellerId = req.id;
    const products = await Product.find({ createdBy: sellerId });
    if (!products) {
      return res.status(401).json({
        success: false,
        message: "Unauthorize access",
      });
    }
    if (!products) {
      return res.status(400).json({
        success: false,
        message: "No products found",
      });
    }
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    if (!products) {
      return res.status(400).json({
        success: false,
        message: "Seller not found",
      });
    }
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    Object.assign(product, updates);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};
