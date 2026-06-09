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
    const brands = await Brand.find({}, { _id: 0, name: 1, brand_id: 1 }).sort({
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
