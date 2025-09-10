import userModel from "../models/userModel.js";
import ProductDetail from "../models/productDetailModel.js";

//add product to user cart
const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.user.id; // Lấy userId từ token đã decode trong middleware auth

    console.log('AddToCart - Request data:', { userId, itemId, size });

    // Validate input
    if (!itemId || size == null) {
      console.log('AddToCart - Missing required fields');
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Remove 'kg' if it exists, then add it back to ensure consistent format
    const sizeValue = size.toString().replace("kg", "");
    const formattedSize = `${sizeValue}kg`;

    console.log('AddToCart - Formatted size:', formattedSize);

    // Find user first
    const userData = await userModel.findById(userId);
    if (!userData) {
      console.log('AddToCart - User not found:', userId);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check product availability and size
    const productDetail = await ProductDetail.findOne({ product_id: itemId });
    if (!productDetail) {
      console.log('AddToCart - Product detail not found:', itemId);
      return res.status(404).json({
        success: false,
        message: "Product detail not found",
      });
    }

    if (!productDetail.available) {
      console.log('AddToCart - Product not available:', itemId);
      return res.status(400).json({
        success: false,
        message: "This product is currently not available",
      });
    }

    // Validate size
    if (!productDetail.sizes.includes(formattedSize)) {
      console.log('AddToCart - Invalid size:', { productSizes: productDetail.sizes, requestedSize: formattedSize });
      return res.status(400).json({
        success: false,
        message: "This size is not available for this product",
      });
    }

    // Initialize cartData if it doesn't exist or is invalid
    let cartData = userData.cartData;
    if (!cartData || typeof cartData !== 'object') {
      console.log('AddToCart - Initializing empty cartData');
      cartData = {};
    }

    // Add to cart using formatted size
    if (cartData[itemId]) {
      if (cartData[itemId][formattedSize]) {
        cartData[itemId][formattedSize] += 1;
      } else {
        cartData[itemId][formattedSize] = 1;
      }
    } else {
      cartData[itemId] = {
        [formattedSize]: 1
      };
    }

    console.log('AddToCart - Updated cartData:', cartData);

    // Lưu cartData vào user và đánh dấu là đã thay đổi
    userData.cartData = cartData;
    // Đây là dòng quan trọng - nói cho Mongoose biết cartData đã thay đổi
    userData.markModified('cartData');
    
    const savedUser = await userData.save();
    console.log('AddToCart - After save - savedUser.cartData:', savedUser.cartData);
    
    // Verify save was successful
    if (!savedUser || !savedUser.cartData || Object.keys(savedUser.cartData).length === 0) {
      console.log('AddToCart - Failed to save cartData');
      return res.status(500).json({
        success: false,
        message: "Failed to save cart data"
      });
    }

    // Double check by fetching the user again
    const verifyUser = await userModel.findById(userId);
    console.log('AddToCart - Verify after save - fetched user cartData:', verifyUser.cartData);

    console.log('AddToCart - Successfully saved cartData');
    return res.status(200).json({
      success: true,
      message: "Added to cart successfully",
      cart: savedUser.cartData
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add to cart"
    });
  }
};

//update product to user cart
const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.user.id; // Lấy userId từ token

    // Validate input
    if (!itemId || !size || quantity == null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find user first
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove 'kg' if it exists, then add it back to ensure consistent format
    const sizeValue = size.toString().replace("kg", "");
    const formattedSize = `${sizeValue}kg`;

    // Initialize cartData if it doesn't exist
    let cartData = userData.cartData || {};

    console.log('UpdateCart - Current cartData:', cartData);

    // Update quantity or remove if quantity is 0
    if (quantity > 0) {
      if (!cartData[itemId]) {
        cartData[itemId] = {};
      }
      cartData[itemId][formattedSize] = quantity;
    } else {
      // Remove size if quantity is 0
      if (cartData[itemId] && cartData[itemId][formattedSize]) {
        delete cartData[itemId][formattedSize];
        // Remove product if no sizes left
        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    }

    console.log('UpdateCart - Updated cartData:', cartData);

    // Lưu cartData vào user
    userData.cartData = cartData;
    userData.markModified('cartData'); // Đánh dấu là đã thay đổi
    const savedUser = await userData.save();

    // Verify save was successful
    const verifyUser = await userModel.findById(userId);
    console.log('UpdateCart - Verify after save - fetched user cartData:', verifyUser.cartData);

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: cartData
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart"
    });
  }
};

//remove product from user cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.user.id; // Lấy userId từ token

    // Validate input
    if (!itemId || !size) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find user first
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove 'kg' if it exists, then add it back to ensure consistent format
    const sizeValue = size.toString().replace("kg", "");
    const formattedSize = `${sizeValue}kg`;

    // Initialize cartData if it doesn't exist
    let cartData = userData.cartData || {};

    console.log('RemoveFromCart - Current cartData:', cartData);

    // Remove item from cart
    if (cartData[itemId] && cartData[itemId][formattedSize]) {
      delete cartData[itemId][formattedSize];
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    }

    console.log('RemoveFromCart - Updated cartData:', cartData);

    // Lưu cartData vào user
    userData.cartData = cartData;
    userData.markModified('cartData'); // Đánh dấu là đã thay đổi
    const savedUser = await userData.save();

    // Verify save was successful
    const verifyUser = await userModel.findById(userId);
    console.log('RemoveFromCart - Verify after save - fetched user cartData:', verifyUser.cartData);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: cartData
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove from cart"
    });
  }
};

//get product to user cart
const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ token
    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      cart: userData.cartData || {}
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get cart"
    });
  }
};

export {
  addToCart,
  updateCart,
  removeFromCart,
  getUserCart
};
