import Brand from "../models/Brand.js";
import Counter from "../models/Counter.js";

export const addBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Brand name is required",
      });
    }

    const existingBrand = await Brand.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (existingBrand) {
      return res.status(400).json({
        error: "Brand already exists",
      });
    }

    const counter = await Counter.findOneAndUpdate(
      { id: "Brand_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const newBrand = new Brand({
      brand_id: counter.seq,
      name: name.trim(),
      description: description ? description.trim() : "",
    });

    await newBrand.save();

    res.status(201).json({
      message: "Brand added successfully",
      category: {
        brand_id: newBrand.brand_id,
        name: newBrand.name,
        description: newBrand.description,
        isActive: newBrand.isActive,
      },
    });
  } catch (error) {
    console.error("Add brand_id error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBrandList = async (req, res) => {
  try {
    const brands = await Brand.find({}, { _id: 0, name: 1, brand_id: 1, description: 1, isActive: 1 }).sort({
      brand_id: 1,
    });

    res.status(200).json({
      message: "Brand list fetched successfully",
      count: brands.length,
      brands,
    });
  } catch (error) {
    console.error("Get brands list error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const searchBrands = async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword || !keyword.trim()) {
      return res.status(400).json({
        error: "Search keyword is required",
      });
    }

    const searchRegex = new RegExp(keyword.trim(), "i");

    const brands = await Brand.find(
      {
        $or: [{ name: searchRegex }, { description: searchRegex }],
      },
      { _id: 0, __v: 0 }
    ).sort({ brand_id: 1 });

    res.status(200).json({
      message: "Search brands fetched successfully",
      count: brands.length,
      brands,
    });
  } catch (error) {
    console.error("Search brands error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateBrands = async (req, res) => {
  try {
    const { brand_id, name, description } = req.body;

    if (!brand_id || isNaN(brand_id)) {
      return res.status(400).json({
        error: "Valid brand id is required",
      });
    }

    const brands = await Brand.findOne({ brand_id: Number(brand_id) });

    if (!brands) {
      return res.status(404).json({
        error: "brands not found",
      });
    }

    if (name) {
      const existingBrand = await Brand.findOne({
        name: { $regex: `^${name.trim()}$`, $options: "i" }
      });

      if (existingBrand) {
        return res.status(400).json({
          error: "Brand name already exists",
        });
      }

      brands.name = name.trim();
    }

    if (description) {
      brands.description = description.trim();
    }

    await brands.save();

    res.status(200).json({
      message: "Brand updated successfully",
      brand: {
        brand_id: brands.brand_id,
        name: brands.name,
        description: brands.description,
        isActive: brands.isActive,
      },
    });
  } catch (error) {
    console.error("Update brand error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const toggleBrandStatus = async (req, res) => {
  try {
    const { brand_id } = req.body;

    if (!brand_id || isNaN(brand_id)) {
      return res.status(400).json({
        error: "Valid brand_id is required",
      });
    };

    const brand = await Brand.findOne({ brand_id: Number(brand_id) });

    if (!brand) {
      return res.status(404).json({
        error: "Brand not found",
      });
    }

    brand.isActive = !brand.isActive;
    await brand.save();

    res.status(200).json({
      message: `Brand has been ${brand.isActive ? "activated" : "deactivated"} successfully`,
      brand: {
        brand: brand.brand_id,
        name: brand.name,
        isActive: brand.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle brand status error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { brand_id } = req.body;

    if (!brand_id || isNaN(brand_id)) {
      return res.status(400).json({
        error: "Valid brand_id is required",
      });
    }

    const brand = await Brand.findOneAndDelete({ brand_id: Number(brand_id) });

    if (!brand) {
      return res.status(404).json({
        error: "Brand not found",
      });
    }
    
    res.status(200).json({
      message: "Brand deleted successfully",
      brand: {
        brand_id: brand.brand_id,
        name: brand.name,
        description: brand.description,
        isActive: brand.isActive,
      },
    });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


