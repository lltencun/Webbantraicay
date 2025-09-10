import { useContext, useState, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem"; // Nhớ import ProductItem

const LatestStore = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]);

  return (
    <div>
      <div className="my-10">
        <div className="text-center py-8 text-3xl">
          <Title text1="LATEST" text2="FRUITS" />
          <p className="w-3/4 mx-auto text-xs sm:text-sm md:text-base text-gray-600">
          Explore our latest collection of fresh plants. New additions are sure to please.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 ">
        {latestProducts.map((item) => (
          <div key={item._id} className="border border-gray-300 rounded-lg p-2">
            <ProductItem
              id={item._id}
              image={item.image[0]} // Truyền image là mảng hoặc chuỗi đều được
              name={item.name}
              price={item.price}
              available={item.available}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestStore;
