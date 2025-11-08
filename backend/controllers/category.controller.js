import { Category } from "../models/category.model.js";

// ✅ Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent } = req.body;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const newCategory = new Category({
      name,
      description,
      parent: parent || null,
    });

    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: err.message,
    });
  }
};

// ✅ Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parent", "name");
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: err.message,
    });
  }
};

// ✅ Get single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate("parent", "name");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: err.message,
    });
  }
};

// ✅ Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, parent } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, parent: parent || null },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: err.message,
    });
  }
};

// ✅ Delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: err.message,
    });
  }
};

/**
 abhishek
 aryan 400
 umesh 300
 ganeshan 300
 sahil 300
 nikhil 300 
 himanshu 400
 sushant 300
 */