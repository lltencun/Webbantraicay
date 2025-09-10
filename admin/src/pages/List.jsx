// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";
import EditProductForm from "../components/EditProductForm";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Swal from "sweetalert2";
import { assets } from '../assets/assets'
// eslint-disable-next-line react/prop-types
const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    description: "",
    category: "",
    type: "",
    price: "",
    sizes: [],
    bestseller: false,
    available: false,
    origin_id: "",
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });
  
  const navigate = useNavigate();
  
  const fetchList = useCallback(async () => {
    try {
      console.log('Fetching products from:', `${backendUrl}/api/product/list`);
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { token },
        params: {
          populate: 'origin_id,product_type_id' // Request population of related fields
        }
      });
      console.log('Response:', response.data);
      if (response.data.success) {
        // Transform the data to ensure consistent access to origin and product type
        const transformedProducts = response.data.products.map(product => ({
          ...product,
          origin: product.origin_id,  // Ensure origin is accessible via both paths
          product_type: product.product_type_id  // Ensure product_type is accessible via both paths
        }));
        setList(transformedProducts);
        console.log('Products loaded:', transformedProducts);
      } else {
        console.error('Error response:', response.data);
        toast.error(response.data.message);
      }    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.message || "Failed to fetch product list.");
    }
  }, [token, backendUrl]);

  // Xóa sản phẩm
  const removeProduct = async (id) => {
    try {
      // Kiểm tra xem sản phẩm có đơn hàng không
      const checkOrderResponse = await axios.get(
        `${backendUrl}/api/order/check-product/${id}`,
        { headers: { token } }
      );
      
      if (checkOrderResponse.data.hasOrders) {
        Swal.fire(
          "Không thể xóa",
          "Sản phẩm này đang có đơn hàng và không thể xóa",
          "error"
        );
        return;
      }

      const result = await Swal.fire({
        title: "Bạn có chắc chắn?",
        text: "Hành động này không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Có, xóa nó!",
        cancelButtonText: "Hủy"
      });

      if (result.isConfirmed) {
        const response = await axios.post(
          `${backendUrl}/api/product/remove`,
          { id },
          { headers: { token } }
        );
        
        if (response.data.success) {
          await Swal.fire("Đã xóa!", response.data.message, "success");
          await fetchList(); // Refresh danh sách sản phẩm
        } else {
          await Swal.fire("Lỗi!", response.data.message, "error");
        }
      }
    } catch (error) {
      console.error(error);
      await Swal.fire(
        "Lỗi!", 
        error.response?.data?.message || "Không thể xóa sản phẩm.", 
        "error"
      );
    }
  };  // Cập nhật sản phẩm
  const updateProduct = useCallback(() => {
    if (!editingProduct?._id) {
      toast.error("No product selected for update");
      return;
    }

    const formDataToSend = new FormData();      
    formDataToSend.append("id", editingProduct._id);
    
    // Append all form fields only if they have values
    if (formData.productCode) formDataToSend.append("productCode", formData.productCode);
    if (formData.name) formDataToSend.append("name", formData.name);
    if (formData.description) formDataToSend.append("description", formData.description);
    if (formData.price) formDataToSend.append("price", formData.price);
    if (formData.product_type_id) formDataToSend.append("product_type_id", formData.product_type_id);
    if (formData.origin_id) formDataToSend.append("origin_id", formData.origin_id);
    
    // Boolean values need special handling
    formDataToSend.append("available", formData.available ? "true" : "false");
    formDataToSend.append("bestseller", formData.bestseller ? "true" : "false");
    
    // Handle arrays properly
    if (formData.sizes && formData.sizes.length > 0) {
      formDataToSend.append("sizes", JSON.stringify(formData.sizes));
    }

    // Handle existing images and new images
    if (formData.imageArray) {
      formData.imageArray.forEach((img, index) => {
        if (img) {
          if (img instanceof File) {
            // Nếu là file mới upload
            formDataToSend.append(`image${index + 1}`, img);
          } else if (typeof img === 'string') {
            // Nếu là URL hình ảnh hiện tại
            formDataToSend.append('existingImages', img);
          }
        }
      });
    }

    // Send update request
    axios.post(
      `${backendUrl}/api/product/update`,
      formDataToSend,
      { headers: { token } }
    )
    .then(response => {
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingProduct(null); // Đóng form chỉnh sửa
        fetchList();  // Refresh danh sách sản phẩm
      } else {
        toast.error(response.data.message);
      }
    })
    .catch(error => {
      console.error('Update product error:', error);
      toast.error(error.response?.data?.message || "Failed to update product. Please try again.");
    });
  }, [editingProduct, formData, token, backendUrl, fetchList]);

  const handleEditClick = (product) => {
    console.log("Editing product:", product); // For debugging
    setEditingProduct(product);
    setFormData({
      productCode: product.productCode || "",
      name: product.name || "",
      description: product.description || "",
      product_type_id: product.product_type_id?._id || product.product_type_id || "",
      price: product.price || 0,
      sizes: product.sizes || [],
      bestseller: Boolean(product.bestseller),
      available: Boolean(product.available),
      origin_id: product.origin_id?._id || product.origin_id || "",
      image1: null,
      image2: null,
      image3: null,
      image4: null
    });
  };
  const handleViewClick = (product) => {
    setViewingProduct(product);
  };

  // Load products when component mounts
  useEffect(() => {
    fetchList();
  }, [token, fetchList]); // Reload when token or fetchList changes

  return (
    <>
      {editingProduct ? (
        <EditProductForm
          formData={formData}
          setFormData={setFormData}
          updateProduct={updateProduct}
          cancelEdit={() => setEditingProduct(null)}
          editingProduct={editingProduct}
        />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold">All Products List</p>
            <button
              onClick={() => navigate("/add")} // Chuyển hướng sang trang Add.jsx
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
               <img src={assets.add_icon} alt="" /> 
            </button>
          </div>
          <div className="flex flex-col gap-2">            {/* List table header */}
            <div className="hidden md:grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
              <b>Image</b>
              <b>Name</b>
              <b>Product Code</b>
              <b>Category</b>
              <b>Price</b>
              <b className="text-center">Action</b>
            </div>
            {/* Product list */}
            {list.map((item, index) => (
              <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr] items-center gap-2 py-3 border text-sm"
                key={index}
              >
                <img className="w-12" src={item.image[0]} alt="" />
                <p>{item.name}</p>
                <p className="text-gray-600">{item.productCode || `PRD${item._id.toString().slice(-6)}`}</p>
                <p>{item.category}</p>
                <p>{currency}{item.price}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewClick(item)}
                    className="flex items-center justify-center w-10 h-10 text-white bg-green-500 rounded-full hover:bg-green-600 shadow-md"
                  >
                    <img className="w-5 h-5" src={assets.iconeye} alt="View" />
                  </button>
                  <button
                    onClick={() => handleEditClick(item)}
                    className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-full hover:bg-blue-600 shadow-md"
                  >
                    <img className="w-5 h-5" src={assets.icon_pen} alt="Edit" />
                  </button>
                  <button
                    onClick={() => removeProduct(item._id)}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    X
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal xem sản phẩm */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-bold text-center">View Product</h3>
            <div className="flex flex-col gap-4">
              {/* Hình ảnh sản phẩm */}
              <div>
                <p className="mb-2">Product Images</p>
                <div className="flex gap-2">
                  {viewingProduct.image.map((img, index) => (
                    <img key={index} className="w-20" src={img} alt={`Product ${index + 1}`} />
                  ))}
                </div>
              </div>              {/* Tên và mã sản phẩm */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 font-medium">Product Name</p>
                  <p className="p-2 border rounded">{viewingProduct.name}</p>
                </div>
                <div>
                  <p className="mb-2 font-medium">Product Code</p>
                  <p className="p-2 border rounded">{viewingProduct.productCode || `PRD${viewingProduct._id.toString().slice(-6)}`}</p>
                </div>
              </div>

              {/* Mô tả sản phẩm */}
              <div>
                <p className="mb-2 font-medium">Product Description</p>
                <p className="p-2 border rounded">{viewingProduct.description}</p>
              </div>              {/* Xuất xứ sản phẩm */}              <div className="mt-4">
                <div className="mb-3 text-gray-700 font-medium">Product Origin</div>
                <div className="p-2 border rounded space-y-2">
                  {console.log('Origin data:', viewingProduct?.origin_id)}
                  <p><span className="font-medium">Country: </span> 
                    {viewingProduct?.origin_id?.country || 
                     viewingProduct?.origin?.country || 
                     "N/A"}
                  </p>
                  <p><span className="font-medium">Farm Name: </span> 
                    {viewingProduct?.origin_id?.farm_name || 
                     viewingProduct?.origin?.farm_name || 
                     "N/A"}
                  </p>
                </div>
              </div>
              
              {/* Thông tin Product Type */}
              <div className="mt-4">
                <p className="mb-3 text-gray-700 font-medium">Product Type Information</p>
                <div className="p-2 border rounded space-y-2">
                  {console.log('Product Type data:', viewingProduct)}
                  <p><span className="font-medium">Code: </span> 
                    {viewingProduct?.product_type?.code || 
                     viewingProduct?.product_type_id?.code || 
                     'N/A'}
                  </p>
                  <p><span className="font-medium">Category: </span> 
                    {viewingProduct?.product_type?.category || 
                     viewingProduct?.product_type_id?.category || 
                     'N/A'}
                  </p>
                  <p><span className="font-medium">Type: </span> 
                    {viewingProduct?.product_type?.type || 
                     viewingProduct?.product_type_id?.type || 
                     'N/A'}
                  </p>
                </div>
              </div>

              {/* Giá sản phẩm */}
              <div>
                <p className="mb-2 font-medium">Product Price</p>
                <p className="p-2 border rounded">
                  {currency}
                  {viewingProduct.price}
                </p>
              </div>

              {/* Kích thước sản phẩm */}
              <div>
                <p className="mb-2 font-medium">Product Sizes</p>
                <div className="flex gap-2">
                  {viewingProduct.sizes.map((size, index) => (
                    <p key={index} className="px-3 py-1 bg-slate-200 rounded">
                      {size}
                    </p>
                  ))}
                </div>
              </div>

              {/* Bestseller và Available */}
              <div className="flex items-center gap-2">
                <p className="font-medium">Bestseller:</p>
                <p>{viewingProduct.bestseller ? "Yes" : "No"}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium">Available:</p>
                <p>{viewingProduct.available ? "Yes" : "No"}</p>
              </div>

              {/* Nút đóng */}
              <div className="flex justify-end">
                <button
                  onClick={() => setViewingProduct(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default List;