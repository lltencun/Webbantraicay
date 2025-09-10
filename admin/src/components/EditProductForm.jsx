// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
// eslint-disable-next-line no-unused-vars
import { assets } from '../assets/assets';
const EditProductForm = ({ formData, setFormData, updateProduct, cancelEdit, editingProduct }) => {
  const [origins, setOrigins] = useState([]);

  useEffect(() => {
    const fetchOrigins = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/origin/all");
        if (response.data.success) {
          setOrigins(response.data.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch origins");
      }
    };
    fetchOrigins();
  }, []);
  const [productTypes, setProductTypes] = useState([]);
  
  // When editingProduct changes, update formData to display product data
  useEffect(() => {
    // Fetch product types
    const fetchProductTypes = async () => {
      try {
        const response = await axios.get(backendUrl + "/api/product-type/all");
        if (response.data.success) {
          setProductTypes(response.data.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch product types");
      }
    };
    fetchProductTypes();
  }, []);
  useEffect(() => {
    if (editingProduct) {
      console.log("Setting form data with editing product:", editingProduct);
      setFormData({
        productCode: editingProduct.productCode || "",
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        price: editingProduct.price || "",
        sizes: editingProduct.sizes || [],
        bestseller: Boolean(editingProduct.bestseller),
        available: Boolean(editingProduct.available),
        origin_id: editingProduct.origin_id?._id || editingProduct.origin_id || "",
        product_type_id: editingProduct.product_type_id?._id || editingProduct.product_type_id || "",
        imageArray: [...(editingProduct.image || [])]
      });
    }
  }, [editingProduct, setFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, num) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => {
        const newImageArray = [...(prev.imageArray || [])];
        newImageArray[num - 1] = file;
        return {
          ...prev,
          imageArray: newImageArray
        };
      });
    }
  };

  const handleDeleteImage = (num) => {
    setFormData(prev => {
      const newImageArray = [...(prev.imageArray || [])];
      newImageArray[num - 1] = null;
      return {
        ...prev,
        imageArray: newImageArray.filter(img => img != null)
      };
    });
  };

  const toggleCheckbox = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const prepareFormData = () => {
    const data = new FormData();
    
    // Thêm các trường thông tin cơ bản
    data.append('productCode', formData.productCode);
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('sizes', JSON.stringify(formData.sizes));
    data.append('bestseller', formData.bestseller);
    data.append('available', formData.available);
    data.append('origin_id', formData.origin_id);
    data.append('product_type_id', formData.product_type_id);

    // Xử lý hình ảnh
    if (formData.imageArray) {
      formData.imageArray.forEach((img, index) => {
        if (img) {
          if (img instanceof File) {
            // Gửi với tên trường mà backend mong đợi
            data.append(`image${index + 1}`, img);
          } else if (typeof img === 'string') {
            // Nếu là URL hình ảnh hiện tại, gửi dưới dạng mảng image
            data.append('existingImages', img);
          }
        }
      });
    }
    
    // Gửi id sản phẩm cần cập nhật
    data.append('id', editingProduct._id);

    return data;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Product description is required");
      return false;
    }
    if (!formData.origin_id) {
      toast.error("Please select product origin");
      return false;
    }
    if (!formData.product_type_id) {
      toast.error("Please select product type");
      return false;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Please enter a valid price");
      return false;
    }
    if (formData.sizes.length === 0) {
      toast.error("Please select at least one size");
      return false;
    }
    return true;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-[95%] max-w-[900px] max-h-[95vh] overflow-y-auto">
      <h3 className="mb-4 text-lg font-bold text-center">Edit Product</h3>
      <div className="flex flex-col gap-4">
        {/* Upload hình ảnh */}
        <div>
          <p className="mb-2 font-medium">Upload Images</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="relative">
                <label htmlFor={`image${num}`} className="cursor-pointer">
                  <img
                    className="w-24 h-24 object-cover border rounded"
                    src={
                      formData.imageArray && formData.imageArray[num - 1]
                        ? (formData.imageArray[num - 1] instanceof File 
                            ? URL.createObjectURL(formData.imageArray[num - 1])
                            : formData.imageArray[num - 1])
                        : assets.upload_area
                    }
                    alt={`Product Image ${num}`}
                  />
                  <input
                    type="file"
                    id={`image${num}`}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, num)}
                    hidden
                  />
                </label>
                {formData.imageArray && formData.imageArray[num - 1] && (
                  <button
                    onClick={() => handleDeleteImage(num)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>        {/* Mã sản phẩm */}
        <div>
          <label className="block mb-1 font-medium">Product Code</label>
          <input
            type="text"
            name="productCode"
            value={formData.productCode}
            onChange={handleInputChange}
            placeholder="Enter product code"
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Tên sản phẩm */}
        <div>
          <label className="block mb-1 font-medium">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Mô tả sản phẩm */}
        <div>
          <label className="block mb-1 font-medium">Product Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter product description"
            className="w-full p-3 border rounded"
          />
        </div>        {/* Product Type Selection */}
        <div>
          <label className="block mb-1 font-medium">Product Type</label>
          <select
            name="product_type_id"
            value={formData.product_type_id}
            onChange={handleInputChange}
            className="w-full p-3 border rounded"
            required
          >
            <option value="">Select Product Type</option>
            {productTypes.map((productType) => (
              <option key={productType._id} value={productType._id}>
                {productType.code} - {productType.category} ({productType.type})
              </option>
            ))}
          </select>
        </div>

        {/* Giá sản phẩm */}
        <div>
          <label className="block mb-1 font-medium">Product Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter product price"
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Kích thước sản phẩm */}
        <div>
          <label className="block mb-1 font-medium">Product Sizes</label>
          <div className="flex gap-2">
            {["0.5kg", "1kg", "1.5kg", "2kg"].map((size) => (
              <div
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-4 py-2 cursor-pointer rounded ${
                  formData.sizes.includes(size) ? "bg-pink-100" : "bg-slate-200"
                }`}
              >
                {size}
              </div>
            ))}
          </div>
        </div>

        {/* Origin Selection */}
        <div>
          <label className="block mb-1 font-medium">Product Origin</label>
          <select
            name="origin_id"
            value={formData.origin_id}
            onChange={handleInputChange}
            className="w-full p-3 border rounded"
            required
          >
            <option value="">Select Origin</option>
            {origins.map((origin) => (
              <option key={origin._id} value={origin._id}>
                {origin.country} - {origin.farm_name}
              </option>
            ))}
          </select>
        </div>

        {/* Bestseller và Available */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="bestseller"
            checked={formData.bestseller}
            onChange={() => toggleCheckbox("bestseller")}
          />
          <label htmlFor="bestseller" className="cursor-pointer">
            Add to Bestseller
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="available"
            checked={formData.available}
            onChange={() => toggleCheckbox("available")}
          />
          <label htmlFor="available" className="cursor-pointer">
            Add to Available
          </label>
        </div>

        {/* Nút lưu và hủy */}
        <div className="flex justify-end gap-4">          <button
            onClick={(e) => {
              e.preventDefault();
              if (validateForm()) {
                const formDataToSubmit = prepareFormData();
                updateProduct(formDataToSubmit);
              }
            }}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={cancelEdit}
            className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

EditProductForm.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  updateProduct: PropTypes.func.isRequired,
  cancelEdit: PropTypes.func.isRequired,
  editingProduct: PropTypes.object,
};

export default EditProductForm;