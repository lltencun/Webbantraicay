import { useContext, useEffect, useState } from "react";
import { ShopContext } from "../Context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/products";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    updateQuantity,
    removeFromCart,
    navigate,
    delivery_fee,
  } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      let tempTotal = 0;

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const productData = products.find(
              (product) => product._id === items
            );
            if (productData) {
              const sizeMultiplier = parseFloat(item) || 1;
              const quantity = cartItems[items][item];
              const itemTotal = productData.price * sizeMultiplier * quantity;
              tempTotal += itemTotal;

              tempData.push({
                _id: items,
                size: item,
                quantity: quantity,
                itemTotal: itemTotal,
              });
            }
          }
        }
      }
      setCartData(tempData);
      setTotalPrice(tempTotal);
    }
  }, [cartItems, products]);

  useEffect(() => {
    const calculateSubtotal = () => {
      let total = 0;
      for (const itemId in cartItems) {
        const product = products.find((p) => p._id === itemId);
        if (product) {
          for (const size in cartItems[itemId]) {
            const quantity = cartItems[itemId][size];
            const weight = parseFloat(size);
            total += product.price * weight * quantity;
          }
        }
      }
      return total;
    };

    setSubtotal(calculateSubtotal());
  }, [cartItems, products]);

  const handleQuantityChange = (itemId, size, newQuantity) => {
    if (newQuantity === "" || newQuantity === "0") return;
    updateQuantity(itemId, size, Number(newQuantity));
  };

  const total = subtotal + delivery_fee;

  return (
    <div className="border-t pt-14">
      <div className="text-2xl mb-3">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div>
        {/* Header row */}
        <div className="py-4 border-t border-b text-gray-700 grid grid-cols-[100px_2fr_1fr_1fr_1fr_0.3fr] sm:grid-cols-[120px_2fr_1fr_1fr_1fr_0.3fr] items-center gap-4 font-medium">
          <div className="text-center"></div>
          <div className="font-semibold">Product Name</div>
          <div className="text-center font-semibold">Price/Unit</div>
          <div className="text-center font-semibold">Weight(kg)</div>
          <div className="text-center font-semibold">Quantity</div>
          <div className="text-right font-semibold">Total</div>
        </div>

        {cartData.map((item, index) => {
          const productData = products.find(
            (product) => product._id === item._id
          );

          if (!productData) {
            return <div key={index}>Product not found</div>;
          }

          const sizeMultiplier = parseFloat(item.size) || 1;
          const itemPrice = productData.price * sizeMultiplier;
          const totalItemPrice = itemPrice * item.quantity;

          return (
            <div
              key={index}
              className="py-4 border-t border-b text-gray-700 grid grid-cols-[100px_2fr_1fr_1fr_1fr_0.3fr] sm:grid-cols-[120px_2fr_1fr_1fr_1fr_0.3fr] items-center gap-4"
            >
              <div className="flex justify-center">
                <img className="w-16 sm:w-20" src={productData.image?.[0]} alt="" />
              </div>
              <div className="text-sm">
                <p className="sm:text-base font-medium">{productData.name}</p>
              </div>
              <div className="text-center">
                <p>
                  {currency}
                  {productData.price}
                </p>
              </div>
              <div className="text-center">
                <p>{item.size}</p>
              </div>
              <div className="flex justify-center">
                <input
                  className="border text-center w-[60px] outline-none"
                  type="number"
                  value={item.quantity}
                  min={1}
                  onChange={(e) =>
                    handleQuantityChange(item._id, item.size, e.target.value)
                  }
                />
              </div>
              <div className="text-right">
                <p>
                  {currency}
                  {totalItemPrice.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => removeFromCart(item._id, item.size)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end my-20">
        <div className="w-full sm:w-[450px]">
          <div className="w-full">
            <div className="text-2xl">
              <Title text1={"CART"} text2={"TOTAL"} />
            </div>
            <div className="flex flex-col gap-2 mt-2 text-sm">
              <div className="flex justify-between">
                <p>Subtotal</p>
                <p>
                  {currency}
                  {subtotal.toFixed(2)}
                </p>
              </div>
              <hr />
              <div className="flex justify-between">
                <p>Shipping</p>
                <p>
                  {currency}
                  {delivery_fee.toFixed(2)}
                </p>
              </div>
              <hr />
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>
                  {currency}
                  {total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-full text-end">
            <button
              onClick={() => navigate("/place-order")}
              className="bg-black text-white text-sm my-8 px-8 py-3"
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
