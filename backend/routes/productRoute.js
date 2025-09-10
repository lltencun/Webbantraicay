import express from "express";
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  updateProduct,
} from "../controllers/productControlers.js";
import upload from "../middleware/multer.js";
import { adminAuth } from "../middleware/adminAuth.js";

const productRouter = express.Router();
// Public route to get all products
productRouter.get("/", listProducts);
productRouter.get("/list", listProducts);

productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.get("/:id", singleProduct);
productRouter.post("/single", singleProduct); // Keeping for backward compatibility
productRouter.get("/admin/list", adminAuth, listProducts);
productRouter.post(
  "/update",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateProduct
);
export default productRouter;
