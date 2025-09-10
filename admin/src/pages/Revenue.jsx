// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

// eslint-disable-next-line react/prop-types
const Revenue = ({ token }) => {
  const [totalRevenue, setTotalRevenue] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [totalOrders, setTotalOrders] = useState(0);
  const [revenueByMonth, setRevenueByMonth] = useState({});
  const [completedOrders, setCompletedOrders] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filteredOrders, setFilteredOrders] = useState([]);
  // Fetch dữ liệu doanh thu từ API
  const fetchRevenueData = useCallback(async () => {
    try {
      const [revenueResponse, ordersResponse] = await Promise.all([
        axios.get(`${backendUrl}/api/revenue/summary`, {
          headers: { token },
        }),
        axios.post(`${backendUrl}/api/order/list`, {}, {
          headers: { token },
        })
      ]);

      if (revenueResponse.data.success) {
        setTotalRevenue(revenueResponse.data.totalRevenue);
        setTotalOrders(revenueResponse.data.totalOrders);
        setRevenueByMonth(revenueResponse.data.revenueByMonth);
      }

      if (ordersResponse.data.success) {
        // Lọc ra các đơn hàng đã hoàn thành và thanh toán
        const completed = ordersResponse.data.orders.filter(
          order => order.status === "completed" && order.payment === true
        );
        // Lọc ra các đơn hàng chưa hoàn thành
        
        setCompletedOrders(completed);
        setFilteredOrders(completed);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  }, [token]);

  // Lọc đơn hàng theo ngày
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      const filtered = completedOrders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
      });

      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(completedOrders);
    }
  }, [dateRange, completedOrders]);

  useEffect(() => {
    fetchRevenueData();
  }, [token, fetchRevenueData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Revenue Dashboard</h1>
      
      {/* Date Filter Section */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Filter by Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tổng doanh thu */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-500">
            {currency}
            {totalRevenue.toFixed(2)}
          </p>
        </div>

        {/* Tổng số đơn hàng */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Total Completed Orders</h3>
          <p className="text-2xl font-bold text-blue-500">{completedOrders.length}</p>
        </div>

        {/* Doanh thu theo tháng */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium mb-2">Revenue by Month</h3>
          <ul>
            {Object.keys(revenueByMonth).map((month, index) => (
              <li key={index} className="flex justify-between py-1">
                <span>{month}:</span>
                <span>
                  {currency}
                  {revenueByMonth[month].toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Completed Orders List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Completed Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order._id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.address.firstName} {order.address.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {currency}{order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.paymentMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Revenue;