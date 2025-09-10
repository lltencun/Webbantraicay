// eslint-disable-next-line no-unused-vars
import React from 'react'
import { useEffect } from 'react'
import { useState, useCallback } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import PropTypes from 'prop-types'

const OrderDetailModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-semibold">Chi tiết đơn hàng #{order._id.slice(-6)}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Ngày đặt hàng:</p>
                <p>{new Date(order.date).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              <div>
                <p className="text-gray-600">Trạng thái:</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'shipping'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'processing' ? 'Đang xử lý'
                    : order.status === 'shipping' ? 'Đang giao hàng'
                    : order.status === 'completed' ? 'Đã hoàn thành'
                    : 'Đã hủy'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Thông tin khách hàng</h3>
            <div className="grid grid-cols-2 gap-4">
              <p><span className="text-gray-600">Họ tên:</span> {order.address.firstName} {order.address.lastName}</p>
              <p><span className="text-gray-600">Số điện thoại:</span> {order.address.phone}</p>
              <p className="col-span-2"><span className="text-gray-600">Địa chỉ:</span> {order.address.street}, {order.address.city}, {order.address.state}, {order.address.country}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Chi tiết sản phẩm</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center py-3 border-b">
                  <div className="flex-shrink-0 w-20 h-20 mr-4">
                    <img
                      src={Array.isArray(item.image) ? item.image[0] : item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Giá: {currency}{item.price.toLocaleString()}/sản phẩm</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <p className="font-semibold text-gray-800">{currency}{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 font-semibold">
                <p>Tổng cộng:</p>
                <p>{currency}{order.amount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {order.deliveryPerson && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Thông tin giao hàng</h3>
              <p><span className="text-gray-600">Người giao hàng:</span> {order.deliveryPerson.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

OrderDetailModal.propTypes = {
  order: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    address: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      street: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      country: PropTypes.string.isRequired,
    }).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired,
        image: PropTypes.string,
      })
    ).isRequired,
    amount: PropTypes.number.isRequired,
    deliveryPerson: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

// eslint-disable-next-line react/prop-types
const Orders = ({token}) => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [phoneSearch, setPhoneSearch] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [deliveryPersons, setDeliveryPersons] = useState([])
  const [orderMap, setOrderMap] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchDeliveryPersons = useCallback(async () => {
    try {
      const response = await axios.get(backendUrl + '/api/delivery', { headers: { token } });
      setDeliveryPersons(response.data);
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
      toast.error('Không thể tải danh sách người giao hàng');
    }
  }, [token]);

  const fetchAllOrders = useCallback(async () => {
    if (!token) return null;
    
    setIsLoading(true);
    try {
      const response = await axios.post(backendUrl +'/api/order/list',{},{headers:{token}})
      if (response.data.success) {
        console.log('Orders from backend:', response.data.orders);
        //setOrders(response.data.orders)
        //setFilteredOrders(response.data.orders)
        // Sắp xếp đơn hàng theo thời gian mới nhất
        const sortedOrders = [...response.data.orders].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
        
        // Tạo map người giao hàng cho từng đơn
        const newOrderMap = {};
        response.data.orders.forEach(order => {
          newOrderMap[order._id] = order.deliveryPerson || "";
        });
        setOrderMap(newOrderMap);

        // Log first order with delivery person for debugging
        const orderWithDelivery = response.data.orders.find(order => order.deliveryPerson);
        if (orderWithDelivery) {
          console.log('Example order with delivery person:', {
            orderId: orderWithDelivery._id,
            deliveryPerson: orderWithDelivery.deliveryPerson
          });
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllOrders();
    fetchDeliveryPersons();
  }, [fetchAllOrders, fetchDeliveryPersons]);

  useEffect(() => {
    // Luôn bắt đầu với danh sách đơn hàng đã được sắp xếp
    let result = [...orders]
    
    // Filter by phone
    if (phoneSearch) {
      result = result.filter(order => 
        order.address.phone.toLowerCase().includes(phoneSearch.toLowerCase())
      )
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999)

      result = result.filter(order => {
        const orderDate = new Date(order.date)
        return orderDate >= startDate && orderDate <= endDate
      })
    }
    
    // Đảm bảo kết quả lọc vẫn được sắp xếp theo thời gian mới nhất
    result = result.sort((a, b) => new Date(b.date) - new Date(a.date))
    
    setFilteredOrders(result)
  }, [phoneSearch, dateRange, orders])

  const handleAssignDelivery = async (orderId) => {
    const selectedPerson = orderMap[orderId];
    if (!selectedPerson) {
      toast.error('Vui lòng chọn người giao hàng');
      return;
    }

    try {
      await axios.post(backendUrl + '/api/delivery/assign-order', {
        orderId,
        deliveryPersonId: selectedPerson
      }, { headers: { token } });

      toast.success('Đã gán đơn hàng cho người giao hàng');
      fetchAllOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o._id === orderId);
      
      // Chỉ kiểm tra người giao hàng khi chuyển sang trạng thái completed
      if (newStatus === 'completed' && !order.deliveryPerson) {
        toast.error('Không thể hoàn thành đơn hàng chưa có người giao');
        return;
      }

      setIsLoading(true);
      await axios.post(backendUrl + '/api/order/status', {
        orderId: orderId,
        status: newStatus,
        deliveryPersonId: order.deliveryPerson
      }, { headers: { token } });

      toast.success('Đã cập nhật trạng thái đơn hàng');
      fetchAllOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryPersonChange = useCallback((orderId, personId) => {
    setOrderMap(prev => ({
      ...prev,
      [orderId]: personId
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h1 className='text-4xl font-semibold mb-5'>Orders</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm theo số điện thoại
            </label>
            <input
              type="text"
              value={phoneSearch}
              onChange={(e) => setPhoneSearch(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập số điện thoại..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không tìm thấy đơn hàng nào
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Mã đơn: #{order._id.slice(-6)}</h3>
                  <p className="text-gray-600">
                    {new Date(order.date).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'shipping'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status === 'processing' ? 'Đang xử lý'
                    : order.status === 'shipping' ? 'Đang giao hàng'
                    : order.status === 'completed' ? 'Đã hoàn thành'
                    : 'Đã hủy'}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Thông tin khách hàng:</h4>
                <p className="text-gray-700">Tên: {order.address.firstName} {order.address.lastName}</p>
                <p className="text-gray-700">SĐT: {order.address.phone}</p>
                <p className="text-gray-700">Địa chỉ: {order.address.street}, {order.address.city}</p>
                <p className="text-gray-700">{order.address.state}, {order.address.country}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2">Đơn hàng:</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-700">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">{currency}{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t flex justify-between font-semibold">
                  <span>Tổng cộng:</span>
                  <span>{currency}{order.amount.toLocaleString()}</span>
                </div>
              </div>

              {order.status === 'processing' && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2">
                    <select
                      value={orderMap[order._id] || ""}
                      onChange={(e) => handleDeliveryPersonChange(order._id, e.target.value)}
                      className="flex-1 border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Chọn người giao hàng</option>
                      {deliveryPersons.map((person) => (
                        <option key={person._id} value={person._id}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignDelivery(order._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Gán
                    </button>
                  </div>
                </div>
              )}

              {order.status === 'shipping' && (
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'completed')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    Hoàn thành
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              )}

              {order.deliveryPerson && (
                <div className="mt-4 pt-2 border-t">
                  <p className="font-medium text-gray-700">
                    Người giao hàng: {order.deliveryPerson?.name || 'Không xác định'}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsModalOpen(true);
                  }}
                  className="w-full bg-indigo-50 text-indigo-600 px-4 py-2 rounded hover:bg-indigo-100 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  Xem chi tiết đơn hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};

export default Orders;