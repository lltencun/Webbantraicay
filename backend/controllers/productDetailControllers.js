import ProductDetail from '../models/productDetailModel.js';
import Order from '../models/orderModel.js';

// Check if product detail exists in any order
const checkProductDetailInOrders = async (detailId) => {
    try {
        // First get the product detail to get its product_id
        const detail = await ProductDetail.findById(detailId);
        if (!detail) return false;

        // Then check if this product_id exists in any order
        const orders = await Order.find({
            "items.product_id": detail.product_id.toString()
        });

        console.log('Found orders for product_id:', detail.product_id, orders.length);
        return orders.length > 0;
    } catch (error) {
        console.error('Error checking product in orders:', error);
        throw error;
    }
};

// Thêm chi tiết sản phẩm mới
export const addProductDetail = async (req, res) => {
    try {
        const newProductDetail = new ProductDetail(req.body);
        const savedProductDetail = await newProductDetail.save();
        res.status(201).json({
            success: true,
            data: savedProductDetail
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy chi tiết sản phẩm theo ID sản phẩm
export const getProductDetailByProductId = async (req, res) => {
    try {
        const productDetail = await ProductDetail.findOne({ product_id: req.params.product_id });
        if (!productDetail) {
            return res.status(404).json({
                success: false,
                message: 'Product detail not found'
            });
        }
        res.status(200).json({
            success: true,
            data: productDetail
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật chi tiết sản phẩm
export const updateProductDetail = async (req, res) => {
    try {
        const updatedProductDetail = await ProductDetail.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedProductDetail) {
            return res.status(404).json({
                success: false,
                message: 'Product detail not found'
            });
        }
        res.status(200).json({
            success: true,
            data: updatedProductDetail
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa chi tiết sản phẩm
export const deleteProductDetail = async (req, res) => {
    try {
        const productDetailId = req.params.id;
        
        // Check if product detail exists in any order
        const isInOrders = await checkProductDetailInOrders(productDetailId);
        if (isInOrders) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete this product detail because its product exists in one or more orders'
            });
        }

        const deletedProductDetail = await ProductDetail.findByIdAndDelete(productDetailId);
        if (!deletedProductDetail) {
            return res.status(404).json({
                success: false,
                message: 'Product detail not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Product detail deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product detail:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error deleting product detail'
        });
    }
};

// Lấy tất cả chi tiết sản phẩm
export const getAllProductDetails = async (req, res) => {
    try {
        const productDetails = await ProductDetail.find();
        res.status(200).json({
            success: true,
            data: productDetails
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy chi tiết sản phẩm cho frontend (không bao gồm discontinued products)
export const getActiveProductDetails = async (req, res) => {
    try {
        const productDetails = await ProductDetail.find({ 
            discontinued: { $ne: true }  // Chỉ lấy những sản phẩm không bị discontinued
        });
        res.status(200).json({
            success: true,
            data: productDetails
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
