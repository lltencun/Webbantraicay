import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
    createDeliveryPerson,
    getAllDeliveryPersons,
    getDeliveryPersonById,
    updateDeliveryPerson,
    deleteDeliveryPerson,
    assignOrderToDeliveryPerson,
    updateOrderDeliveryStatus
} from '../controllers/deliveryPersonControllers.js';
const router = express.Router();

// Delivery person CRUD routes
router.post('/', adminAuth, createDeliveryPerson);
router.get('/', adminAuth, getAllDeliveryPersons);
router.get('/:id', adminAuth, getDeliveryPersonById);
router.put('/:id', adminAuth, updateDeliveryPerson);
router.delete('/:id', adminAuth, deleteDeliveryPerson);

// Delivery management routes
router.post('/assign-order', adminAuth, assignOrderToDeliveryPerson);
router.put('/update-status', adminAuth, updateOrderDeliveryStatus);

export default router;
