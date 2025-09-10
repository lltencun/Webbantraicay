import ProductType from '../models/productTypeModel.js';

// Thêm loại sản phẩm mới
export const addProductType = async (req, res) => {
    try {
        const { category, type, code, description } = req.body;

        // Kiểm tra xem code đã tồn tại chưa
        const existingType = await ProductType.findOne({ code });
        if (existingType) {
            return res.status(400).json({
                success: false,
                message: 'Product type code already exists'
            });
        }

        const newProductType = new ProductType({
            category,
            type,
            code,
            description,
            date: Date.now()
        });

        const savedProductType = await newProductType.save();
        res.status(201).json({
            success: true,
            message: 'Product type added successfully',
            data: savedProductType
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy danh sách tất cả loại sản phẩm
export const getAllProductTypes = async (req, res) => {
    try {
        const productTypes = await ProductType.find().sort({ date: -1 });
        res.status(200).json({
            success: true,
            data: productTypes
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật loại sản phẩm
export const updateProductType = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, type, code, description } = req.body;

        // Kiểm tra xem code mới có trùng với code của loại sản phẩm khác không
        const existingType = await ProductType.findOne({ 
            code, 
            _id: { $ne: id } 
        });
        if (existingType) {
            return res.status(400).json({
                success: false,
                message: 'Product type code already exists'
            });
        }

        const updatedProductType = await ProductType.findByIdAndUpdate(
            id,
            { category, type, code, description },
            { new: true }
        );

        if (!updatedProductType) {
            return res.status(404).json({
                success: false,
                message: 'Product type not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product type updated successfully',
            data: updatedProductType
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa loại sản phẩm
export const deleteProductType = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProductType = await ProductType.findByIdAndDelete(id);

        if (!deletedProductType) {
            return res.status(404).json({
                success: false,
                message: 'Product type not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product type deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
