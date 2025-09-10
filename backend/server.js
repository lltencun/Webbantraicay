import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import revenueRouter from "./routes/revenueRouter.js"; // Import route doanh thu
import categoryRouter from "./routes/categoryRoute.js"; // Import categoryRouter
import originRouter from "./routes/originRoute.js";
import productDetailRouter from "./routes/productDetailRoute.js";
import productTypeRouter from "./routes/productTypeRoute.js";
import vnpayRouter from "./routes/vnpayRoute.js"; // Import route VNPAY
import deliveryPersonRouter from "./routes/deliveryPersonRoute.js"; // Import delivery person router

//thanhtrungminhnhat
//Eft2W6quO8efyV2n
//app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();
// middlewares

app.use(express.json());
app.use(cors());

// api endpoints

app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order",orderRouter);
app.use("/api/category", categoryRouter); // Sử dụng categoryRouter cho các API liên quan đến danh mục
app.use("/api/revenue", revenueRouter); // Kết nối route doanh thu
app.use("/api/origin", originRouter);
app.use("/api/product-detail", productDetailRouter);
app.use("/api/product-type", productTypeRouter);
app.use("/api/vnpay", vnpayRouter); // Sử dụng vnpayRouter cho các API liên quan đến VNPAY
app.use("/api/delivery", deliveryPersonRouter); // Add delivery person routes

app.get("/", (req, res) => {
  res.send("API Working");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const server = app.listen(port, () => {
  console.log("server started on PORT :" + port);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});
