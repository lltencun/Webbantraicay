import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../Context/ShopContext";
import { assets } from "../assets/products";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState('details');

  const fetchProductData = () => {
    if (!products || products.length === 0) return;

    const product = products.find((item) => item._id.toString() === productId);
    if (product) {
      setProductData(product);
      setImage(product?.image?.[0] || "defaultImage.jpg");
    } else {
      console.log("Product not found");
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]);

  const displayPrice = size ? productData.price * size : productData?.price;

  const handleAddToCart = () => {
    if (!size) {
      alert("Please select a kilo!");
      return;
    }
    addToCart(productData._id, size);
    setSuccessMessage("Product added to cart successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getProductColor = (name) => {
    const colorMap = {
      'Apple': 'Red, Yellow, Green',
      'Orange': 'Orange',
      'Banana': 'Yellow',
      'Dragon Fruit': 'Pink, White',
      'Grape': 'Purple, Green',
      'Kiwi': 'Brown, Green',
      'Mango': 'Yellow, Red',
      'Watermelon': 'Green, Red'
    };
    return colorMap[name] || 'Natural';
  };

  const getOriginInfo = (product) => {
    const origin = {
      country: product.type === "Imported" ? "Various International" : "Vietnam",
      region: product.type === "Imported" ? "International Partner Regions" : "Local Production Areas",
      farmName: product.type === "Imported" ? "Certified Partner Farms" : "FreshFruit Partner Farms",
      cultivation: product.category === "Organic" ? "Organic Farming" : "Traditional Methods"
    };

    // Specific origin info for popular fruits
    if (product.name === "Dragon Fruit") {
      origin.region = "Bình Thuận Province";
      origin.farmName = "Dragon Farm Co-op";
    } else if (product.name === "Mango") {
      origin.region = "Đồng Tháp Province";
      origin.farmName = "Mango Valley Farm";
    }

    return origin;
  };

  if (!productData) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* Image gallery section */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image?.map((item, index) => (
              <img
                src={item}
                key={index}
                onClick={() => setImage(item)}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt={`${productData.name}-${index + 1}`}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt={productData.name} />
          </div>
        </div>

        {/* Product info section */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3.5" />
            <img src={assets.star_icon} alt="" className="w-3.5" />
            <img src={assets.star_icon} alt="" className="w-3.5" />
            <img src={assets.star_icon} alt="" className="w-3.5" />
            <img src={assets.star_dull_icon} alt="" className="w-3.5" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {displayPrice?.toFixed(2)}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">{productData.description}</p>

          <div className="flex flex-col gap-4 my-8">
            <p>SELECT KILOGRAM</p>
            <div className="flex gap-2">
              {productData.sizes?.map((item, index) => (
                <button
                  onClick={() => setSize(parseFloat(item))}
                  className={`border py-2 px-4 transition-all duration-200 ${
                    parseFloat(item) === size 
                      ? "bg-black text-white border-black" 
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
          {successMessage && (
            <div className="mt-4 text-green-500 text-sm">{successMessage}</div>
          )}

          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% fresh fruit.</p>
            <p>Cash on delivery available on this product.</p>
            <p>Easy return and exchange policy within 2 days</p>
          </div>
        </div>
      </div>

      {/* Product details and reviews section */}
      <div className='mt-20'>
        <div className='flex border-b'>
          <button 
            onClick={() => setActiveTab('details')}
            className={`px-5 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'details' ? 'border-black' : 'border-transparent text-gray-500'
            }`}
          >
            Product Details
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'reviews' ? 'border-black' : 'border-transparent text-gray-500'
            }`}
          >
            Reviews (122)
          </button>
        </div>

        {activeTab === 'details' ? (
          <>
            {/* Product Description */}
            <div className='border-b py-6'>
              <h3 className='font-medium mb-4'>Description</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                {productData.description}
              </p>
            </div>

            {/* Product Specifications */}
            <div className='py-6'>
              <h3 className='font-medium mb-4'>Product Specifications</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Color & Nutritional Info */}
                <div className='space-y-4'>
                  <div>
                    <h4 className='text-sm font-medium mb-2'>Color</h4>
                    <p className='text-sm text-gray-600'>{getProductColor(productData.name)}</p>
                  </div>
                  <div>
                    <h4 className='text-sm font-medium mb-2'>Nutritional Information</h4>
                    <ul className='text-sm text-gray-600 space-y-1'>
                      <li>• Rich in essential vitamins and minerals</li>
                      <li>• High in dietary fiber</li>
                      <li>• Natural antioxidants</li>
                      <li>• Low in calories</li>
                      <li>• No added preservatives</li>
                    </ul>
                  </div>
                </div>

                {/* Origin Information */}
                <div className='space-y-4'>
                  <div>
                    <h4 className='text-sm font-medium mb-2'>Origin Details</h4>
                    <div className='text-sm text-gray-600 grid grid-cols-2 gap-y-2'>
                      {Object.entries(getOriginInfo(productData)).map(([key, value]) => (
                        <React.Fragment key={key}>
                          <div className="capitalize">{key}:</div>
                          <div>{value}</div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Assurance */}
            <div className='border-t py-6'>
              <h3 className='font-medium mb-4'>Quality Assurance</h3>
              <div className='text-sm text-gray-600 space-y-3'>
                <div className='flex items-start gap-2'>
                  <svg className='w-5 h-5 text-green-500 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                  </svg>
                  <p>All fruits undergo strict quality control before shipping</p>
                </div>
                <div className='flex items-start gap-2'>
                  <svg className='w-5 h-5 text-green-500 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                  </svg>
                  <p>Freshness guaranteed at delivery</p>
                </div>
                <div className='flex items-start gap-2'>
                  <svg className='w-5 h-5 text-green-500 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                  </svg>
                  <p>Easy return and exchange policy within 2 days</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className='py-6'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='flex items-center gap-1'>
                <img src={assets.star_icon} alt="" className="w-4" />
                <img src={assets.star_icon} alt="" className="w-4" />
                <img src={assets.star_icon} alt="" className="w-4" />
                <img src={assets.star_icon} alt="" className="w-4" />
                <img src={assets.star_dull_icon} alt="" className="w-4" />
              </div>
              <p className='text-sm text-gray-500'>Based on 122 reviews</p>
            </div>
            <p className='text-sm text-gray-500'>Reviews coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
