import express from "express";
import orderModel from "../models/orderModel.js";

const router = express.Router();

// API tính tổng doanh thu
router.get("/summary", async (req, res) => {
  try {
    console.log("Fetching revenue data...");
    // Lấy tất cả các đơn hàng đã hoàn thành và đã thanh toán
    const orders = await orderModel.find({ 
      status: "completed",
      payment: true 
    });
    
    console.log("Found orders:", orders);

    // Kiểm tra nếu không có đơn hàng
    if (!orders || orders.length === 0) {
      return res.json({
        success: true,
        totalRevenue: 0,
        totalOrders: 0,
        revenueByMonth: {},
      });
    }

    // Tính tổng doanh thu và số lượng đơn hàng
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let revenueByMonth = {};

    orders.forEach((order) => {
      totalRevenue += order.amount;

      // Tính doanh thu theo tháng
      const date = new Date(order.date); // Chuyển đổi timestamp thành Date
      const month = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`; // Format: YYYY-MM
      revenueByMonth[month] = (revenueByMonth[month] || 0) + order.amount;
    });

    // Trả về dữ liệu
    res.json({
      success: true,
      totalRevenue,
      totalOrders,
      revenueByMonth,
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    res.status(500).json({ success: false, message: "Failed to fetch revenue data." });
  }
});

// API kiểm tra trạng thái đơn hàng
router.get("/check-orders", async (req, res) => {
  try {
    const orders = await orderModel.find({});
    const orderStats = orders.reduce((acc, order) => {
      acc.total++;
      acc.statuses[order.status] = (acc.statuses[order.status] || 0) + 1;
      if (order.payment) acc.paid++;
      if (order.status === "completed" && order.payment) acc.completedAndPaid++;
      return acc;
    }, { total: 0, paid: 0, completedAndPaid: 0, statuses: {} });
    
    res.json({
      success: true,
      stats: orderStats
    });
  } catch (error) {
    console.error("Error checking orders:", error);
    res.status(500).json({ success: false, message: "Failed to check orders" });
  }
});

export default router;