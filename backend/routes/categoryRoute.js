import express from "express";
import productModel from "../models/productModel.js";

const router = express.Router();

// Lấy danh sách danh mục từ sản phẩm
router.get("/list", async (req, res) => {
  try {
    // Lấy danh sách danh mục duy nhất từ trường "category" trong bảng sản phẩm
    const categories = await productModel.distinct("category");
    res.json({ success: true, categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch categories." });
  }
});

export default router;