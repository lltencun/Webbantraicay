import { useContext, useState, useEffect } from "react";
import { assets } from "../assets/products";
import CartTotal from "../components/CartTotal";
import Title from "../components/Title";
import { ShopContext } from "../Context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from '../config/config';

const PlaceOrder = () => {
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const {navigate, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, getUserData} = useContext(ShopContext);
  const [orderId, setOrderId] = useState(null);
  const [formData, setFormData] = useState({
    firstName:'',
    lastName:'',
    email:'',
    street:'',
    city:'',
    state:'',
    zipcode:'',
    country:'',
    phone:''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          const newFormData = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            zipcode: userData.address?.zipcode || '',
            country: userData.address?.country || ''
          };
          setFormData(newFormData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    // Chỉ load dữ liệu một lần khi component mount
    if (token) {
      loadUserData();
    }
  }, []);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }
  // Hàm xử lý thanh toán VNPAY
  const handleVNPayPayment = async (createdOrderId) => {
    try {
      console.log('Starting VNPAY payment with orderId:', createdOrderId);
      console.log('Cart amount:', getCartAmount());
      console.log('Delivery fee:', delivery_fee);
      
      if (!createdOrderId) {
        toast.error('Order not created');
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/vnpay/create-payment`,
        {
          orderId: createdOrderId,
          amount: getCartAmount() + delivery_fee,
          orderDescription: `Thanh toan don hang ${createdOrderId}`,
          language: 'vn'
        },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        window.location.href = response.data.paymentUrl;
      } else {
        toast.error('Failed to create payment URL');
      }
    } catch (error) {
      console.error('VNPAY payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    }
  };

  // Modify onSubmitHandler to handle both COD and VNPAY
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      // Validate form data first
      for (const [key, value] of Object.entries(formData)) {
        if (!value || value.trim() === '') {
          toast.error(`Please fill in your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return;
        }
      }

      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const productData = products.find(product => product._id === items);
            if (productData) {
              const size = item.toString().replace('kg', '');
              orderItems.push({
                product_id: items,
                name: productData.name,
                price: productData.price,
                quantity: cartItems[items][item],
                size: size,
                image: productData.image
              });
            }
          }
        }
      }

      console.log('Submitting order:', {
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
        address: formData,
        paymentMethod: paymentMethod
      });

      const orderResponse = await axios.post(
        `${backendUrl}/api/order/place`,
        {
          items: orderItems,
          amount: getCartAmount() + delivery_fee,
          address: formData,
          paymentMethod: paymentMethod
        },
        {
          headers: { token }
        }
      );

      if (orderResponse.data.success) {
        const newOrderId = orderResponse.data.order._id;
        setOrderId(newOrderId);

        // Clear cart immediately after successful order creation
        setCartItems({});
        localStorage.removeItem("cartItems");
        
        if (paymentMethod === 'VNPAY') {
          // If VNPAY, redirect to payment
          await handleVNPayPayment(newOrderId);
        } else {
          // If COD, just show success message and redirect
          toast.success("Order placed successfully!");
          navigate('/orders');
        }
      }
    } catch (error) {
      console.error('Place order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  }

    return (
    <div>
      <Title title={'Place Order'} />
      <div className="flex flex-col lg:flex-row gap-8 my-10">
        <div className="flex-[2]">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Delivery Information</h2>
            <form onSubmit={onSubmitHandler}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={onChangeHandler}
                  className="p-3 border rounded focus:outline-none focus:ring-2"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={onChangeHandler}
                  className="p-3 border rounded focus:outline-none focus:ring-2"
                />
                <div className="md:col-span-2">
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2"
                  />
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Street Address"
                    name="street"
                    value={formData.street}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2"
                  />
                </div>
                <input
                  type="text"
                  placeholder="City"
                  name="city"
                  value={formData.city}
                  onChange={onChangeHandler}
                  className="p-3 border rounded focus:outline-none focus:ring-2"
                />
                <input
                  type="text"
                  placeholder="State"
                  name="state"
                  value={formData.state}
                  onChange={onChangeHandler}
                  className="p-3 border rounded focus:outline-none focus:ring-2"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  name="zipcode"
                  value={formData.zipcode}
                  onChange={onChangeHandler}
                  className="p-3 border rounded focus:outline-none focus:ring-2"
                />
                <input
                  type="text"
                  placeholder="Country"
                  name="country"
                  value={formData.country}
                  onChange={onChangeHandler}
                  className="p-3 border rounded focus:outline-none focus:ring-2"
                />
                <div className="md:col-span-2">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={onChangeHandler}
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2"
                  />
                </div>
                <div className="md:col-span-2 mt-6">
                  <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span>Cash On Delivery</span>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="VNPAY"
                        checked={paymentMethod === 'VNPAY'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-radio h-5 w-5 text-blue-600"
                      />
                      <span className="flex items-center">
                        <span>VNPAY</span>
                        <img src={assets.vnpay_logo} alt="VNPAY" className="h-8 ml-2" />
                      </span>
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 mt-6">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>
                      {paymentMethod === 'VNPAY' ? 'Proceed to Payment' : 'Place Order'}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

              </div>
            </form>
          </div>
        </div>
        <div className="flex-1">
          <CartTotal />
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
