import DeliveryPerson from '../models/deliveryPersonModel.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';
// Create new delivery person
const createDeliveryPerson = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;
        const deliveryPerson = await DeliveryPerson.create({
            name,
            phone,
            email,
            address
        });
        res.status(201).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all delivery persons
const getAllDeliveryPersons = async (req, res) => {
    try {
        const deliveryPersons = await DeliveryPerson.find({}).sort({ createdAt: -1 });
        res.status(200).json(deliveryPersons);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get a single delivery person
const getDeliveryPersonById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'Người giao hàng không tồn tại' });
        }
        const deliveryPerson = await DeliveryPerson.findById(id);
        if (!deliveryPerson) {
            return res.status(404).json({ error: 'Người giao hàng không tồn tại' });
        }
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update delivery person
const updateDeliveryPerson = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'Người giao hàng không tồn tại' });
        }
        const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(
            id,
            { ...req.body },
            { new: true }
        );
        if (!deliveryPerson) {
            return res.status(404).json({ error: 'Người giao hàng không tồn tại' });
        }
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete delivery person
const deleteDeliveryPerson = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: 'Người giao hàng không tồn tại' });
        }
        
        // Check if delivery person has any active orders
        const activeOrders = await Order.find({
            deliveryPerson: id,
            status: { $in: ['processing', 'shipping'] }
        });
        
        if (activeOrders.length > 0) {
            return res.status(400).json({ 
                error: 'Không thể xóa người giao hàng đang có đơn hàng đang xử lý'
            });
        }

        const deliveryPerson = await DeliveryPerson.findByIdAndDelete(id);
        if (!deliveryPerson) {
            return res.status(404).json({ error: 'Người giao hàng không tồn tại' });
        }
        res.status(200).json(deliveryPerson);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Assign order to delivery person
const assignOrderToDeliveryPerson = async (req, res) => {
    try {
        const { orderId, deliveryPersonId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId) || 
            !mongoose.Types.ObjectId.isValid(deliveryPersonId)) {
            return res.status(404).json({ error: 'ID không hợp lệ' });
        }

        // Check if delivery person exists
        const deliveryPerson = await DeliveryPerson.findById(deliveryPersonId);
        if (!deliveryPerson) {
            return res.status(404).json({ error: 'Người giao hàng không tồn tại' });
        }

        // Check if order exists and can be assigned
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }
        if (order.status !== 'processing') {
            return res.status(400).json({ error: 'Đơn hàng không thể được gán cho người giao hàng' });
        }

        // Update order with delivery person and change status to shipping
        order.deliveryPerson = deliveryPersonId;
        order.status = 'shipping';
        await order.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update order delivery status
const updateOrderDeliveryStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(404).json({ error: 'ID đơn hàng không hợp lệ' });
        }

        const validStatuses = ['shipping', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Đơn hàng không tồn tại' });
        }

        order.status = status;
        if (status === 'completed' || status === 'cancelled') {
            order.deliveryPerson = null; // Remove delivery person assignment if order is completed or cancelled
        }

        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export {
    createDeliveryPerson,
    getAllDeliveryPersons,
    getDeliveryPersonById,
    updateDeliveryPerson,
    deleteDeliveryPerson,
    assignOrderToDeliveryPerson,
    updateOrderDeliveryStatus
};
