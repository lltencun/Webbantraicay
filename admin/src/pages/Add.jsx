// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const Add = ({token}) => {
  const navigate = useNavigate();
  // Product info
  const [image1,setImage1] = useState(false);
  const [image2,setImage2] = useState(false);
  const [image3,setImage3] = useState(false);  const [image4,setImage4] = useState(false);
  const [productCode, setProductCode] = useState("");
  const [name,setName] = useState("");
  const [description,setDescription] = useState("");
  const [originId, setOriginId] = useState("");
  const [origins, setOrigins] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [productTypeId, setProductTypeId] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [newProductId, setNewProductId] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch origins
        const originsResponse = await axios.get(backendUrl + "/api/origin/all");
        if (originsResponse.data.success) {
          setOrigins(originsResponse.data.data);
        }

        // Fetch product types
        const typesResponse = await axios.get(backendUrl + "/api/product-type/all");
        if (typesResponse.data.success) {
          setProductTypes(typesResponse.data.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, []);
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Product description is required");
      return;
    }
    if (!originId || !productTypeId) {
      toast.error("Please select both product origin and product type");
      return;
    }

    try {
      // Tạo FormData cho thông tin sản phẩm
      const productFormData = new FormData();
        // Thêm productCode nếu được cung cấp
      if (productCode) {
        productFormData.append("productCode", productCode);
      }
      
      // Find selected product type to get category and type
      const selectedType = productTypes.find(pt => pt._id === productTypeId);
      if (!selectedType) {
        throw new Error("Please select a valid product type");
      }
      productFormData.append("name", name);
      productFormData.append("description", description);
      productFormData.append("category", selectedType.category);
      productFormData.append("type", selectedType.type);
      productFormData.append("origin_id", originId);
      productFormData.append("product_type_id", productTypeId);
      
      if (image1) productFormData.append("image1", image1);
      if (image2) productFormData.append("image2", image2);
      if (image3) productFormData.append("image3", image3);
      if (image4) productFormData.append("image4", image4);

      // Thêm sản phẩm
      const productResponse = await axios.post(
        backendUrl + "/api/product/add", 
        productFormData,
        { headers: { token } }
      );

      if (productResponse.data.success) {        setNewProductId(productResponse.data.product._id);
        setShowSuccessAlert(true);
        toast.success("Product added successfully!");
      } else {
        toast.error(productResponse.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to add product");
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
        <h2 className="text-xl font-bold mb-4">Product Information</h2>
        
        {/* Upload Images */}
        <div>
          <p className="mb-2">Upload Image</p>
          <div className="flex gap-2">
            <label htmlFor="image1" className="cursor-pointer">
              <img className="w-20" src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="" />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id="image1" hidden />
            </label>
            <label htmlFor="image2" className="cursor-pointer">
              <img className="w-20" src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="" />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id="image2" hidden />
            </label>
            <label htmlFor="image3" className="cursor-pointer">
              <img className="w-20" src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="" />
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id="image3" hidden />
            </label>
            <label htmlFor="image4" className="cursor-pointer">
              <img className="w-20" src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="" />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id="image4" hidden />
            </label>
          </div>
        </div>        {/* Product Code & Name */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">Product Code</p>
          <input 
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter product code (optional)"
          />
        </div>

        <div className="w-full max-w-[500px]">
          <p className="mb-2">Product Name</p>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter product name"
            required
          />
        </div>

        <div className="w-full max-w-[500px]">
          <p className="mb-2">Product Description</p>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            rows="4"
            placeholder="Enter product description"
            required
          />
        </div>        {/* Product Type Selection */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">Product Type</p>
          <select 
            value={productTypeId}
            onChange={(e) => setProductTypeId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
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

        {/* Origin */}
        <div className="w-full max-w-[500px]">
          <p className="mb-2">Origin</p>
          <select 
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
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

        <button
          type="submit"
          className="mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Product          </button>
      </form>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">Product Added Successfully!</h3>
            <p className="mb-6">Would you like to add details for this product now?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowSuccessAlert(false);
                  // Reset form                  setProductCode('');
                  setName('');
                  setDescription('');
                  setImage1(false);
                  setImage2(false);
                  setImage3(false);
                  setImage4(false);
                  setOriginId('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
              >
                Add Later
              </button>
              <button
                onClick={() => navigate('/product-details', { 
                  state: { selectedProductId: newProductId }
                })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Details Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Add;
