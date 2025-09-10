// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../App";

// eslint-disable-next-line react/prop-types
const CategoryManagement = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch danh sách danh mục từ API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/category/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setCategories(["All", ...response.data.categories]); // Thêm "All" để hiển thị tất cả sản phẩm
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories.");
    }
  };

  // Fetch danh sách sản phẩm từ API
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, {
        headers: { token },
      });
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products.");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Lọc sản phẩm theo danh mục
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar bộ lọc */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-medium mb-4">CATEGORIES</h3>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="category"
                    className="w-4 h-4 rounded border-gray-300"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                  />
                  <span className="text-gray-600">{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Product Management</h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center"
              >
                <img
                  src={product.image[0]}
                  alt={product.name}
                  className="w-20 h-20 object-cover mb-2"
                />
                <h3 className="font-medium text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600">${product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;