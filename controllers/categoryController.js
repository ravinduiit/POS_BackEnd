import Category from "../models/Category.js";
import Counter from "../models/Counter.js";

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existingCategory) {
      return res.status(400).json({
        error: "Category already exists",
      });
    }

    const counter = await Counter.findOneAndUpdate(
      { id: "category_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newCategory = new Category({
      category_id: counter.seq,
      name: name.trim(),
      description: description ? description.trim() : "",
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: {
        category_id: newCategory.category_id,
        name: newCategory.name,
        description: newCategory.description,
        isActive: newCategory.isActive,
      },
    });
  } catch (error) {
    console.error("Add category error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getCategoryList = async (req, res) => {
  try {
    const categories = await Category.find({}, { _id: 0, name: 1, category_id: 1 }).sort({
      category_id: 1,
    });

    res.status(200).json({
      message: "Category list fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get category list error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getActiveCategoryList = async (req, res) => {
  try {
    const categories = await Category.find(
      { isActive: true },
      { _id: 0, __v: 0 }
    ).sort({ category_id: 1 });

    res.status(200).json({
      message: "Active category list fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get active category list error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSingleCategory = async (req, res) => {
  try {
    const { category_id } = req.body;

    if (!category_id || isNaN(category_id)) {
      return res.status(400).json({
        error: "Valid category_id is required",
      });
    }

    const category = await Category.findOne(
      { category_id: Number(category_id) },
      { _id: 0, __v: 0 }
    );

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category fetched successfully",
      category,
    });
  } catch (error) {
    console.error("Get single category error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { category_id, name, description } = req.body;

    if (!category_id || isNaN(category_id)) {
      return res.status(400).json({
        error: "Valid category_id is required",
      });
    }

    const category = await Category.findOne({ category_id: Number(category_id) });

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          error: "Category name cannot be empty",
        });
      }

      const existingCategory = await Category.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" },
        category_id: { $ne: Number(category_id) },
      });

      if (existingCategory) {
        return res.status(400).json({
          error: "Category name already exists",
        });
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category: {
        category_id: category.category_id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
      },
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { category_id } = req.body;

    if (!category_id || isNaN(category_id)) {
      return res.status(400).json({
        error: "Valid category_id is required",
      });
    }

    const category = await Category.findOne({ category_id: Number(category_id) });

    if (!category) {
      return res.status(404).json({
        error: "Category not found",
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      message: `Category has been ${category.isActive ? "activated" : "deactivated"} successfully`,
      category: {
        category_id: category.category_id,
        name: category.name,
        isActive: category.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle category status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const searchCategories = async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        error: "Search keyword is required",
      });
    }

    const searchRegex = new RegExp(keyword.trim(), "i");

    const categories = await Category.find(
      {
        $or: [{ name: searchRegex }, { description: searchRegex }],
      },
      { _id: 0, __v: 0 }
    ).sort({ category_id: 1 });

    res.status(200).json({
      message: "Search categories fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Search categories error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const filterCategories = async (req, res) => {
  try {
    const { isActive } = req.body;

    const filter = {};

    if (typeof isActive === "boolean") {
      filter.isActive = isActive;
    }

    const categories = await Category.find(filter, { _id: 0, __v: 0 }).sort({
      category_id: 1,
    });

    res.status(200).json({
      message: "Filtered categories fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Filter categories error:", error);
    res.status(500).json({ error: "Server error" });
  }
};