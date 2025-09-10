import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { assets } from "../assets/assets";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }
      const response = await axios.post(
        backendUrl + '/api/order/userorders',
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  const handleViewDetails = (order) => {
    setSelectedOrder(selectedOrder?._id === order._id ? null : order);
  };

  return (
    <div className="border-t pt-16">
      <div className="text-2xl mb-8">
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>
      <div className="space-y-6">
        {orders.map((order, index) => (
          <div key={index} className="grid grid-col-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-gray-200 p-5 md:p-8 text-xs sm:text-sm text-gray-700 border-2 rounded-lg">
            <img className="w-12" src={assets.parcel_icon} alt="" />
            <div>
              <div>
                {order.items.map((item, index) => (
                  <p className="py-0.5" key={index}>
                    {item.name} x {item.quantity} <span>{item.size}</span>
                    {index !== order.items.length - 1 ? "," : ""}
                  </p>
                ))}
              </div>
              <p className="mt-3 mb-2 font-medium">{order.address.firstName + " " + order.address.lastName}</p>
              <div>
                <p>{order.address.street}</p>
                <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
              </div>
              <p>{order.address.phone}</p>
            </div>
            <div>
              <p className="text-sm sm:text-[15px]">Items: {order.items.length}</p>
              <p className="mt-3">Method: {order.paymentMethod}</p>
              <p>Payment: {order.payment ? 'Done' : 'Pending'}</p>
              <p>Date: {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <p className="text-sm sm:text-[15px] font-semibold">{currency}{order.amount}</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === "Pending" ? "bg-yellow-500" :
                  order.status === "Shipped" ? "bg-blue-500" :
                  order.status === "Delivered" ? "bg-green-500" :
                  "bg-red-500"
                }`}></div>
                <p className="text-sm md:text-base">{order.status}</p>
              </div>
              <button 
                onClick={() => handleViewDetails(order)}
                className="border px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                {selectedOrder?._id === order._id ? "Hide Details" : "View Details"}
              </button>
            </div>
            
            {/* Order Details Modal */}
            {selectedOrder?._id === order._id && (
              <div className="col-span-full bg-gray-50 p-6 rounded-md mt-4">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-medium">Chi tiết đơn hàng</h4>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Thông tin cơ bản */}
                <div className="mb-6">
                  <h5 className="font-medium mb-2">Thông tin đơn hàng</h5>
                  <div className="bg-white p-4 rounded-md space-y-2">
                    <p>Mã đơn: #{order._id.slice(-6)}</p>
                    <p>Ngày đặt: {new Date(order.date).toLocaleDateString('vi-VN')}</p>
                    <p>Phương thức thanh toán: {order.paymentMethod}</p>
                    <p>Trạng thái thanh toán: {order.payment ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
                    <p className="flex items-center gap-2">
                      Trạng thái: 
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipping' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'completed' ? 'Đã hoàn thành' :
                         order.status === 'shipping' ? 'Đang giao hàng' :
                         'Đang xử lý'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Sản phẩm */}
                <div className="mb-6">
                  <h5 className="font-medium mb-2">Sản phẩm</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 bg-white p-3 rounded-md">
                        <img src={item.image[0]} alt={item.name} className="w-20 h-20 object-cover rounded" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                          <p className="text-sm text-gray-600">Kích thước: {item.size}</p>
                          <p className="text-sm font-medium mt-1">{currency}{(item.price * parseFloat(item.size.replace('kg', '')) * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="font-medium">Tổng cộng:</span>
                    <span className="text-lg font-semibold">{currency}{order.amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Thông tin người giao hàng */}
                {order.deliveryPerson && (
                  <div className="mb-6">
                    <h5 className="font-medium mb-2">Thông tin người giao hàng</h5>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="mb-2">Tên người giao: {order.deliveryPerson.name}</p>
                      <p className="mb-2">Số điện thoại: {order.deliveryPerson.phone}</p>
                      <p>Email: {order.deliveryPerson.email}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
