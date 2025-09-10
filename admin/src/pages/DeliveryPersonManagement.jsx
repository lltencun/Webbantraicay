// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import PropTypes from 'prop-types';

const DeliveryPersonManagement = ({ token }) => {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeliveryPersons = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/delivery`, {
        headers: { token }
      });
      setDeliveryPersons(response.data);
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
      toast.error('Không thể tải danh sách người giao hàng');
    } finally {
      setIsLoading(false);
    }
  }, [token]);
  const [newDeliveryPerson, setNewDeliveryPerson] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (token) {
      fetchDeliveryPersons();
    }
  }, [token, fetchDeliveryPersons]);



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDeliveryPerson(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!newDeliveryPerson.name.trim()) {
      toast.error('Vui lòng nhập tên người giao hàng');
      return false;
    }
    if (!phoneRegex.test(newDeliveryPerson.phone)) {
      toast.error('Số điện thoại không hợp lệ (phải có 10 chữ số)');
      return false;
    }
    if (!emailRegex.test(newDeliveryPerson.email)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    if (!newDeliveryPerson.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      if (editMode) {
        await axios.put(`${backendUrl}/api/delivery/${editId}`, newDeliveryPerson, {
          headers: { token }
        });
        toast.success('Cập nhật thông tin thành công');
      } else {
        await axios.post(`${backendUrl}/api/delivery`, newDeliveryPerson, {
          headers: { token }
        });
        toast.success('Thêm người giao hàng thành công');
      }
      setNewDeliveryPerson({
        name: '',
        phone: '',
        email: '',
        address: ''
      });
      setEditMode(false);
      setEditId(null);
      fetchDeliveryPersons();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (person) => {
    setNewDeliveryPerson({
      name: person.name,
      phone: person.phone,
      email: person.email,
      address: person.address
    });
    setEditMode(true);
    setEditId(person._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người giao hàng này không?')) {
      setIsLoading(true);
      try {
        await axios.delete(`${backendUrl}/api/delivery/${id}`, {
          headers: { token }
        });
        toast.success('Xóa người giao hàng thành công');
        fetchDeliveryPersons();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Có lỗi xảy ra');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full px-6">
      <h2 className="text-2xl font-semibold mb-4">Quản lý người giao hàng</h2>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tên
            </label>
            <input
              type="text"
              name="name"
              value={newDeliveryPerson.name}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              value={newDeliveryPerson.phone}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={newDeliveryPerson.email}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={newDeliveryPerson.address}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {editMode ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={() => {
                setNewDeliveryPerson({
                  name: '',
                  phone: '',
                  email: '',
                  address: ''
                });
                setEditMode(false);
                setEditId(null);
              }}
              className="ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {deliveryPersons.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có người giao hàng nào
          </div>
        ) : (
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Địa chỉ
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {deliveryPersons.map((person) => (
                <tr key={person._id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {person.name}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {person.phone}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {person.email}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {person.address}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button
                      onClick={() => handleEdit(person)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(person._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

DeliveryPersonManagement.propTypes = {
  token: PropTypes.string.isRequired
};

export default DeliveryPersonManagement;
