import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext"; // Đảm bảo context này có giá trị đúng
import Title from "./Title";
import ProductItem from "./ProductItem";

export const BestSeller = () => {
  const { products } = useContext(ShopContext); // Lấy dữ liệu products từ context
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    // Lọc ra các sản phẩm có thuộc tính bestseller là true
    const bestProduct = products.filter((item) => item.bestseller);
    setBestSeller(bestProduct.slice(0, 5)); // Lấy 5 sản phẩm bestseller đầu tiên
  }, [products]); // Chạy lại khi products thay đổi

  if (bestSeller.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Currently, there are no bestselling products.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="my-10">
        <div className="text-center py-8 text-3xl">
          <Title text1="BEST" text2="SELLER" />
          <p className="w-3/4 mx-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore our latest collection of fresh plants. New additions are sure to please.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {bestSeller.map((item) => {
          console.log(item);
          return (
            <div key={item._id} className="border border-gray-300 rounded-lg p-2">
            <ProductItem
              id={item._id}
              image={item.image[0]}
              name={item.name}
              price={item.price}
              available={item.available}
            />
            </div>
          );
        })}
      </div>
    </div>
  );
};
