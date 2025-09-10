// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const ProductDetailManagement = ({ token }) => {
  const location = useLocation();
  const [productDetails, setProductDetails] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [color, setColor] = useState('');
  const [nutritionalInfo, setNutritionalInfo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [price, setPrice] = useState('');
  const [available, setAvailable] = useState(true);
  const [bestseller, setBestseller] = useState(false);
  const [discontinued, setDiscontinued] = useState(false);

  const fetchProductDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product-detail/all`, {
        headers: { token }
      });
      if (response.data.success) {
        setProductDetails(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch product details');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch product details');
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { token }
      });
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch products');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchProductDetails();
      fetchProducts();
    }
  }, [token, fetchProductDetails, fetchProducts]);

  // Xử lý selectedProductId từ navigation state
  useEffect(() => {
    if (location.state?.selectedProductId) {
      setSelectedProductId(location.state.selectedProductId);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        product_id: selectedProductId,
        color: color,
        nutritional_info: nutritionalInfo,
        sizes: sizes,
        price: Number(price),
        available: available,
        bestseller: bestseller,
        discontinued: discontinued
      };

      if (editingId) {
        await axios.put(backendUrl + `/api/product-detail/update/${editingId}`, data, {
          headers: { token },
        });
        toast.success('Product detail updated successfully');
      } else {
        await axios.post(backendUrl + '/api/product-detail/add', data, {
          headers: { token },
        });
        toast.success('Product detail added successfully');
      }

      // Reset form
      setSelectedProductId('');
      setColor('');
      setNutritionalInfo('');
      setSizes([]);
      setPrice('');
      setAvailable(true);
      setBestseller(false);
      setDiscontinued(false);
      setEditingId(null);
      fetchProductDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (detail) => {
    setSelectedProductId(detail.product_id);
    setColor(detail.color);
    setNutritionalInfo(detail.nutritional_info);
    setSizes(detail.sizes || []);
    setPrice(detail.price || '');
    setAvailable(detail.available);
    setBestseller(detail.bestseller);
    setDiscontinued(detail.discontinued || false);
    setEditingId(detail._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product detail?')) {
      try {
        const response = await axios.delete(backendUrl + `/api/product-detail/delete/${id}`, {
          headers: { token },
        });
        if (response.data.success) {
          toast.success('Product detail deleted successfully');
          fetchProductDetails();
        }
      } catch (error) {
        if (error.response?.data?.message === 'Cannot delete product detail - it exists in one or more orders') {
          toast.error('Cannot delete this product detail because it is part of existing orders');
        } else {
          toast.error('KHONG XÓA ĐƯỢC CHI TIẾT SẢN PHẨM NÀY - NÓ CÓ TRONG MỘT HOẶC NHIỀU ĐƠN HÀNG');
        }
      }
    }
  };

  const toggleSize = (size) => {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Product Detail Management</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Select Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-2">Nutritional Information</label>
            <textarea
              value={nutritionalInfo}
              onChange={(e) => setNutritionalInfo(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              rows="4"
              required
            />
          </div>

          {/* Price field */}
          <div>
            <label className="block mb-2">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {/* Sizes field */}
          <div>
            <label className="block mb-2">Sizes</label>
            <div className="flex gap-2">
              {["0.5kg", "1kg", "1.5kg", "2kg"].map((size) => (
                <div
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 cursor-pointer rounded ${
                    sizes.includes(size) ? "bg-blue-100 border-blue-500" : "bg-gray-100"
                  }`}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>

          {/* Available, Bestseller, and Discontinued checkboxes */}
          <div className="flex gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="available">Available</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="bestseller"
                checked={bestseller}
                onChange={(e) => setBestseller(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="bestseller">Bestseller</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="discontinued"
                checked={discontinued}
                onChange={(e) => setDiscontinued(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="discontinued">Discontinued</label>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {editingId ? 'Update Product Detail' : 'Add Product Detail'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b">Product Name</th>
              <th className="px-6 py-3 border-b">Color</th>
              <th className="px-6 py-3 border-b">Nutritional Info</th>
              <th className="px-6 py-3 border-b">Price</th>
              <th className="px-6 py-3 border-b">Sizes</th>
              <th className="px-6 py-3 border-b">Available</th>
              <th className="px-6 py-3 border-b">Bestseller</th>
              <th className="px-6 py-3 border-b">Discontinued</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {productDetails.map((detail) => (
              <tr key={detail._id}>
                <td className="px-6 py-4 border-b">
                  {products.find(p => p._id === detail.product_id)?.name || 'Unknown'}
                </td>
                <td className="px-6 py-4 border-b">{detail.color}</td>
                <td className="px-6 py-4 border-b">{detail.nutritional_info}</td>
                <td className="px-6 py-4 border-b">${detail.price}</td>
                <td className="px-6 py-4 border-b">{detail.sizes?.join(", ")}</td>
                <td className="px-6 py-4 border-b">
                  {detail.available ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 border-b">
                  {detail.bestseller ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 border-b">
                  {detail.discontinued ? 'Yes' : 'No'}
                </td>
                <td className="px-6 py-4 border-b">
                  <button
                    onClick={() => handleEdit(detail)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(detail._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductDetailManagement;
