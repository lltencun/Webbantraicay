import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  toggleUserLock,
  adminChangePassword,
  changeUserPassword,
  updateProfile,
  getUserProfile
} from "../controllers/userControlers.js";
import userModel from "../models/userModel.js";
import auth from "../middleware/auth.js";
import { adminAuth } from "../middleware/adminAuth.js";

const userRouter = express.Router();

// Đăng ký người dùng
userRouter.post("/register", registerUser);

// Đăng nhập người dùng
userRouter.post("/login", loginUser);

// Đăng nhập admin
userRouter.post("/admin", adminLogin);

// Lấy danh sách người dùng
userRouter.get("/list", async (req, res) => {
  try {
    const users = await userModel.find({}, { password: 0 }); // Không trả về mật khẩu
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
});

// Xóa người dùng
userRouter.post("/remove", async (req, res) => {
  const { id } = req.body;
  try {
    await userModel.findByIdAndDelete(id);
    res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
});

// Get user profile
userRouter.get("/profile", auth, getUserProfile);

// Update user profile
userRouter.put("/update-profile", auth, updateProfile);

// User password management
userRouter.post("/change-password", auth, changeUserPassword);

// Export route handler for testing
export { userRouter };

// Admin routes for user management
userRouter.post("/toggle-lock", adminAuth, toggleUserLock);
userRouter.post("/admin-change-password", adminAuth, adminChangePassword);

export default userRouter;