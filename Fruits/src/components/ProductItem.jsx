import { useContext } from "react";
import { ShopContext } from "../Context/ShopContext";
import { Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const ProductItem = ({ id, image, name, price, available }) => {
  const { currency } = useContext(ShopContext);

  // Kiểm tra nếu image là mảng, nếu không phải thì sử dụng trực tiếp
  const renderImages = Array.isArray(image) ? image : [image]; // Nếu image là mảng, sử dụng mảng, nếu không thì tạo mảng chỉ có một phần tử

  return (
    <div>
      <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
        <div className="overflow-hidden">
          {/* Lặp qua tất cả hình ảnh trong mảng để hiển thị */}
          {renderImages.map((imgSrc, index) => (
            <img
              key={index}
              className="hover:scale-110 transition ease-in-out"
              src={imgSrc}
              alt={`${name}-${index}`} // Sử dụng tên sản phẩm + chỉ số để làm alt
            />
          ))}
        </div>
        <p className="pt-3 pb-1 text-sm">{name}</p>
        <p className="text-sm font-medium">
          {currency}
          {price}
        </p>
        <p className={`text-sm ${available ? 'text-green-600' : 'text-red-600'}`}>
          {available ? 'In stock' : 'out of stock'}
        </p>
      </Link>
    </div>
  );
};

export default ProductItem;
