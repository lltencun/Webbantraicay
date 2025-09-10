import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import ProductDetail from "../models/productDetailModel.js";
import deliveryPersonModel from "../models/deliveryPersonModel.js";

const placeOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { items, amount, address } = req.body;

        console.log('Order request received:', {
            userId,
            itemsCount: items?.length,
            amount,
            paymentMethod: req.body.paymentMethod,
            hasAddress: !!address
        });

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No items in order"
            });
        }

        let totalAmount = 0;

        // Validate all products
        console.log('Received order request:', { items, amount, address });
        
        for (const item of items) {
            try {
                console.log('Validating item:', item);
                
                const productDetail = await ProductDetail.findOne({ 
                    product_id: item.product_id
                });
                
                console.log('Found product detail:', productDetail);

                // Check if product exists
                if (!productDetail) {
                    console.log('Product not found:', item.name);
                    return res.status(404).json({
                        success: false,
                        message: `Product "${item.name}" not found`
                    });
                }

                // Check if product is available
                if (!productDetail.available) {
                    return res.status(400).json({
                        success: false,
                        message: `Sorry, product "${item.name}" is currently not available`
                    });
                }

                // Format size consistently
                const itemSize = item.size.toString() + "kg";

                // Check if requested size is valid
                if (!productDetail.sizes || !productDetail.sizes.includes(itemSize)) {
                    return res.status(400).json({
                        success: false,
                        message: `Size "${itemSize}" is not available for product "${item.name}"`
                    });
                }

                // Verify price matches product detail (prevent price manipulation)
                if (productDetail.price !== item.price) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid price for product "${item.name}"`
                    });
                }

                // Calculate item total (price * size * quantity)
                const sizeNumber = parseFloat(item.size);
                const itemTotal = item.price * sizeNumber * item.quantity;
                totalAmount += itemTotal;

                // Update item size to include 'kg'
                item.size = itemSize;

            } catch (err) {
                return res.status(500).json({
                    success: false,
                    message: `Error validating product "${item.name}": ${err.message}`
                });
            }
        }        // Verify total amount (including delivery fee)
        const DELIVERY_FEE = 10; // Make sure this matches the frontend delivery_fee
        const totalWithDelivery = totalAmount + DELIVERY_FEE;
        if (Math.abs(totalWithDelivery - amount) > 0.01) { // Using small delta for float comparison
            return res.status(400).json({
                success: false,
                message: `Order amount does not match item totals. Expected: ${totalWithDelivery}, Got: ${amount}`
            });
        }

        console.log('Creating order with data:', {
            userId,
            itemsCount: items.length,
            amount,
            paymentMethod: req.body.paymentMethod,
            address: Object.keys(address)
        });
        const { paymentMethod = 'COD' } = req.body;
        
        const orderData = {
            userId,
            items,
            amount, // Amount from frontend includes delivery fee
            address,
            paymentMethod,
            payment: false, // Will be updated after successful VNPAY payment
            date: Date.now()
        };

        // Create order
        const order = await orderModel.create({
            userId: userId,
            items: items,
            amount: amount,
            payment: false, // Will be updated after successful payment
            paymentMethod: req.body.paymentMethod || 'COD',
            address: address,
            date: Date.now(),
            status: "processing" // Using the correct enum value
        });

        // Clear cart after successful order
        await userModel.findByIdAndUpdate(userId, { cartData: {} });

        res.status(200).json({ 
            success: true, 
            message: "Order placed successfully",
            order: order
        });
    } catch (error) {
        console.error("Place order error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to place order"
        });
    }
};

// All order data for admin panel
const allOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).populate('deliveryPerson');
        
        // Log first order with delivery person for debugging
        const orderWithDelivery = orders.find(order => order.deliveryPerson);
        if (orderWithDelivery) {
          console.log('Example populated order:', {
            orderId: orderWithDelivery._id,
            deliveryPerson: orderWithDelivery.deliveryPerson
          });
        }

        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
// Update payment status for all orders
const updateAllPayments = async (req, res) => {
    try {
        // Cập nhật tất cả các đơn hàng, đặt `payment` thành `true`
        await orderModel.updateMany({}, { $set: { payment: true } });

        res.json({ success: true, message: "All payment statuses updated to true" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
// User order data for frontend
const userOrders = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ token thông qua middleware auth
        const orders = await orderModel.find({ userId }).populate('deliveryPerson');
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update order status from admin panel
const updateStatus = async (req, res) => {
    try {
      const { orderId, status, payment } = req.body;
  
      // Cập nhật trạng thái đơn hàng
      const updateData = { status };
      
      // Tự động đánh dấu payment=true khi đơn hàng completed 
      if (status === "completed" || payment === true) {
        updateData.payment = true;
      }
  
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId, 
        updateData,
        { new: true }  // Return updated document
      ).populate('deliveryPerson');  // Populate delivery person info
  
      res.json({ 
        success: true, 
        message: "Order status updated successfully",
        order: updatedOrder 
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.json({ success: false, message: error.message });
    }
  };

// Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.body;

        // Cập nhật trạng thái `payment` thành `true`
        await orderModel.findByIdAndUpdate(orderId, { payment: true });

        res.json({ success: true, message: "Payment status updated to true" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Thêm API endpoint để kiểm tra sản phẩm trong đơn hàng
export const checkProductInOrders = async (req, res) => {
  try {
    const { productId } = req.params;
    const orders = await orderModel.find({ "products.product_id": productId });
    
    res.json({
      success: true,
      hasOrders: orders.length > 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error checking product orders"
    });
  }
};

export { placeOrder, allOrders, userOrders, updateStatus, updatePaymentStatus,updateAllPayments };