import express from "express";
import {
  addToCart,
  updateCart,
  removeFromCart,
  getUserCart,
} from "../controllers/cartControllers.js";
import authUser from "../middleware/auth.js";

const cartRouter = express.Router();

// Log middleware để kiểm tra request
const logMiddleware = (req, res, next) => {
  console.log('Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  next();
};

cartRouter.get("/get", logMiddleware, authUser, getUserCart);
cartRouter.post("/add", logMiddleware, authUser, addToCart);
cartRouter.post("/update", logMiddleware, authUser, updateCart);
cartRouter.post("/remove", logMiddleware, authUser, removeFromCart);

export default cartRouter;
