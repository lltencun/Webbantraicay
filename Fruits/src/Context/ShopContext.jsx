// eslint-disable-next-line no-unused-vars
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// Context to share shop data
// eslint-disable-next-line react-refresh/only-export-components
export const ShopContext = createContext();

function ShopContextProvider(props) {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setsearch] = useState("");
  const [showsearch, setshowsearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userData, setUserData] = useState(null);

  // Load cart data từ server khi user đăng nhập
  useEffect(() => {
    const loadCartFromServer = async () => {
      if (token) {
        try {
          const response = await axios.get(
            `${backendUrl}/api/cart/get`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          if (response.data.success && response.data.cart) {
            setCartItems(response.data.cart);
            localStorage.setItem("cartItems", JSON.stringify(response.data.cart));
          }
        } catch (error) {
          console.error("Load cart error:", error);
        }
      }
    };
    loadCartFromServer();
  }, [token, backendUrl]);

  const navigate = useNavigate();  const addToCart = async (itemId, size) => {
    try {
      if (size == null) {
        toast.error("Please select a size");
        return;
      }

      if (!token) {
        navigate("/login");
        return;
      }

      // Remove 'kg' if it exists, then add it back to ensure consistent format
      const sizeValue = size.toString().replace('kg', '');
      const formattedSize = `${sizeValue}kg`;
      
      console.log('Adding to cart:', { itemId, size: formattedSize });
      
      // Optimistic update
      const oldCart = JSON.parse(JSON.stringify(cartItems));
      
      // Update local cart first
      const newCart = { ...cartItems };
      if (!newCart[itemId]) {
        newCart[itemId] = {};
      }
      if (!newCart[itemId][formattedSize]) {
        newCart[itemId][formattedSize] = 0;
      }
      newCart[itemId][formattedSize] += 1;
      
      // Update UI immediately
      setCartItems(newCart);
      
      // Gửi request lên server để cập nhật cart
      const response = await axios.post(
        `${backendUrl}/api/cart/add`,
        { 
          itemId, 
          size: formattedSize // Gửi size đã format
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success && response.data.cart) {
        // Cập nhật cartItems với dữ liệu từ server để đảm bảo đồng bộ
        setCartItems(response.data.cart);
        localStorage.setItem("cartItems", JSON.stringify(response.data.cart));
        toast.success("Added to cart successfully");
      } else {
        // Rollback nếu server không thành công
        setCartItems(oldCart);
        localStorage.setItem("cartItems", JSON.stringify(oldCart));
        toast.error(response.data.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error.response?.data || error.message);
      
      // Rollback to previous state
      const oldCart = JSON.parse(localStorage.getItem("cartItems") || "{}");
      setCartItems(oldCart);
      
      // Show error to user
      toast.error(error.response?.data?.message || "Failed to add to cart. Please try again.");
    }
  };

  const getCartCount = () => {
        //let totalCount = 0;
    //for (const items in cartItems) {
      //for (const item in cartItems[items]) {
        //try {
          //if (cartItems[items][item] > 0) {
             //totalCount += cartItems[items][item];
           //}
          // // eslint-disable-next-line no-unused-vars
         //} catch (error) {
          /* empty */
         //}
       //}
     //}
     // //return totalCount;

    // Đếm số lượng sản phẩm khác nhau trong giỏ hàng
    return Object.keys(cartItems).length;
  };  
  const getProductsData = async () => {    
    try {
      // Lấy tất cả sản phẩm không bị discontinued
      const response = await axios.get(`${backendUrl}/api/product-detail/active`);
      if (response.data.success) {
        // Lấy thông tin chi tiết của các sản phẩm
        const productDetailsData = response.data.data;
        
        // Lấy danh sách product_id từ product details
        const productIds = [...new Set(productDetailsData.map(detail => detail.product_id))];
        
        // Lấy thông tin sản phẩm từ API products
        const productsResponse = await axios.get(`${backendUrl}/api/product/list`);
        if (productsResponse.data.success) {
          // Lọc chỉ lấy những sản phẩm có trong product details và không bị discontinued
          const activeProducts = productsResponse.data.products.filter(product => 
            productIds.includes(product._id)
          );
          setProducts(activeProducts);
        }
      } else {
        console.error('Error fetching products:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // Silent fail - don't show error toast to user
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);
  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
  }, []);
  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItems(cartData);
    // Save to localStorage
    localStorage.setItem("cartItems", JSON.stringify(cartData));
    
    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/update`,
          { itemId, size, quantity },
          { headers: { token } }
        );
      } catch (error) {
        console.error("Failed to update cart:", error);
        // Only show error if it's not a 400 status code
        if (error.response?.status !== 400) {
          toast.error(error.message);
        }
      }
    }
  };
  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.error("Failed to get user cart:", error);
      // Only show error if it's not a 400 status code
      if (error.response?.status !== 400) {
        toast.error(error.message);
      }
    }
  };
  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id == items);
      for (const size in cartItems[items]) {
        try {
          if (cartItems[items][size] > 0) {
            const quantity = cartItems[items][size];
            // Remove 'kg' before parsing to float
            const sizeValue = parseFloat(size.replace('kg', ''));
            totalAmount += itemInfo.price * sizeValue * quantity;
          }
        } catch (error) {
          console.error("Error calculating cart amount:", error);
        }
      }
    }
    return totalAmount;
  };

  const getUserData = async () => {
    try {
      if (!token) {
        setUserData(null);
        return null;
      }
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { token }
      });
      if (response.data.success) {
        const user = response.data.user;
        setUserData(user);
        // Đồng bộ giỏ hàng từ server
        if (user.cartData) {
          setCartItems(user.cartData);
          localStorage.setItem("cartItems", JSON.stringify(user.cartData));
        }
        return user;
      } else {
        console.error("Failed to get user data");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Only show error if it's not a 400 status code
      if (error.response?.status !== 400) {
        toast.error(error.response?.data?.message || "Failed to load user data");
      }
      return null;
    }
  };

  // Call getUserData when token changes
  useEffect(() => {
    if (token) {
      getUserData();
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setUserData(null);
    navigate("/login");
  };
  // Prepare order items with correct size formatting
  const prepareOrderItems = () => {
    let items = [];
    for (const productId in cartItems) {
      const product = products.find(p => p._id === productId);
      if (product) {
        for (const size in cartItems[productId]) {
          const quantity = cartItems[productId][size];
          if (quantity > 0) {
            // Remove 'kg' from size when sending to backend
            const cleanSize = size.replace('kg', '');
            items.push({
              product_id: productId,
              name: product.name,
              price: product.price,
              quantity: quantity,
              size: cleanSize, // Send size without 'kg'
              image: product.image
            });
          }
        }
      }
    }
    return items;
  };

  const placeOrder = async (orderData) => {
    try {
      if (!token) {
        toast.error("Please login to place order");
        navigate("/login");
        return;
      }

      const items = prepareOrderItems();
      if (items.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        { 
          ...orderData,
          items: items,
          amount: getCartAmount() + delivery_fee
        },
        { headers: { token } }
      );

      if (response.data.success) {
        // Clear cart after successful order
        setCartItems({});
        localStorage.removeItem("cartItems");
        toast.success("Order placed successfully!");
        navigate('/orders');
        return true;
      } else {
        toast.error(response.data.message || "Failed to place order");
        return false;
      }
    } catch (error) {
      console.error("Place order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
      return false;
    }
  };

  const removeFromCart = async (itemId, size) => {
    try {
      if (!token) {
        toast.error("Please login to remove items from cart");
        navigate("/login");
        return;
      }

      // Xóa khỏi local cart trước
      let cartData = JSON.parse(JSON.stringify(cartItems));
      if (cartData[itemId] && cartData[itemId][size]) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
      setCartItems(cartData);
      localStorage.setItem("cartItems", JSON.stringify(cartData));

      // Gửi request lên server để cập nhật cart
      const response = await axios.post(
        `${backendUrl}/api/cart/remove`,
        { 
          itemId, 
          size,
          userId: userData?._id 
        },
        { 
          headers: { token } 
        }
      );

      if (!response.data.success) {
        console.error(response.data.message);
        // Rollback nếu server failed
        const oldCart = JSON.parse(localStorage.getItem("cartItems") || "{}");
        setCartItems(oldCart);
      } else {
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Remove from cart error:", error);
      // Only show error if it's not a 400 status code
      if (error.response?.status !== 400) {
        toast.error(error.response?.data?.message || "Failed to remove from cart");
      }
      // Rollback nếu có lỗi
      const oldCart = JSON.parse(localStorage.getItem("cartItems") || "{}");
      setCartItems(oldCart);
    }
  };
  const loadCartFromServer = async () => {
    try {
      if (!token || !userData?._id) return;

      const response = await axios.get(
        `${backendUrl}/api/cart/${userData._id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        // Cập nhật cart từ server
        setCartItems(response.data.cart);
        // Cập nhật localStorage
        localStorage.setItem("cartItems", JSON.stringify(response.data.cart));
      }
    } catch (error) {
      console.error("Load cart error:", error);
    }
  };

  // Initialize state from localStorage and server
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    // Load cart từ server nếu user đã đăng nhập
    if (token && userData?._id) {
      loadCartFromServer();
    }
  }, [token, userData]);

  const contextValue = {
    products,
    currency,
    delivery_fee,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartAmount,
    getCartCount,
    token,
    setToken,
    navigate,
    backendUrl,
    logout,
    userData,
    getUserData,
    search,
    setsearch,
    showsearch,
    setshowsearch,
    placeOrder
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
}

export default ShopContextProvider;
