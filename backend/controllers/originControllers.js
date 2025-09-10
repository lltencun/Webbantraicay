import Origin from '../models/originModel.js';

// Thêm nguồn gốc mới
export const addOrigin = async (req, res) => {
    try {
        const newOrigin = new Origin(req.body);
        const savedOrigin = await newOrigin.save();
        res.status(201).json({
            success: true,
            data: savedOrigin
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy tất cả nguồn gốc
export const getAllOrigins = async (req, res) => {
    try {
        const origins = await Origin.find();
        res.status(200).json({
            success: true,
            data: origins
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy nguồn gốc theo ID
export const getOriginById = async (req, res) => {
    try {
        const origin = await Origin.findById(req.params.id);
        if (!origin) {
            return res.status(404).json({
                success: false,
                message: 'Origin not found'
            });
        }
        res.status(200).json({
            success: true,
            data: origin
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật nguồn gốc
export const updateOrigin = async (req, res) => {
    try {
        const updatedOrigin = await Origin.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedOrigin) {
            return res.status(404).json({
                success: false,
                message: 'Origin not found'
            });
        }
        res.status(200).json({
            success: true,
            data: updatedOrigin
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa nguồn gốc
export const deleteOrigin = async (req, res) => {
    try {
        const deletedOrigin = await Origin.findByIdAndDelete(req.params.id);
        if (!deletedOrigin) {
            return res.status(404).json({
                success: false,
                message: 'Origin not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Origin deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
